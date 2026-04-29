from __future__ import annotations

import json
from collections import Counter
from typing import Any

from fastapi import APIRouter, HTTPException

from app.callbot.results import (
    init_db,
    list_sessions,
    session_detail,
)


router = APIRouter(prefix="/api/results", tags=["results"])


@router.get("/sessions")
async def get_sessions(limit: int = 50) -> dict[str, Any]:
    await init_db()
    items = await list_sessions(limit=limit)
    return {"items": items}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> dict[str, Any]:
    await init_db()
    detail = await session_detail(session_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    return detail


@router.get("/summary")
async def get_summary() -> dict[str, Any]:
    """대시보드용 집계.

    - 총 세션 수, 완료율
    - 단계별 도달률 (퍼널)
    - 핵심 enum 분포 (q4_pain, q6_concept, q8_price)
    - NPS 분포
    """
    await init_db()
    sessions = await list_sessions(limit=1000)
    total = len(sessions)
    if total == 0:
        return {"total": 0, "items": []}

    completed = sum(1 for s in sessions if s["completed"])
    consents = sum(1 for s in sessions if s["consent"] == 1)
    qualified = sum(1 for s in sessions if s["qualified"] == 1)

    # 단계별 도달률
    step_order = [
        "intro", "q1_role", "q2_outsource", "q3_budget", "q4_pain",
        "q5_aware", "q6_concept", "q7_concern", "q8_price",
        "q9_trial", "q10_nps", "outro",
    ]
    step_count: Counter[str] = Counter()
    for s in sessions:
        last = s.get("last_step")
        if last in step_order:
            idx = step_order.index(last)
            for sid in step_order[: idx + 1]:
                step_count[sid] += 1

    # enum 분포
    enum_buckets: dict[str, Counter[str]] = {
        "q4_pain": Counter(),
        "q6_concept": Counter(),
        "q8_price": Counter(),
    }
    nps_scores: list[int] = []

    for s in sessions:
        detail = await session_detail(s["id"])
        if detail is None:
            continue
        for a in detail["answers"]:
            sid = a["step_id"]
            v = a["value"]
            if sid in enum_buckets and isinstance(v, str):
                enum_buckets[sid][v] += 1
            if sid == "q10_nps" and isinstance(v, int) and 0 <= v <= 10:
                nps_scores.append(v)

    return {
        "total": total,
        "completed": completed,
        "completion_rate": round(completed / total, 3) if total else 0,
        "consent_count": consents,
        "qualified_count": qualified,
        "funnel": [{"step": sid, "count": step_count.get(sid, 0)} for sid in step_order],
        "distributions": {
            k: [{"label": label, "count": cnt} for label, cnt in v.most_common()]
            for k, v in enum_buckets.items()
        },
        "nps": {
            "scores": nps_scores,
            "mean": round(sum(nps_scores) / len(nps_scores), 2) if nps_scores else None,
            "count": len(nps_scores),
        },
    }
