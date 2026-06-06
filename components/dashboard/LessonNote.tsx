'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

/**
 * Renders an admin-authored lesson note as Markdown for enrolled students.
 *
 * react-markdown does not render raw HTML (no rehype-raw), so the note cannot
 * inject scripts — it is XSS-safe even though only admins author it.
 */
export default function LessonNote({ note }: { note: string }) {
  return (
    <div className={`${inter.className} lesson-note`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {note}
      </ReactMarkdown>

      <style>{`
        .lesson-note { color: #c7c7cf; font-size: 0.9375rem; line-height: 1.7; }
        .lesson-note > :first-child { margin-top: 0; }
        .lesson-note > :last-child { margin-bottom: 0; }
        .lesson-note h1, .lesson-note h2, .lesson-note h3, .lesson-note h4 {
          color: #f1f5f9; font-weight: 700; line-height: 1.3; margin: 1.4em 0 0.5em;
        }
        .lesson-note h1 { font-size: 1.35rem; }
        .lesson-note h2 { font-size: 1.15rem; }
        .lesson-note h3 { font-size: 1.02rem; }
        .lesson-note h4 { font-size: 0.95rem; }
        .lesson-note p { margin: 0 0 0.85em; }
        .lesson-note a { color: #a5b4fc; text-decoration: underline; }
        .lesson-note a:hover { color: #c7d2fe; }
        .lesson-note strong { color: #e2e8f0; font-weight: 700; }
        .lesson-note em { color: #d4d4d8; }
        .lesson-note ul, .lesson-note ol { margin: 0 0 0.85em; padding-left: 1.4em; }
        .lesson-note li { margin: 0.25em 0; }
        .lesson-note li::marker { color: #6366f1; }
        .lesson-note code {
          background: rgba(99,102,241,0.12); color: #c7d2fe; padding: 0.1em 0.4em;
          border-radius: 5px; font-size: 0.85em;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .lesson-note pre {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 14px 16px; overflow-x: auto; margin: 0 0 0.85em;
        }
        .lesson-note pre code { background: none; color: #e2e8f0; padding: 0; font-size: 0.85rem; }
        .lesson-note blockquote {
          border-left: 3px solid rgba(99,102,241,0.5); margin: 0 0 0.85em;
          padding: 2px 0 2px 14px; color: #a1a1aa;
        }
        .lesson-note hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 1.4em 0; }
        .lesson-note table { border-collapse: collapse; width: 100%; margin: 0 0 0.85em; font-size: 0.875rem; }
        .lesson-note th, .lesson-note td { border: 1px solid rgba(255,255,255,0.1); padding: 7px 10px; text-align: left; }
        .lesson-note th { background: rgba(255,255,255,0.04); color: #e2e8f0; font-weight: 600; }
        .lesson-note img { max-width: 100%; border-radius: 8px; }
      `}</style>
    </div>
  );
}
