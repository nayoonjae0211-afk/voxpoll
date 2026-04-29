export type SSEEvent = { event: string; data: string };

const BLOCK_SEP = /\r?\n\r?\n/;
const LINE_SEP = /\r?\n/;

/**
 * SSE 응답을 파싱해 이벤트 스트림으로 yield.
 * EventSource는 POST를 지원하지 않아 fetch 기반 파서를 직접 사용.
 * \n\n / \r\n\r\n 양쪽 모두 처리한다.
 */
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<SSEEvent, void, void> {
  if (!response.body) throw new Error("응답 본문이 비어 있습니다");
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let match: RegExpExecArray | null;
    while ((match = BLOCK_SEP.exec(buffer)) !== null) {
      const block = buffer.slice(0, match.index);
      buffer = buffer.slice(match.index + match[0].length);
      const ev = parseBlock(block);
      if (ev) yield ev;
    }
  }
  if (buffer.trim()) {
    const ev = parseBlock(buffer);
    if (ev) yield ev;
  }
}

function parseBlock(block: string): SSEEvent | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const rawLine of block.split(LINE_SEP)) {
    if (!rawLine) continue;
    if (rawLine.startsWith(":")) continue;
    if (rawLine.startsWith("event:")) {
      event = rawLine.slice(6).trim();
    } else if (rawLine.startsWith("data:")) {
      dataLines.push(rawLine.slice(5).replace(/^ /, ""));
    }
  }
  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}
