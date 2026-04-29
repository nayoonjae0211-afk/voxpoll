FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONIOENCODING=utf-8 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# build deps for chromadb / onnxruntime-rt-deps wheels in slim image
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libstdc++6 \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Service-account.json 은 GOOGLE_APPLICATION_CREDENTIALS_JSON 환경변수에서 풀어서 씀
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Volume mount point (Railway에서 영속 디스크로 매핑)
RUN mkdir -p /app/data

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/start.sh"]
CMD ["api"]
