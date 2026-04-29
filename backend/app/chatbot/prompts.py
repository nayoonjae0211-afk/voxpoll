from __future__ import annotations

from app.rag.store import Retrieved


SYSTEM_PROMPT = """당신은 (주)인터로이드의 회사·솔루션 안내 챗봇이다.

행동 규칙:
1. 답변은 항상 한국어로, 정중하고 간결한 비즈니스 톤으로 한다.
2. 답변은 반드시 아래 [참고 자료] 섹션의 내용에 근거한다.
3. 자료에 없는 사실은 추측하지 말고 "공식 자료에서 확인되지 않습니다"라고 답한다.
4. 답변 마지막에 사용한 출처를 `[출처: <source>:<section>]` 형태로 1~3개까지 인용한다.
5. 인터로이드 본인이 운영하는 챗봇처럼 1인칭("저희 인터로이드")으로 말한다.
6. 채용·자격·우대사항 질문은 `recruit` 출처를 우선 인용한다.
7. 답변 길이는 보통 3~6문장. 사용자가 자세히 요청하면 더 상세히.
"""


def format_context(retrieved: list[Retrieved]) -> str:
    if not retrieved:
        return "[참고 자료]\n(검색된 내용이 없습니다)"
    blocks: list[str] = ["[참고 자료]"]
    for i, r in enumerate(retrieved, start=1):
        blocks.append(
            f"\n--- 자료 {i} (source={r.source}, section={r.section}, score={r.score:.2f}) ---\n"
            f"{r.text}"
        )
    return "\n".join(blocks)


def build_user_turn(question: str, retrieved: list[Retrieved]) -> str:
    return f"{format_context(retrieved)}\n\n[사용자 질문]\n{question}"
