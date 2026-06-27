/**
 * Converts Float32 browser microphone data to raw 16-bit PCM little-endian.
 */
export function float32ToInt16PCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

/**
 * Encodes an ArrayBuffer to standard base64 format.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Converts 16-bit PCM little-endian base64 back to Float32.
 * This is used for playing back model audio responses.
 */
export function base64ToFloat32PCM(base64: string): Float32Array {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

/**
 * Text parsing utility that parses Clarify.AI structured responses
 * into logical blocks for visual notebooks if sections are detected.
 */
export interface NotebookSection {
  title: string;
  emoji: string;
  content: string;
}

export function parseTeachingSections(text: string): NotebookSection[] {
  // The 9 Clarify notebook sections, identified by emoji + title.
  const defs = [
    { emoji: "🌟", title: "Big Idea" },
    { emoji: "🤔", title: "Everyday Analogy" },
    { emoji: "📖", title: "Simple Explanation" },
    { emoji: "🖼", title: "Visual Representation" },
    { emoji: "🧠", title: "Formal Definition" },
    { emoji: "✏", title: "Worked Example" },
    { emoji: "⚠", title: "Common Mistakes" },
    { emoji: "🎯", title: "Quick Check Question" },
    { emoji: "📌", title: "One-Line Summary" }
  ];

  // Locate each header tolerantly: allow optional markdown prefixes (#, *),
  // optional numbering ("1.", "1)"), surrounding whitespace, and an optional
  // emoji variation selector. This way the tabbed notebook still renders even
  // when a model wraps headers in **bold** or ## headings.
  const found: { idx: number; headerEnd: number; emoji: string; title: string }[] = [];
  for (const def of defs) {
    const re = new RegExp(`[#*>\\s]*\\d*\\s*[.)]?\\s*${def.emoji}\\uFE0F?\\s*\\**${def.title}\\**`, "i");
    const m = re.exec(text);
    if (m) {
      found.push({ idx: m.index, headerEnd: m.index + m[0].length, emoji: def.emoji, title: def.title });
    }
  }

  // Need a real notebook (most sections present), not a stray emoji match.
  if (found.length < 3) return [];

  found.sort((a, b) => a.idx - b.idx);

  const sections: NotebookSection[] = [];
  for (let i = 0; i < found.length; i++) {
    const cur = found[i];
    const next = found[i + 1];
    const contentEnd = next ? next.idx : text.length;
    const content = text
      .substring(cur.headerEnd, contentEnd)
      .replace(/^[:\s\-=*]+/, "") // strip leading punctuation/symbols
      .trim();
    sections.push({ title: cur.title, emoji: cur.emoji, content });
  }

  return sections;
}
