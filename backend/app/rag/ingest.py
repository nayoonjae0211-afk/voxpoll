"""인터로이드 코퍼스를 Chroma에 인덱싱.

사용법:
    python -m app.rag.ingest                 # 인터로이드 컬렉션 인덱싱
    python -m app.rag.ingest --reset         # 기존 컬렉션 비우고 재인덱싱
"""
from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

from app.config import BACKEND_ROOT
from app.rag.chunker import chunk_directory
from app.rag.store import collection_stats, reset_collection, upsert_chunks


CORPORA = {
    "interloid": BACKEND_ROOT / "data" / "interloid",
    "voxpoll": BACKEND_ROOT / "data" / "product",
}


async def ingest_collection(name: str, directory: Path, *, reset: bool) -> None:
    print(f"\n=== Collection: {name} ===")
    print(f"  Source: {directory}")
    if not directory.exists():
        print(f"  (디렉토리 없음, 스킵)")
        return

    if reset:
        print("  reset_collection ...")
        reset_collection(name)

    chunks = chunk_directory(directory)
    print(f"  Chunks: {len(chunks)}")

    written = await upsert_chunks(name, chunks)
    print(f"  Upserted: {written}")
    print(f"  Stats: {collection_stats(name)}")


async def main(reset: bool) -> None:
    for name, directory in CORPORA.items():
        await ingest_collection(name, directory, reset=reset)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Chroma 인덱싱")
    parser.add_argument("--reset", action="store_true", help="기존 컬렉션 삭제 후 재인덱싱")
    parser.add_argument("--collection", choices=list(CORPORA), help="특정 컬렉션만 인덱싱")
    args = parser.parse_args()

    if args.collection:
        asyncio.run(
            ingest_collection(args.collection, CORPORA[args.collection], reset=args.reset)
        )
    else:
        asyncio.run(main(reset=args.reset))
