# INDEX.md — 프로젝트 구조·요구사항 목차

> 가이드 #6: "Index.md에 프로젝트 구조/요구사항 목차로 정리해 문맥 유지."
> 새 폴더/요구사항이 추가되면 본 파일 먼저 갱신.

## 0. 목적

(주)인터로이드 "LLM 챗봇/콜봇 개발자" 공고 지원용 풀 포트폴리오 웹앱.
공고의 모든 자격요건/우대사항을 한 화면에서 시연 가능하도록 구성.

## 1. 공고 ↔ 구현 매핑

| 공고 항목 | 구현 위치 |
|---|---|
| LLM 기반 챗봇/콜봇 개발 | 전체 |
| 챗봇 Python 코딩 (Dialogue Management) | `backend/app/chatbot/dialogue.py`, `backend/app/callbot/scenario.py` |
| 프롬프트 엔지니어링 | `backend/app/chatbot/prompts.py`, `backend/app/callbot/prompts.py` |
| RAG 연동 Vector DB | `backend/app/rag/` (Chroma) |
| STT + LLM + TTS 통합 | `backend/app/callbot/agent.py` (LiveKit + Google STT/TTS + Gemini) |
| OB 콜봇 시나리오, 여론조사 콜봇 | VoxPoll 시장조사 OB 시나리오 (`docs/survey-scenario.md`) |
| LLM API 연동 (Gemini) | `backend/app/llm/gemini.py` |
| LiveKit 경험 (우대) | `backend/app/callbot/agent.py`, `frontend/app/call/` |

## 2. 디렉토리 트리 (요약)

```
chatbot/
├── README.md             # 포트폴리오 소개
├── CLAUDE.md             # AI 컨텍스트
├── DESIGN.md             # 디자인 시스템
├── INDEX.md              # 본 문서
├── docs/                 # 아키텍처·시나리오·코퍼스 출처
├── backend/              # FastAPI + LiveKit Agent
│   ├── app/
│   │   ├── chatbot/      # RAG 챗봇
│   │   ├── callbot/      # OB 설문 콜봇
│   │   ├── rag/          # 임베딩/Chroma
│   │   ├── llm/          # Gemini 클라이언트
│   │   └── api/          # REST 엔드포인트
│   └── data/             # 코퍼스(인터로이드/제품)
├── frontend/             # Next.js + Tailwind
│   └── app/{chat,call,dashboard}/
└── infra/                # docker-compose
```

## 3. 빌드 페이즈

- **Phase 0**: 스캐폴딩 + 문서 (현재)
- **Phase 1**: 챗봇 RAG (인터로이드 회사소개)
- **Phase 2**: 콜봇 (VoxPoll 시장조사 OB)
- **Phase 3**: 결과 대시보드 + 포트폴리오 정리

## 4. 외부 의존

- Gemini API (`GEMINI_API_KEY`)
- Google Cloud Speech-to-Text v2 (`GOOGLE_APPLICATION_CREDENTIALS`)
- Google Cloud Text-to-Speech (한국어 Neural2 보이스 우선)
- LiveKit Cloud or self-hosted (`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`)

## 5. 비기능 요구

- 응답 시작 지연 ≤ 1.5초 (챗 스트리밍, 콜봇 첫 음성)
- 한국어 자연스러움 우선 (gemini-2.5-flash 한국어 평가 양호)
- 모든 통화 자막 표시(접근성)
- 응답 데이터는 로컬 SQLite (시연용; 프로덕션 시 PostgreSQL로 교체 가능 구조)
