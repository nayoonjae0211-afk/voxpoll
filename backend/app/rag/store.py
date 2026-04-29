from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import chromadb

from app.config import get_settings
from app.llm.gemini import embed
from app.rag.chunker import Chunk


@dataclass(slots=True)
class Retrieved:
    text: str
    source: str
    section: str
    score: float


def _client() -> chromadb.PersistentClient:
    settings = get_settings()
    path = settings.chroma_path_abs
    path.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(path))


def _collection(name: str):
    # cosine 거리, 임베딩은 외부에서 주입 (Gemini)
    return _client().get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},
    )


async def upsert_chunks(collection_name: str, chunks: list[Chunk]) -> int:
    if not chunks:
        return 0
    coll = _collection(collection_name)
    ids = [f"{c.source}#{c.chunk_index}" for c in chunks]
    documents = [c.text for c in chunks]
    metadatas = [{"source": c.source, "section": c.section} for c in chunks]
    embeddings = await embed(documents)
    coll.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings,
    )
    return len(chunks)


async def search(collection_name: str, query: str, *, top_k: int = 5) -> list[Retrieved]:
    coll = _collection(collection_name)
    if coll.count() == 0:
        return []
    [query_emb] = await embed([query], task_type="RETRIEVAL_QUERY")
    res = coll.query(query_embeddings=[query_emb], n_results=top_k)
    out: list[Retrieved] = []
    docs = res["documents"][0] if res["documents"] else []
    metas = res["metadatas"][0] if res["metadatas"] else []
    dists = res["distances"][0] if res.get("distances") else [0.0] * len(docs)
    for doc, meta, dist in zip(docs, metas, dists, strict=False):
        out.append(
            Retrieved(
                text=doc,
                source=str(meta.get("source", "")),
                section=str(meta.get("section", "")),
                score=float(1.0 - dist),
            )
        )
    return out


def collection_stats(collection_name: str) -> dict[str, int]:
    coll = _collection(collection_name)
    return {"count": coll.count()}


def reset_collection(collection_name: str) -> None:
    client = _client()
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
