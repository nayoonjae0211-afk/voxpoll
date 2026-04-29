# 아키텍처

## 전체 구성

```
┌──────────────────┐       ┌──────────────────────────┐
│  Next.js (3000)  │       │  FastAPI (8000)          │
│  - /chat         │ HTTP  │  - /api/chat (SSE)       │
│  - /call         │──────▶│  - /api/livekit/token    │
│  - /dashboard    │       │  - /api/results          │
└────────┬─────────┘       └──────────┬───────────────┘
         │                            │
         │ WebRTC                     │ Embed/Search
         ▼                            ▼
┌──────────────────┐       ┌──────────────────────────┐
│  LiveKit Server  │       │  Chroma (local)          │
│  (Cloud or self) │       │  - interloid 코퍼스       │
└────────┬─────────┘       │  - product 코퍼스         │
         │                 └──────────────────────────┘
         │ Room
         ▼
┌──────────────────────────────────────────────────────┐
│  LiveKit Agent (Python, 별도 프로세스)                │
│  - Google STT v2 (스트리밍)                           │
│  - Gemini LLM (Dialogue Manager + 시나리오 분기)      │
│  - Google TTS Neural2 (ko-KR)                         │
│  - 응답 → SQLite                                      │
└──────────────────────────────────────────────────────┘
```

## 컴포넌트별 책임

### Frontend
- 챗봇 UI: 메시지 스트림 표시, 출처 인용
- 콜봇 UI: LiveKit Client SDK로 룸 입장, 시각화, 자막
- 대시보드: 응답 집계 차트(`recharts`)

### FastAPI
- `/api/chat`: RAG 검색 + Gemini 호출 + SSE 스트리밍 응답
- `/api/livekit/token`: 사용자별 LiveKit JWT 발급
- `/api/results`: 콜봇 응답 조회/집계
- 챗봇 Dialogue Manager는 FastAPI 안에서 동작 (콜봇은 Agent 프로세스에)

### LiveKit Agent
- 별도 Python 프로세스(`python -m app.callbot.agent dev`)
- 사용자가 콜룸에 입장하면 Agent가 자동 합류
- 시나리오 진행 + 자유 응답 수집 + 결과 저장

### Chroma
- 로컬 파일 영속 (`backend/data/chroma/`)
- 컬렉션: `interloid`(챗봇), `voxpoll`(콜봇 제품 자료)

## 데이터 흐름

### 챗봇 한 턴
```
사용자 입력 → /api/chat
  → RAG.search(query, top_k=5) → 인용 문서
  → Gemini(system + 인용 + 대화이력 + 질문) → SSE 토큰 스트림
  → 프론트 메시지 갱신 + 인용 칩 렌더
```

### 콜봇 한 턴
```
사용자 음성 → LiveKit Room → Agent
  → Google STT 스트리밍 → 부분 자막
  → 발화 종료 감지 → Dialogue Manager
    → 현재 시나리오 단계 + 응답 분류 (Gemini structured output)
    → 다음 단계 결정 + 봇 발화 생성
  → Google TTS → Room 오디오 트랙
  → 단계 완료 시 SQLite 저장
```
