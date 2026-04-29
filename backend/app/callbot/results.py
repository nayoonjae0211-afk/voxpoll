"""콜봇 응답 영속.

각 통화 = SurveySession 1행. 단계별 응답은 SurveyAnswer N행.
대시보드는 두 테이블을 조인해 통계 산출.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    select,
)
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, relationship

from app.config import get_settings


class Base(DeclarativeBase):
    pass


class SurveySession(Base):
    __tablename__ = "survey_sessions"

    id = Column(String, primary_key=True)  # LiveKit room name = session id
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime(timezone=True), nullable=True)
    last_step = Column(String, nullable=True)
    completed = Column(Integer, default=0)  # 1 if reached q10 or outro
    consent = Column(Integer, nullable=True)  # 1/0
    qualified = Column(Integer, nullable=True)
    nps = Column(Integer, nullable=True)
    notes = Column(Text, default="")

    answers = relationship(
        "SurveyAnswer",
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class SurveyAnswer(Base):
    __tablename__ = "survey_answers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("survey_sessions.id", ondelete="CASCADE"), index=True)
    step_id = Column(String, index=True)
    raw_text = Column(Text, default="")
    value_json = Column(Text, default="")  # 분류 결과를 JSON 문자열로
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("SurveySession", back_populates="answers")


_engine = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None


def _get_engine():
    global _engine, _sessionmaker
    if _engine is None:
        s = get_settings()
        path = s.results_db_abs
        path.parent.mkdir(parents=True, exist_ok=True)
        url = f"sqlite+aiosqlite:///{path.as_posix()}"
        _engine = create_async_engine(url, echo=False, future=True)
        _sessionmaker = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine, _sessionmaker


async def init_db() -> None:
    engine, _ = _get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def upsert_session(session_id: str) -> None:
    _, sm = _get_engine()
    assert sm is not None
    async with sm() as db:
        existing = await db.get(SurveySession, session_id)
        if existing is None:
            db.add(SurveySession(id=session_id))
            await db.commit()


async def record_answer(
    session_id: str,
    step_id: str,
    raw_text: str,
    value: Any,
) -> None:
    _, sm = _get_engine()
    assert sm is not None
    async with sm() as db:
        sess = await db.get(SurveySession, session_id)
        if sess is None:
            sess = SurveySession(id=session_id)
            db.add(sess)
            await db.flush()

        sess.last_step = step_id
        if step_id == "intro" and isinstance(value, bool):
            sess.consent = 1 if value else 0
        elif step_id == "q1_role" and isinstance(value, bool):
            sess.qualified = 1 if value else 0
        elif step_id == "q10_nps" and isinstance(value, int):
            sess.nps = value

        db.add(
            SurveyAnswer(
                session_id=session_id,
                step_id=step_id,
                raw_text=raw_text or "",
                value_json=json.dumps(value, ensure_ascii=False),
            )
        )
        await db.commit()


async def end_session(session_id: str, *, completed: bool) -> None:
    _, sm = _get_engine()
    assert sm is not None
    async with sm() as db:
        sess = await db.get(SurveySession, session_id)
        if sess is None:
            return
        sess.ended_at = datetime.now(timezone.utc)
        sess.completed = 1 if completed else 0
        await db.commit()


async def list_sessions(limit: int = 50) -> list[dict]:
    _, sm = _get_engine()
    assert sm is not None
    async with sm() as db:
        rows = (
            await db.execute(
                select(SurveySession).order_by(SurveySession.started_at.desc()).limit(limit)
            )
        ).scalars().all()
        return [
            {
                "id": r.id,
                "started_at": r.started_at.isoformat() if r.started_at else None,
                "ended_at": r.ended_at.isoformat() if r.ended_at else None,
                "last_step": r.last_step,
                "completed": bool(r.completed),
                "consent": r.consent,
                "qualified": r.qualified,
                "nps": r.nps,
                "answer_count": len(r.answers),
            }
            for r in rows
        ]


async def session_detail(session_id: str) -> dict | None:
    _, sm = _get_engine()
    assert sm is not None
    async with sm() as db:
        r = await db.get(SurveySession, session_id)
        if r is None:
            return None
        return {
            "id": r.id,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "ended_at": r.ended_at.isoformat() if r.ended_at else None,
            "last_step": r.last_step,
            "completed": bool(r.completed),
            "consent": r.consent,
            "qualified": r.qualified,
            "nps": r.nps,
            "answers": [
                {
                    "step_id": a.step_id,
                    "raw_text": a.raw_text,
                    "value": json.loads(a.value_json) if a.value_json else None,
                    "created_at": a.created_at.isoformat(),
                }
                for a in r.answers
            ],
        }
