from __future__ import annotations

import json
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app.chatbot.dialogue import run_turn


router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list)


@router.post("")
async def chat(req: ChatRequest) -> EventSourceResponse:
    """SSE 스트리밍.

    이벤트 시퀀스:
      1) `citations` — 검색된 출처 리스트 (응답 시작 전)
      2) `delta` × N  — 모델 응답 토큰
      3) `done` — 종료 신호
    """
    stream, citations = await run_turn(
        question=req.question,
        history=[m.model_dump() for m in req.history],
    )

    async def event_gen():
        yield {
            "event": "citations",
            "data": json.dumps(
                [
                    {"source": c.source, "section": c.section, "score": c.score}
                    for c in citations
                ],
                ensure_ascii=False,
            ),
        }
        async for piece in stream:
            yield {"event": "delta", "data": piece}
        yield {"event": "done", "data": "1"}

    return EventSourceResponse(event_gen())
