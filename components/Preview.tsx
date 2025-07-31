
import React, { useMemo } from 'react';
import { themes } from './preview-themes';

declare const marked: any;
declare const DOMPurify: any;

interface PreviewProps {
  markdown: string;
  theme: string;
}

export const Preview: React.FC<PreviewProps> = ({ markdown, theme }) => {
  const sanitizedHtml = useMemo(() => {
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
      return '<p>Loading libraries...</p>';
    }
    const rawHtml = marked.parse(markdown);
    return DOMPurify.sanitize(rawHtml);
  }, [markdown]);

  const currentThemeStyles = themes[theme] || themes['Default'];

  return (
    <div
      className="rounded-lg h-full overflow-y-auto p-6 prose-styles transition-colors duration-300"
    >
      <style>{currentThemeStyles}</style>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </div>
  );
};
