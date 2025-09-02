import React, { useState, useEffect, forwardRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
// Import specific language modules
import 'highlight.js/lib/languages/javascript';
import 'highlight.js/lib/languages/sql';
import 'highlight.js/lib/languages/python';
import 'highlight.js/lib/languages/php';
import 'highlight.js/lib/languages/xml';
import { themes } from './preview-themes';

interface PreviewProps {
  markdown: string;
  theme: string;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

// Configuration for DOMPurify to allow specific tags and attributes
// needed for markdown rendering and syntax highlighting.
const ALLOWED_TAGS = [
    'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'br', 'span', 'img', 'del', 's', 'strike', 'input'
];
const ALLOWED_ATTR = [
    'style', 'class', 'href', 'src', 'alt', 'title', 'width', 'height',
    'start', 'type', 'align', 'colspan', 'rowspan', 'checked', 'disabled'
];


export const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ markdown, theme, onScroll }, ref) => {
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  // This effect runs once to configure marked with a custom renderer for full control
  useEffect(() => {
    const renderer = new marked.Renderer();

    // Override the 'code' function to manually control highlighting
    renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
      const language = hljs.getLanguage(lang || '') ? lang || 'plaintext' : 'plaintext';
      const highlightedCode = hljs.highlight(text, { language }).value;

      // Manually construct the final HTML with the correct classes needed by highlight.js themes.
      return `<pre><code class="hljs language-${language}">${highlightedCode}</code></pre>`;
    };
    
    // Use the custom renderer
    marked.use({ renderer, gfm: true, breaks: true });
  }, []);

  // This effect parses the markdown whenever it changes.
  useEffect(() => {
    // An async function to handle parsing and sanitizing.
    const parseAndSanitize = async () => {
      try {
        // marked.parse is asynchronous and returns a Promise.
        const rawHtml = await marked.parse(markdown);
        
        // DOMPurify sanitizes the HTML to prevent XSS vulnerabilities.
        // We configure it to allow the tags and attributes necessary for our markdown features.
        const sanitized = DOMPurify.sanitize(rawHtml, {
            ALLOWED_TAGS: ALLOWED_TAGS,
            ALLOWED_ATTR: ALLOWED_ATTR,
        });
        setSanitizedHtml(sanitized);
      } catch (error) {
        console.error("Error parsing markdown:", error);
        setSanitizedHtml('<p style="color: #f87171;">Error parsing markdown.</p>');
      }
    };

    parseAndSanitize();
    // This effect only depends on the `markdown` prop.
  }, [markdown]);

  const currentThemeStyles = themes[theme] || themes['Default'];

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className="rounded-lg h-full overflow-y-auto p-6 prose-styles transition-colors duration-300"
    >
      <style>{currentThemeStyles}</style>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </div>
  );
});
