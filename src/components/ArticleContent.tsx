"use client";

import Markdown from "react-markdown";

export function ArticleContent({ content }: { content: string }) {
  if (!content) return null;

  return (
    <Markdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-white mt-6 mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-orange-500 pl-4 my-4 text-zinc-400 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-orange-400 hover:text-orange-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-white">{children}</strong>
        ),
        code: ({ children }) => (
          <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-orange-300">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-zinc-800 rounded-lg p-4 overflow-x-auto my-4">
            {children}
          </pre>
        ),
      }}
    >
      {content}
    </Markdown>
  );
}
