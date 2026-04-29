# DESIGN.md — VoxPoll Chatbot/Callbot Design System

> 가이드 #4 원칙: "작업 전에 글자 크기·폰트·버튼 사이즈를 먼저 리스트화 → 일관성 확보."
> 모든 UI 컴포넌트는 본 문서의 토큰만을 사용한다. 새 토큰이 필요하면 먼저 본 문서를 갱신.

## 1. 디자인 레퍼런스

- **LiveKit Agents Playground** (https://agents-playground.livekit.io) — 다크 테마, 한 화면에 음성 시각화 + 자막 + 컨트롤
- **Linear.app** — 미니멀 타이포, 절제된 색
- **Vercel.com** — 네거티브 스페이스, 모노톤 + 단일 액센트

→ "LiveKit 다크 미니멀" 톤. 화려하지 않고, 정보 밀도 적정, 한국어 가독성 우선.

## 2. 컬러 팔레트

| Token | Hex | 용도 |
|---|---|---|
| `--bg` | `#09090B` (zinc-950) | 페이지 배경 |
| `--surface` | `#18181B` (zinc-900) | 카드/패널 |
| `--surface-2` | `#27272A` (zinc-800) | 호버, 보더 |
| `--border` | `#3F3F46` (zinc-700) | 구분선 |
| `--text` | `#FAFAFA` (zinc-50) | 본문 |
| `--text-muted` | `#A1A1AA` (zinc-400) | 보조 |
| `--text-subtle` | `#71717A` (zinc-500) | 메타 |
| `--accent` | `#06B6D4` (cyan-500) | 1차 버튼/링크/포커스 |
| `--accent-hover` | `#0891B2` (cyan-600) | 호버 |
| `--accent-soft` | `#06B6D41A` (cyan-500 / 10%) | 배경 칩 |
| `--success` | `#22C55E` (green-500) | 성공/통화 ON |
| `--warning` | `#F59E0B` (amber-500) | 경고 |
| `--danger` | `#EF4444` (red-500) | 통화 종료/오류 |

라이트 테마는 v1에서 지원하지 않음(다크 전용).

## 3. 타이포그래피

- **Sans (한+영)**: Pretendard Variable (CDN) → fallback `system-ui`
- **Mono**: `ui-monospace`, `SFMono-Regular`, `Menlo`

| Token | Size / Line | 용도 |
|---|---|---|
| `display` | 40 / 48, 700 | 랜딩 히어로 |
| `h1` | 28 / 36, 700 | 페이지 타이틀 |
| `h2` | 22 / 30, 600 | 섹션 |
| `h3` | 18 / 26, 600 | 카드 타이틀 |
| `body` | 15 / 24, 400 | 본문 (한국어 가독성 위해 14가 아닌 15) |
| `body-sm` | 13 / 20, 400 | 보조 |
| `caption` | 12 / 16, 500 | 메타/태그 |

## 4. 레이아웃 / 스페이싱

- 4px 베이스 그리드 (Tailwind 기본)
- 컨테이너 폭: `max-w-5xl`(1024px) 기본, 채팅창은 `max-w-3xl`
- 사이드바 폭: `260px`
- 헤더 높이: `56px`

## 5. 컴포넌트 사이즈

| 컴포넌트 | 사양 |
|---|---|
| Button (default) | `h-10` `px-4` `rounded-lg` `text-body-sm` `font-medium` |
| Button (sm) | `h-8` `px-3` `rounded-md` `text-caption` |
| Button (icon) | `h-10 w-10` `rounded-lg` 정사각 |
| Input | `h-10` `px-3` `rounded-md` `bg-surface` `border border-border` `focus:border-accent` |
| Card | `bg-surface` `border border-border/60` `rounded-xl` `p-5` |
| Chat bubble (user) | `bg-accent-soft` `text-text` `rounded-2xl` `px-4 py-2.5` |
| Chat bubble (bot) | `bg-surface` `border border-border/60` `rounded-2xl` `px-4 py-2.5` |
| Pill / Tag | `h-6` `px-2.5` `rounded-full` `text-caption` |

## 6. 모션

- 일반 트랜지션: `transition-all duration-150 ease-out`
- 메시지 등장: `opacity 0→1 + translateY 4px→0`, 200ms
- 음성 시각화: 60fps Canvas 또는 SVG (LiveKit 기본 컴포넌트 우선)
- 모션 줄이기 OS 설정 시 모든 트랜지션 비활성화

## 7. 아이콘

- `lucide-react` (Tailwind 친화)
- 표준 사이즈: `16` (인라인), `20` (버튼), `24` (헤더)

## 8. 페이지별 레이아웃

### 랜딩 (`/`)
- 히어로(타이틀+서브카피+두 CTA: "챗봇 체험" / "콜봇 체험")
- 공고 요건 매핑 표(어떤 요건이 어디서 시연되는지)
- 아키텍처 다이어그램 한 장

### 챗봇 (`/chat`)
- 좌측: 대화 목록(추후), 메인: 챗 영역, 우측: 검색된 RAG 출처(인용)
- 메시지 스트리밍 표시(타이핑 점)
- 출처 인용은 본문 하단에 작은 칩 형태

### 콜봇 (`/call`)
- 중앙: 상대방(봇) 음성 시각화 큰 원형
- 하단: 마이크/종료 버튼, 자막(STT) 실시간
- 우측: 설문 진행 단계 표시(`3 / 10`), 응답 요약

### 대시보드 (`/dashboard`)
- 상단: KPI(응답 완료 수, 평균 통화시간, NPS)
- 본문: 문항별 응답 분포 차트
- 하단: 응답 원본 테이블(녹취/자막 다운로드)

## 9. 접근성

- 텍스트 명도 대비 최소 4.5:1
- 모든 인터랙션 요소 키보드 접근 가능
- 음성 데모는 항상 자막 동시 제공
- 통화 권한 요청은 명시적 버튼 클릭으로만
