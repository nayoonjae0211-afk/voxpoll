#!/usr/bin/env bash
set -euo pipefail

# Service Account JSON을 환경변수에서 디코딩 (Railway에 평문 또는 base64로 저장)
if [[ -n "${GOOGLE_APPLICATION_CREDENTIALS_JSON:-}" ]]; then
  if [[ "$GOOGLE_APPLICATION_CREDENTIALS_JSON" == *"private_key"* ]]; then
    printf '%s' "$GOOGLE_APPLICATION_CREDENTIALS_JSON" > /app/service-account.json
  else
    printf '%s' "$GOOGLE_APPLICATION_CREDENTIALS_JSON" | base64 -d > /app/service-account.json
  fi
  export GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
fi

# 첫 부팅 시 코퍼스가 없으면 자동 인덱싱
if [[ ! -d /app/data/chroma ]] || [[ -z "$(ls -A /app/data/chroma 2>/dev/null)" ]]; then
  echo "[start] indexing interloid corpus on first boot…"
  python -m app.rag.ingest --reset || echo "[start] ingestion failed (계속 진행)"
fi

mode="${1:-api}"
case "$mode" in
  api)
    exec python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
    ;;
  agent)
    exec python -m app.callbot.agent start
    ;;
  *)
    echo "unknown mode: $mode (use 'api' or 'agent')"
    exit 1
    ;;
esac
