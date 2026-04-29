# 챗봇 RAG 코퍼스 출처 — 인터로이드 회사소개

## 인덱싱 대상

| 파일 | 출처 | 비고 |
|---|---|---|
| `backend/data/interloid/company.md` | 인터로이드 공식 홈페이지(www.interoid.co.kr) 회사 소개 | 사업영역, 비전 |
| `backend/data/interloid/products.md` | 홈페이지 솔루션 페이지 | 챗봇·콜봇·플랫폼 제품 |
| `backend/data/interloid/recruit.md` | 본 공고 원문 | 자격요건/우대사항 |
| `backend/data/interloid/news.md` | 공식 뉴스/보도자료 | 최근 도입 사례 |
| `backend/data/interloid/values.md` | 인재상·기업 가치 | "AI 기술로 세상의 문제 해결" |

## 수집 방법 (Phase 1에서 실행)

1. WebFetch로 공식 사이트 주요 페이지 가져오기
2. 마크다운으로 정제(불필요 헤더·푸터 제거, 본문만)
3. 사람 손으로 빠르게 검수(부정확하거나 시점이 오래된 정보 제거)
4. 청크 사이즈 **600 토큰 / 100 오버랩** 으로 분할
5. Gemini text-embedding-004 (768차원) 사용
6. Chroma `interloid` 컬렉션에 저장, 메타데이터에 `source`, `section`, `last_fetched`

## 응답 정책

- 모르는 정보는 **추측 금지**. 코퍼스에 없으면 "회사 공식 자료에서 확인되지 않습니다"라고 답변.
- 출처 인용 필수: 응답 하단에 칩 형태로 `source:section` 표시.
- 회사 비전·기업 가치 같은 추상 답변 시에도 코퍼스 인용을 시도.
- 채용 관련 질문(자격요건·복지)은 공고 원문을 우선 참조.

## 갱신 주기

포트폴리오 데모 목적이므로 1회 수집 고정. 실서비스 시 주 1회 재수집 자동화 권장.
