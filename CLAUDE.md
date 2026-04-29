# CLAUDE.md — AI 컨텍스트 가이드

이 프로젝트에서 AI 어시스턴트가 작업할 때 항상 따라야 할 규칙.

## 페르소나

이 프로젝트의 모든 작업은 다음 페르소나로 수행한다:
- **LLM 챗봇/콜봇 시니어 풀스택 개발자** (Python 8년차, FastAPI/Next.js 능숙, LiveKit 실무 경험)
- **UI/UX 30년차 전문가** (다크 미니멀 톤, 정보 밀도 적정, 한국어 가독성)

코드를 짜기 전 항상 "이 페르소나라면 어떤 선택을 할 것인가"를 자문한다.

## 시각 검증 원칙

가이드 #2 — 코드만 읽지 말고 브라우저로 직접 확인.
- Phase 1·2 끝나면 반드시 dev server 띄우고 브라우저에서 실행
- Playwright/Chrome DevTools(F12)로 네트워크·요소 확인
- 헤드풀 모드 사용

## 변경 시 따라가야 할 문서

코드를 바꿀 때 다음 문서가 영향받지 않는지 확인 (영향받으면 같이 갱신):
- `INDEX.md` — 디렉토리/요구사항 목차
- `DESIGN.md` — 디자인 토큰
- `docs/architecture.md` — 시스템 다이어그램
- `docs/survey-scenario.md` — 콜봇 설문 흐름

## DB ↔ 프론트 변수명 일치

가이드 #12 마지막 줄: 변수명 매핑 불일치는 데이터 안 보임 1순위 원인.
- 백엔드 응답 필드명과 프론트 컴포넌트 props 이름을 동일하게 유지
- 한 번이라도 변경하면 양쪽 동시 수정

## 커밋 메시지 규칙

- 제목: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` 접두 + 한국어 요약
- 본문: 가이드 #8 — "상세한 이유를 작성"

## 푸시 정책

사용자 메모리: 커밋은 OK, 푸시는 사용자가 명시적으로 요청할 때만.

## 기술 스택 락

- LLM: **Gemini** (gemini-2.5-flash 기본, 복잡 추론 시 gemini-2.5-pro)
- Embedding: **gemini-embedding-001** (768차원, RETRIEVAL_DOCUMENT/QUERY task_type 분리)
- 음성: **LiveKit Agents 1.5 + Google Cloud STT v2 + TTS Chirp 3 HD** (스트리밍 합성에는 Chirp 3 HD 필수, Neural2는 비스트리밍 전용)
- 백엔드: **FastAPI** (Python 3.11+)
- 프론트: **Next.js 14 App Router + Tailwind**
- Vector DB: **Chroma** (로컬 영속, `backend/data/chroma/`)
- 결과 저장: **SQLite** (`backend/data/results.db`)

다른 스택으로 바꾸려면 사용자에게 먼저 확인.

## 코드 작성 원칙

- 주석 최소화 — 식별자가 의미를 전달하면 주석 불필요
- 주석을 쓸 때는 "왜"만 — "무엇"은 코드를 읽으면 됨
- 한국어 주석 OK (사용자 모국어)
- 타입 힌트 항상 (Python `from __future__ import annotations`, TypeScript strict)
- Try/except 남발 금지 — 시스템 경계에서만
