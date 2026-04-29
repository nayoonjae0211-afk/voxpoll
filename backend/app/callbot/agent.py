"""VoxPoll OB 콜봇 — LiveKit Agent.

실행:
    python -m app.callbot.agent dev          # 로컬 개발 (LiveKit 콜에 자동 합류)
    python -m app.callbot.agent download-files  # 모델 자산 미리 다운로드(silero VAD)
"""
from __future__ import annotations

import asyncio
import json
import logging
from typing import Annotated

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    RunContext,
    WorkerOptions,
    cli,
    function_tool,
)
from livekit.plugins import google, silero

from app.callbot.prompts import (
    GREETING_INSTRUCTION,
    PERSONA_INSTRUCTIONS,
    step_instructions,
)
from app.callbot.results import (
    end_session,
    init_db,
    record_answer as db_record_answer,
    upsert_session,
)
from app.callbot.scenario import SCENARIO, get_step, next_step_id
from app.config import BACKEND_ROOT, get_settings


load_dotenv(BACKEND_ROOT / ".env")
logger = logging.getLogger("voxpoll-agent")


def _build_full_instructions(current_step_id: str | None) -> str:
    """페르소나 + 현재 단계 가이드 + 전체 시나리오 개요."""
    overview = "\n".join(
        f"- {s.id}: {s.title} ({s.expect})" for s in SCENARIO
    )
    blocks = [
        PERSONA_INSTRUCTIONS,
        "\n# 전체 시나리오 단계",
        overview,
    ]
    if current_step_id:
        step = get_step(current_step_id)
        if step is not None:
            blocks.append("\n" + step_instructions(step))
    return "\n".join(blocks)


class SurveyAgent(Agent):
    def __init__(self, session_id: str) -> None:
        self.session_id = session_id
        self.current_step_id: str = "intro"
        self.last_value: object = None
        super().__init__(instructions=_build_full_instructions(self.current_step_id))

    @function_tool
    async def record_answer(
        self,
        context: RunContext,
        step_id: Annotated[str, "현재 시나리오 단계 ID (예: intro, q1_role, q5_aware)"],
        raw_text: Annotated[str, "응답자가 한 말의 원문"],
        value_json: Annotated[
            str,
            "분류된 값을 JSON 문자열로. bool→true/false, int→정수, enum→문자열, multi_label→배열",
        ],
    ) -> str:
        """현재 단계의 응답을 분류된 값과 함께 저장한다."""
        try:
            value = json.loads(value_json)
        except json.JSONDecodeError:
            value = value_json
        await db_record_answer(self.session_id, step_id, raw_text, value)
        self.last_value = value
        logger.info("recorded %s = %r", step_id, value)
        return "saved"

    @function_tool
    async def advance_step(self, context: RunContext) -> str:
        """다음 단계로 진행한다. 반환된 가이드를 따라 다음 발화를 생성한다."""
        nxt = next_step_id(self.current_step_id, self.last_value)
        if nxt == "__end__":
            return (
                "[시나리오 종료 조건] 정중히 마무리 인사를 한 뒤 end_call 도구를 호출하세요."
            )
        self.current_step_id = nxt
        step = get_step(nxt)
        assert step is not None
        await self.update_instructions(_build_full_instructions(nxt))
        return (
            f"[다음 단계 = {step.id} · {step.title}]\n"
            f"이번 발화: {step.bot_say}\n"
            f"응답 형태: {step.expect}\n"
            f"분류 후보: {step.enum_values or '없음'}\n"
            f"분류 기준: {step.classify_hint}\n"
            "발화하고, 응답을 들은 뒤 record_answer + advance_step 순서로 호출하세요."
        )

    @function_tool
    async def end_call(self, context: RunContext) -> str:
        """통화를 종료하고 세션을 닫는다."""
        completed = self.current_step_id in {"q10_nps", "outro"}
        await end_session(self.session_id, completed=completed)
        # 마지막 인사가 끝난 직후 룸 디스커넥트.
        asyncio.create_task(self._disconnect_soon(context))
        return "ending"

    async def _disconnect_soon(self, context: RunContext) -> None:
        await asyncio.sleep(2.5)
        try:
            await context.session.aclose()
        except Exception:
            pass


async def entrypoint(ctx: JobContext) -> None:
    await init_db()
    await ctx.connect()
    session_id = ctx.room.name
    await upsert_session(session_id)
    logger.info("agent connected to room=%s", session_id)

    s = get_settings()
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=google.STT(languages=["ko-KR"], detect_language=False),
        llm=google.LLM(
            model=s.gemini_model_fast,
            temperature=0.4,
            api_key=s.gemini_api_key,
        ),
        tts=google.TTS(
            language="ko-KR",
            # 스트리밍 합성은 Chirp 3 HD 보이스만 지원됨.
            voice_name="ko-KR-Chirp3-HD-Achernar",
        ),
    )
    await session.start(agent=SurveyAgent(session_id), room=ctx.room)
    await session.generate_reply(instructions=GREETING_INSTRUCTION)


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))


if __name__ == "__main__":
    main()
