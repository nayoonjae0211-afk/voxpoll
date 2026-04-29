# VoxPoll — 인터로이드 LLM 챗봇/콜봇 포트폴리오

> (주)인터로이드 "LLM 기반 챗봇/콜봇 개발자" 공고 지원 포트폴리오.
> 한 화면에서 **RAG 챗봇**과 **OB 설문조사 콜봇**을 동시에 시연하도록 설계.

## 데모 구성

| 영역 | 설명 |
|---|---|
| **챗봇** (`/chat`) | 인터로이드 회사 자료를 RAG로 인덱싱한 회사소개 봇 |
| **콜봇** (`/call`) | 가상 신제품 *VoxPoll(자동 설문 SaaS)* 시장조사 OB 콜 |
| **대시보드** (`/dashboard`) | 콜봇 응답 집계·문항별 분포·녹취 다운로드 |

## 기술 스택

- **LLM**: Gemini 2.5 Flash (기본), 2.5 Pro (옵션)
- **Embedding**: `gemini-embedding-001` (768차원, task_type 분리)
- **음성**: LiveKit Agents 1.5 + Google Cloud STT v2 + TTS **Chirp 3 HD** (`ko-KR-Chirp3-HD-Achernar`)
- **VAD**: Silero (로컬)
- **백엔드**: FastAPI 0.136 + Uvicorn, Python 3.11+
- **프론트**: Next.js 14 App Router + Tailwind CSS + Recharts
- **Vector DB**: Chroma (로컬 영속)
- **저장**: SQLite (응답·세션 메타)

## 공고 요건 ↔ 구현 매핑

| 공고 항목 | 위치 |
|---|---|
| LLM 기반 챗봇/콜봇 | 전체 |
| 챗봇 Python 코딩 (Dialogue Management) | `backend/app/chatbot/dialogue.py`, `backend/app/callbot/scenario.py` |
| 프롬프트 엔지니어링 | `backend/app/*/prompts.py` |
| RAG 연동 Vector DB | `backend/app/rag/` |
| STT + LLM + TTS 통합 | `backend/app/callbot/agent.py` |
| OB/여론조사 콜봇 시나리오 | `docs/survey-scenario.md` |
| LiveKit 경험 (우대) | `backend/app/callbot/agent.py`, `frontend/app/call/` |

## 실행

### 0) 키 준비
- **Gemini API 키** — https://aistudio.google.com (Spending limit 풀어둘 것)
- **GCP Service Account JSON** — Speech-to-Text + Text-to-Speech 권한 → `backend/service-account.json`
- **GCP에서 두 API 활성화** — Speech-to-Text, Text-to-Speech
- **LiveKit Cloud 키쌍** — https://cloud.livekit.io (free tier OK)

### 1) `backend/.env` 작성
```ini
GEMINI_API_KEY=...
GEMINI_MODEL_FAST=gemini-2.5-flash
GEMINI_MODEL_PRO=gemini-2.5-pro
EMBEDDING_MODEL=gemini-embedding-001

GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GOOGLE_CLOUD_PROJECT=<your-gcp-project-id>

LIVEKIT_URL=wss://<your-project>.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

CORS_ORIGINS=http://localhost:3000
```

### 2) 백엔드 (3개 프로세스)
```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # Windows; macOS/Linux는 .venv/bin/pip

# 인덱싱(최초 1회 또는 코퍼스 변경 시)
python -m app.rag.ingest --reset

# API 서버
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# 콜봇 워커 (새 터미널)
python -m app.callbot.agent dev
```

### 3) 프론트엔드
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

### 4) 시연
- `/` 랜딩 → 공고 요건 매핑 + 데모 카드
- `/chat` → 인터로이드 회사 챗봇 (RAG)
- `/call` → 전화 받기 → 한국어 음성 시장조사
- `/dashboard` → 응답 집계 + 단계 퍼널 + 분포 차트

## 문서

- [`INDEX.md`](INDEX.md) — 프로젝트 구조·요구사항 목차
- [`DESIGN.md`](DESIGN.md) — 디자인 시스템
- [`CLAUDE.md`](CLAUDE.md) — AI 어시스턴트 가이드
- [`docs/architecture.md`](docs/architecture.md) — 시스템 아키텍처
- [`docs/survey-scenario.md`](docs/survey-scenario.md) — 콜봇 설문 흐름
- [`docs/interloid-corpus.md`](docs/interloid-corpus.md) — 챗봇 코퍼스 출처

## 라이선스

이력서/포트폴리오 제출용 비상업 데모.
