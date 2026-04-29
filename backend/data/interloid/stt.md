---
source: https://interroid.com/s-t/stt
section: Real-time STT
last_fetched: 2026-04-28
---

# Real-time STT — 실시간 음성 인식

## 한 줄 정의

> "음성을 실시간으로 텍스트로 변환한다. 음성 인식 알고리즘을 활용하여 음성 데이터를 분석하고, 딥러닝을 통해 높은 정확도를 구현한다."

## 엔진

**Conformer-CTC**
- Transformer + CNN 결합
- Connectionist Temporal Classification(CTC) 손실 함수 사용
- 장거리 의존성 학습(Self-Attention) + 지역적 특징 학습(CNN) 동시 처리

## 주요 특징

1. **하이브리드 모델** — Self-Attention(장거리) + CNN(지역) → 잡음 환경에서도 강인한 성능
2. **CTC 손실 함수** — 음성 프레임을 직접 텍스트와 정렬하는 End-to-End 추론
3. **듀얼 처리** — 실시간(Streaming) 및 비실시간(Non-streaming) 환경에서 유연 동작
4. **토큰화** — BPE 활용으로 다양한 언어 고품질 구현

## 아키텍처

| 모드 | 처리 방식 |
|---|---|
| 실시간(Streaming) | IPCC 이벤트 발생 시 즉시 STT 결과 생성 → DB 저장 |
| 배치(Batch) | 30분 단위 VAD·STT·마스킹 모듈 실행, Daily Batch로 텍스트 분석 + QA 처리 |

## 활용

- 콜센터 통화 분석
- 음성 명령 처리
- 회의록 자동 작성
- 콜봇 입력단

## 본 포트폴리오와의 관계

콜봇 데모는 인터로이드 자체 Conformer-CTC 엔진 자리에 **Google Cloud Speech-to-Text v2 (ko-KR)** 를 사용해 동일한 스트리밍 STT 파이프라인을 시연한다. 운영 시 자체 엔진으로 교체 가능한 구조.
