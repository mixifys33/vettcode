"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  if (!content || !content.trim()) {
    return <p className="text-sm text-gray-500 italic">No response content available.</p>;
  }

  // ── Inline parser ──────────────────────────────────────────────────────────
  // Splits text into bold / italic / code / link / plain segments safely.
  const parseInline = (text: string, keyPrefix: string): React.ReactNode => {
    // Single regex that captures all inline patterns in one pass
    const INLINE = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let i = 0;

    while ((match = INLINE.exec(text)) !== null) {
      // Push any plain text before this match
      if (match.index > lastIndex) {
        nodes.push(text.slice(lastIndex, match.index));
      }

      if (match[1]) {
        // Bold **text** or __text__
        nodes.push(<strong key={`${keyPrefix}-b${i++}`} className="font-semibold">{match[2]}</strong>);
      } else if (match[3]) {
        // Italic *text* or _text_
        nodes.push(<em key={`${keyPrefix}-i${i++}`} className="italic">{match[4]}</em>);
      } else if (match[5] !== undefined) {
        // Inline code `code`
        nodes.push(<code key={`${keyPrefix}-c${i++}`} className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">{match[5]}</code>);
      } else if (match[6]) {
        // Link [text](url)
        nodes.push(
          <a key={`${keyPrefix}-a${i++}`} href={match[7]} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 hover:underline">{match[6]}</a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Push remaining plain text
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }

    return nodes.length === 0 ? text : nodes.length === 1 ? nodes[0] : <>{nodes}</>;
  };

  // ── Block parser ───────────────────────────────────────────────────────────
  const parseBlocks = (raw: string): React.ReactNode[] => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let k = 0;

    const flushList = () => {
      if (!listItems.length || !listType) return;
      const Tag = listType;
      elements.push(
        <Tag key={`list-${k++}`} className={listType === 'ul' ? "list-disc ml-5 space-y-1 my-2" : "list-decimal ml-5 space-y-1 my-2"}>
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed">{parseInline(item, `li-${k}-${idx}`)}</li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    };

    for (const line of lines) {
      const t = line.trim();

      if (!t) {
        flushList();
        elements.push(<div key={`sp-${k++}`} className="h-1.5" />);
        continue;
      }

      // ### h3
      const h3 = t.match(/^###\s+(.+)/);
      if (h3) { flushList(); elements.push(<h4 key={`h3-${k++}`} className="font-semibold text-base mt-3 mb-1">{parseInline(h3[1], `h3-${k}`)}</h4>); continue; }

      // ## h2
      const h2 = t.match(/^##\s+(.+)/);
      if (h2) { flushList(); elements.push(<h3 key={`h2-${k++}`} className="font-bold text-lg mt-3 mb-2">{parseInline(h2[1], `h2-${k}`)}</h3>); continue; }

      // # h1
      const h1 = t.match(/^#\s+(.+)/);
      if (h1) { flushList(); elements.push(<h2 key={`h1-${k++}`} className="font-bold text-xl mt-4 mb-2">{parseInline(h1[1], `h1-${k}`)}</h2>); continue; }

      // Unordered list: - * •
      const ul = t.match(/^[-*•]\s+(.+)/);
      if (ul) { if (listType !== 'ul') { flushList(); listType = 'ul'; } listItems.push(ul[1]); continue; }

      // Ordered list: 1.
      const ol = t.match(/^\d+\.\s+(.+)/);
      if (ol) { if (listType !== 'ol') { flushList(); listType = 'ol'; } listItems.push(ol[1]); continue; }

      // Horizontal rule
      if (/^[-*_]{3,}$/.test(t)) { flushList(); elements.push(<hr key={`hr-${k++}`} className="my-3 border-slate-200" />); continue; }

      // Blockquote
      const bq = t.match(/^>\s*(.+)/);
      if (bq) { flushList(); elements.push(<blockquote key={`bq-${k++}`} className="border-l-4 border-blue-400 pl-3 py-1 my-2 text-slate-600 italic bg-blue-50 rounded-r">{parseInline(bq[1], `bq-${k}`)}</blockquote>); continue; }

      // Regular paragraph
      flushList();
      elements.push(<p key={`p-${k++}`} className="text-sm leading-relaxed my-1">{parseInline(t, `p-${k}`)}</p>);
    }

    flushList();
    return elements;
  };

  return (
    <div className={`markdown-content ${className}`}>
      {parseBlocks(content)}
    </div>
  );
};

export default MarkdownRenderer;

