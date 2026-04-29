from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import tiktoken


@dataclass(slots=True)
class Chunk:
    text: str
    source: str  # 파일명 (확장자 제외)
    section: str  # 가장 가까운 헤더
    chunk_index: int


_FRONTMATTER_RE = re.compile(r"^---\n.*?\n---\n", re.DOTALL)
_HEADER_RE = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)


def _strip_frontmatter(text: str) -> str:
    return _FRONTMATTER_RE.sub("", text, count=1)


def _split_by_headers(text: str) -> list[tuple[str, str]]:
    """헤더 단위로 [(section_title, body)] 리스트 반환.

    첫 헤더 앞의 본문은 'preamble' 섹션으로 들어간다.
    """
    matches = list(_HEADER_RE.finditer(text))
    if not matches:
        return [("preamble", text.strip())]

    sections: list[tuple[str, str]] = []
    pre_body = text[: matches[0].start()].strip()
    if pre_body:
        sections.append(("preamble", pre_body))

    for i, m in enumerate(matches):
        title = m.group(2).strip()
        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[body_start:body_end].strip()
        if body:
            sections.append((title, body))
    return sections


def _split_text_to_token_window(
    text: str,
    *,
    max_tokens: int,
    overlap_tokens: int,
    encoder: tiktoken.Encoding,
) -> list[str]:
    """긴 문단을 토큰 윈도우로 분할 (오버랩 포함)."""
    tokens = encoder.encode(text)
    if len(tokens) <= max_tokens:
        return [text]

    pieces: list[str] = []
    step = max(1, max_tokens - overlap_tokens)
    for start in range(0, len(tokens), step):
        end = min(start + max_tokens, len(tokens))
        pieces.append(encoder.decode(tokens[start:end]))
        if end == len(tokens):
            break
    return pieces


def chunk_markdown_file(
    path: Path,
    *,
    max_tokens: int = 600,
    overlap_tokens: int = 100,
) -> list[Chunk]:
    text = _strip_frontmatter(path.read_text(encoding="utf-8"))
    encoder = tiktoken.get_encoding("cl100k_base")
    source = path.stem

    chunks: list[Chunk] = []
    chunk_index = 0
    for section, body in _split_by_headers(text):
        for piece in _split_text_to_token_window(
            body,
            max_tokens=max_tokens,
            overlap_tokens=overlap_tokens,
            encoder=encoder,
        ):
            # 임베딩 매칭 정확도 향상을 위해 텍스트 헤더에 source(파일명)도 포함.
            # 한국어 의미 매칭 + 도메인 컨텍스트 보강.
            header = f"[{source}] {section}".strip()
            chunks.append(
                Chunk(
                    text=f"# {header}\n\n{piece}".strip(),
                    source=source,
                    section=section,
                    chunk_index=chunk_index,
                )
            )
            chunk_index += 1
    return chunks


def chunk_directory(directory: Path, **kwargs) -> list[Chunk]:
    out: list[Chunk] = []
    for md in sorted(directory.glob("*.md")):
        out.extend(chunk_markdown_file(md, **kwargs))
    return out
