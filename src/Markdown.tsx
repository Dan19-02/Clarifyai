/**
 * Rich markdown renderer for Clarify.AI teaching responses.
 *
 * The model is prompted to use Markdown tables, LaTeX math, and Mermaid
 * diagrams. The old UI dumped raw text, so equations and diagrams showed as
 * gibberish. This component renders:
 *   - GitHub-flavored markdown (tables, lists, bold, links)
 *   - LaTeX math via KaTeX ($...$ inline, $$...$$ block)
 *   - Mermaid flowcharts (```mermaid code fences)
 */
import React, { useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Mermaid (and its cytoscape/dagre deps) is ~1.5MB, so we load it lazily, only
// when a response actually contains a diagram. Critical for low-end mobile.
let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;
function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      m.default.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
      return m.default;
    });
  }
  return mermaidPromise;
}

function MermaidBlock({ chart }: { chart: string }) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMermaid()
      .then((mermaid) => mermaid.render(`mmd-${reactId}`, chart))
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (failed) {
    // Fall back to showing the diagram source rather than nothing.
    return (
      <pre className="overflow-x-auto rounded-xl bg-editorial-stone/60 p-3 text-xs font-mono text-editorial-charcoal/80">
        {chart}
      </pre>
    );
  }

  return (
    <div
      className="my-3 flex justify-center overflow-x-auto rounded-xl border border-editorial-line-light bg-white p-3"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {svg ? undefined : <span className="text-xs text-editorial-charcoal/40">Drawing diagram…</span>}
    </div>
  );
}

interface MarkdownProps {
  children: string;
}

function MarkdownImpl({ children }: MarkdownProps) {
  return (
    <div className="clarify-prose space-y-3 text-sm leading-relaxed text-editorial-charcoal break-words md:text-[15px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Unwrap <pre> so our block code renders without invalid <pre><div> nesting.
          pre: ({ children }) => <>{children}</>,
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1];
            const value = String(children).replace(/\n$/, "");

            if (lang === "mermaid") return <MermaidBlock chart={value} />;

            if (lang || value.includes("\n")) {
              return (
                <pre className="my-2 overflow-x-auto rounded-xl bg-editorial-charcoal/95 p-3 text-xs leading-relaxed text-editorial-ivory">
                  <code className="font-mono">{children}</code>
                </pre>
              );
            }
            return (
              <code className="rounded bg-editorial-stone px-1.5 py-0.5 font-mono text-[0.85em] text-editorial-sage">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs md:text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-editorial-line bg-editorial-stone/60 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-editorial-line-light px-3 py-2 align-top">{children}</td>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-editorial-sage underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => <h1 className="font-serif text-lg font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="font-serif text-base font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="font-serif text-sm font-bold">{children}</h3>,
          ul: ({ children }) => <ul className="ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="ml-4 list-decimal space-y-1">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-editorial-sage/50 bg-editorial-stone/30 py-1 pl-3 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

// Memoize: chat re-renders often, but a message's text is immutable once set.
export const Markdown = React.memo(MarkdownImpl);
