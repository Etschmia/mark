
import React, { useMemo } from 'react';

declare const marked: any;
declare const DOMPurify: any;

interface PreviewProps {
  markdown: string;
}

export const Preview: React.FC<PreviewProps> = ({ markdown }) => {
  const sanitizedHtml = useMemo(() => {
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
      return '<p>Loading libraries...</p>';
    }
    const rawHtml = marked.parse(markdown);
    return DOMPurify.sanitize(rawHtml);
  }, [markdown]);

  return (
    <div
      className="bg-slate-800 rounded-lg h-full overflow-y-auto p-6 text-slate-300
                 prose-styles"
    >
      <style>{`
        .prose-styles h1, .prose-styles h2, .prose-styles h3, .prose-styles h4, .prose-styles h5, .prose-styles h6 { color: white; font-weight: 600; }
        .prose-styles h1 { font-size: 2.25rem; line-height: 2.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #475569; }
        .prose-styles h2 { font-size: 1.875rem; line-height: 2.25rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #475569; }
        .prose-styles h3 { font-size: 1.5rem; line-height: 2rem; margin-bottom: 1rem; }
        .prose-styles p { margin-bottom: 1rem; line-height: 1.75; }
        .prose-styles a { color: #22d3ee; text-decoration: underline; }
        .prose-styles ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .prose-styles ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
        .prose-styles li { margin-bottom: 0.5rem; }
        .prose-styles blockquote { border-left: 4px solid #67e8f9; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #94a3b8; }
        .prose-styles code { background-color: #1e293b; color: #e2e8f0; padding: 0.2rem 0.4rem; font-size: 0.9em; border-radius: 0.25rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .prose-styles pre { background-color: #0f172a; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
        .prose-styles pre code { background-color: transparent; padding: 0; }
        .prose-styles table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
        .prose-styles th, .prose-styles td { border: 1px solid #475569; padding: 0.5rem 1rem; }
        .prose-styles th { background-color: #334155; font-weight: 600; }
        .prose-styles hr { border-top: 1px solid #475569; margin: 2rem 0; }
        .prose-styles img { max-width: 100%; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 1rem;}
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </div>
  );
};
