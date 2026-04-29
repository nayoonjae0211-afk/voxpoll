"""챗봇 Dialogue Manager.

챗봇 한 턴의 흐름:
  사용자 메시지 → RAG.search → 시스템 프롬프트 + 인용 컨텍스트 → Gemini 스트리밍 → 응답
이력은 사용자 측에서 보관(상태리스 백엔드).
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from dataclasses import dataclass

from app.chatbot.prompts import SYSTEM_PROMPT, build_user_turn
from app.llm.gemini import stream_chat, to_history
from app.rag.store import Retrieved, search


COLLECTION = "interloid"
TOP_K = 10


@dataclass(slots=True)
class Citation:
    source: str
    section: str
    score: float

    @classmethod
    def from_retrieved(cls, r: Retrieved) -> "Citation":
        return cls(source=r.source, section=r.section, score=r.score)


async def run_turn(
    question: str,
    history: list[dict[str, str]],
) -> tuple[AsyncIterator[str], list[Citation]]:
    """RAG 검색 + LLM 스트리밍.

    반환: (토큰 스트림, 인용 메타데이터)
    인용은 검색 직후 확정되므로 응답 토큰과 별개 채널로 프론트에 전송 가능.
    """
    retrieved = await search(COLLECTION, question, top_k=TOP_K)
    citations = [Citation.from_retrieved(r) for r in retrieved]

    user_turn = build_user_turn(question, retrieved)
    gemini_history = to_history(history)

    stream = stream_chat(
        system_instruction=SYSTEM_PROMPT,
        history=gemini_history,
        user_message=user_turn,
    )
    return stream, citations
