"""VoxPoll 시장조사 OB 콜봇 시나리오.

docs/survey-scenario.md 의 흐름을 코드로 정의.
시나리오는 단계(Step) 시퀀스로 표현되며, Dialogue Manager가 단계 진행 + 응답 분류를 담당.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal


AnswerKind = Literal["bool", "enum", "text", "int", "category", "multi_label"]


@dataclass(slots=True)
class Step:
    id: str
    title: str
    bot_say: str
    expect: AnswerKind
    classify_hint: str = ""
    enum_values: list[str] = field(default_factory=list)
    next_step_logic: str = ""
    end_on: list[str] = field(default_factory=list)
    optional: bool = False


SCENARIO: list[Step] = [
    Step(
        id="intro",
        title="인사 + 동의",
        bot_say=(
            "안녕하세요, AI 콜봇 설문조사 서비스 VoxPoll입니다. "
            "B2B 마케팅·리서치 담당자분들께 짧은 시장조사 차 연락드렸습니다. "
            "5분 정도 괜찮으실까요?"
        ),
        expect="bool",
        classify_hint="응답자가 인터뷰에 동의했는지 여부. '예/네/괜찮아요'는 True, '바빠요/아니오/안돼요'는 False.",
        next_step_logic="동의 시 q1_role, 거절 시 outro_decline",
        end_on=["outro_decline"],
    ),
    Step(
        id="q1_role",
        title="직무 확인",
        bot_say="혹시 마케팅, 시장조사, 또는 데이터 분석 관련 업무를 맡고 계신가요?",
        expect="bool",
        classify_hint="해당 분야 종사자라면 True, 아니라면 False.",
        next_step_logic="True → q2_outsource, False → outro_unqualified",
        end_on=["outro_unqualified"],
    ),
    Step(
        id="q2_outsource",
        title="외주 빈도",
        bot_say="현재 시장조사나 설문조사를 외주로 진행하시는 경우가 얼마나 자주 있으신가요?",
        expect="enum",
        enum_values=["월 1회 이상", "분기별", "연 1~2회", "거의 없음"],
        classify_hint="응답자의 발화에서 가장 가까운 빈도 카테고리를 선택.",
    ),
    Step(
        id="q3_budget",
        title="예산 규모",
        bot_say="한 번 외주 진행하실 때 보통 어느 정도 예산이 드시나요?",
        expect="text",
        classify_hint="자유응답을 그대로 저장하되 가능하면 '천만원/억원' 단위 정량 추정도 함께.",
    ),
    Step(
        id="q4_pain",
        title="Pain Point",
        bot_say="지금 진행 방식에서 가장 아쉬운 점이 있다면 어떤 부분일까요?",
        expect="category",
        enum_values=["비용", "속도", "품질", "응답률", "기타"],
        classify_hint="자유응답 텍스트를 카테고리 하나로 분류 + 원문도 보존.",
    ),
    Step(
        id="q5_aware",
        title="AI 콜봇 인지",
        bot_say="AI 콜봇으로 설문조사를 진행하는 서비스를 들어보신 적 있으세요?",
        expect="bool",
        classify_hint="알고 있다 True, 처음 듣는다 False.",
    ),
    Step(
        id="q6_concept",
        title="컨셉 반응",
        bot_say=(
            "저희 VoxPoll은 AI 콜봇이 자동으로 응답자에게 전화를 걸어 1만 명 단위 조사를 "
            "24시간 안에 끝내드립니다. 이런 서비스 어떻게 들리세요?"
        ),
        expect="enum",
        enum_values=["긍정", "중립", "부정"],
        classify_hint="응답의 톤·내용으로 분류. 모호하면 중립.",
    ),
    Step(
        id="q7_concern",
        title="우려 사항",
        bot_say="혹시 사용해보신다면 어떤 부분이 가장 걱정되실까요?",
        expect="multi_label",
        enum_values=["품질", "응답률", "규제", "응대톤", "가격", "데이터", "기타"],
        classify_hint="응답에서 언급된 우려 카테고리를 모두 선택(멀티라벨).",
    ),
    Step(
        id="q8_price",
        title="가격 수용성",
        bot_say="월 49만 원에 1만 응답까지 가능한 요금제라면 도입을 검토해보실 만하실까요?",
        expect="enum",
        enum_values=["매우 긍정", "긍정", "중립", "부정", "매우 부정"],
        classify_hint="가격 수용도 5단계 분류.",
    ),
    Step(
        id="q9_trial",
        title="시범 사용 의향",
        bot_say="만약 무료로 1회 시범 제공해드린다면 한번 사용해보시겠어요?",
        expect="bool",
        classify_hint="긍정 시 True, 거절 시 False. 모호하면 False.",
    ),
    Step(
        id="q10_nps",
        title="조사 만족도(NPS)",
        bot_say="마지막으로 오늘 조사 자체에 대한 만족도를 0점에서 10점 사이로 평가해주실 수 있을까요?",
        expect="int",
        classify_hint="0~10 사이 정수. 응답자가 점수를 안 주면 -1.",
    ),
    Step(
        id="outro",
        title="감사 인사",
        bot_say="도와주셔서 정말 감사드립니다. 좋은 하루 되세요.",
        expect="text",
        optional=True,
        classify_hint="추가 발화 있으면 텍스트 저장, 없으면 빈 문자열.",
    ),
]


# 단계별 기본 다음 스텝(분기 미적용 시) 매핑.
DEFAULT_FLOW: dict[str, str] = {
    "intro": "q1_role",
    "q1_role": "q2_outsource",
    "q2_outsource": "q3_budget",
    "q3_budget": "q4_pain",
    "q4_pain": "q5_aware",
    "q5_aware": "q6_concept",
    "q6_concept": "q7_concern",
    "q7_concern": "q8_price",
    "q8_price": "q9_trial",
    "q9_trial": "q10_nps",
    "q10_nps": "outro",
    "outro": "__end__",
}


def get_step(step_id: str) -> Step | None:
    for s in SCENARIO:
        if s.id == step_id:
            return s
    return None


def next_step_id(current: str, answer_value: object) -> str:
    """분기 규칙 적용. intro·q1_role 두 곳만 명시적 분기."""
    if current == "intro" and answer_value is False:
        return "__end__"  # 거절 시 즉시 종료
    if current == "q1_role" and answer_value is False:
        return "__end__"  # 비대상자 종료
    return DEFAULT_FLOW.get(current, "__end__")
