import React, { useState, useEffect } from 'react';
import { themes } from './preview-themes';

// Deklarieren der globalen Variablen, die von den <script>-Tags bereitgestellt werden.
// Dies informiert TypeScript darüber, dass diese existieren und welchen Typ sie haben.
declare global {
  interface Window {
    marked?: any; // Using 'any' for simplicity with custom renderer
    DOMPurify?: {
      sanitize(html: string, config?: object): string;
    };
    hljs?: {
      getLanguage(lang: string): any;
      highlight(code: string, options: { language: string; }): { value: string; };
    }
  }
}

interface PreviewProps {
  markdown: string;
  theme: string;
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


export const Preview: React.FC<PreviewProps> = ({ markdown, theme }) => {
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  // This effect runs once to configure marked with a custom renderer for full control
  useEffect(() => {
    if (window.marked && window.hljs) {
      
      const renderer = new window.marked.Renderer();

      // Override the 'code' function to manually control highlighting
      renderer.code = (code: string, lang: string) => {
        const language = window.hljs!.getLanguage(lang || '') ? lang || 'plaintext' : 'plaintext';
        const highlightedCode = window.hljs!.highlight(code, { language }).value;

        // Manually construct the final HTML with the correct classes needed by highlight.js themes.
        // marked() will not double-wrap this in <pre> if the renderer returns it.
        return `<pre><code class="hljs language-${language}">${highlightedCode}</code></pre>`;
      };
      
      // Use the custom renderer
      window.marked.use({ renderer, gfm: true, breaks: true });
    }
  }, []);

  // This effect parses the markdown whenever it changes.
  useEffect(() => {
    // Safety check to ensure the global libraries are loaded.
    if (!window.marked?.parse || !window.DOMPurify?.sanitize) {
      // Display an error if the libraries are missing for any reason.
      setSanitizedHtml('<p style="color: #f87171;">Preview libraries could not be loaded.</p>');
      console.error("marked.js or DOMPurify.js not found in the global scope.");
      return;
    }

    // An async function to handle parsing and sanitizing.
    const parseAndSanitize = async () => {
      try {
        // marked.parse is asynchronous and returns a Promise.
        const rawHtml = await window.marked!.parse(markdown);
        
        // DOMPurify sanitizes the HTML to prevent XSS vulnerabilities.
        // We configure it to allow the tags and attributes necessary for our markdown features.
        const sanitized = window.DOMPurify!.sanitize(rawHtml, {
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
      className="rounded-lg h-full overflow-y-auto p-6 prose-styles transition-colors duration-300"
    >
      <style>{currentThemeStyles}</style>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </div>
  );
};
