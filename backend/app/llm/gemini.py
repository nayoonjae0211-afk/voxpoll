from __future__ import annotations

from collections.abc import AsyncIterator, Iterable
from functools import lru_cache

from google import genai
from google.genai import types

from app.config import get_settings


@lru_cache
def get_client() -> genai.Client:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY가 설정되지 않았습니다. backend/.env 확인.")
    return genai.Client(api_key=settings.gemini_api_key)


async def embed(
    texts: Iterable[str],
    *,
    task_type: str = "RETRIEVAL_DOCUMENT",
    output_dimensionality: int = 768,
) -> list[list[float]]:
    """문서/쿼리를 임베딩.

    task_type 분리(DOCUMENT vs QUERY)는 한국어 검색 변별력에 큰 차이를 만든다.
    """
    settings = get_settings()
    client = get_client()
    config = types.EmbedContentConfig(
        task_type=task_type,
        output_dimensionality=output_dimensionality,
    )
    response = await client.aio.models.embed_content(
        model=settings.embedding_model,
        contents=list(texts),
        config=config,
    )
    return [list(e.values) for e in response.embeddings]


async def stream_chat(
    *,
    system_instruction: str,
    history: list[types.Content],
    user_message: str,
    model: str | None = None,
    temperature: float = 0.4,
) -> AsyncIterator[str]:
    """대화 이력 + 사용자 메시지로 응답 토큰을 스트리밍.

    history는 [user, assistant, user, ...] 순서로 들어온다.
    """
    settings = get_settings()
    client = get_client()
    contents = [*history, types.Content(role="user", parts=[types.Part(text=user_message)])]

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=temperature,
    )

    stream = await client.aio.models.generate_content_stream(
        model=model or settings.gemini_model_fast,
        contents=contents,
        config=config,
    )
    async for chunk in stream:
        if chunk.text:
            yield chunk.text


def to_history(messages: list[dict[str, str]]) -> list[types.Content]:
    """프론트의 {role, content} 리스트를 google-genai Content로 변환.

    role: "user" | "assistant" — assistant는 google-genai의 "model" 역할.
    """
    out: list[types.Content] = []
    for m in messages:
        role = "user" if m["role"] == "user" else "model"
        out.append(types.Content(role=role, parts=[types.Part(text=m["content"])]))
    return out
