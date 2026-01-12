import React, { useState, useEffect, forwardRef } from 'react';
import { themes } from './preview-themes';
import { removeFrontmatter } from '../utils/frontmatterUtils';

// Dynamic imports for heavy dependencies
let marked: any = null;
let DOMPurify: any = null;
let hljs: any = null;

// Cache for loaded modules
const moduleCache = {
  marked: null as any,
  dompurify: null as any,
  hljs: null as any
};

// Dynamic loader for markdown processing dependencies
const loadMarkdownDependencies = async () => {
  if (moduleCache.marked && moduleCache.dompurify && moduleCache.hljs) {
    return {
      marked: moduleCache.marked,
      DOMPurify: moduleCache.dompurify,
      hljs: moduleCache.hljs
    };
  }

  try {
    // Load all dependencies in parallel
    const [markedModule, purifyModule, hljsModule] = await Promise.all([
      import('marked'),
      import('dompurify'),
      import('highlight.js')
    ]);

    // Cache the modules
    moduleCache.marked = markedModule.marked;
    moduleCache.dompurify = purifyModule.default;
    moduleCache.hljs = hljsModule.default;

    // Load specific language modules for highlight.js
    await Promise.all([
      import('highlight.js/lib/languages/javascript'),
      import('highlight.js/lib/languages/sql'),
      import('highlight.js/lib/languages/python'),
      import('highlight.js/lib/languages/php'),
      import('highlight.js/lib/languages/xml')
    ]);

    // Register languages
    const jsLang = await import('highlight.js/lib/languages/javascript');
    const sqlLang = await import('highlight.js/lib/languages/sql');
    const pythonLang = await import('highlight.js/lib/languages/python');
    const phpLang = await import('highlight.js/lib/languages/php');
    const xmlLang = await import('highlight.js/lib/languages/xml');

    moduleCache.hljs.registerLanguage('javascript', jsLang.default);
    moduleCache.hljs.registerLanguage('sql', sqlLang.default);
    moduleCache.hljs.registerLanguage('python', pythonLang.default);
    moduleCache.hljs.registerLanguage('php', phpLang.default);
    moduleCache.hljs.registerLanguage('xml', xmlLang.default);

    // Load CSS for syntax highlighting
    if (!document.querySelector('#hljs-css')) {
      const link = document.createElement('link');
      link.id = 'hljs-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css';
      document.head.appendChild(link);
    }

    return {
      marked: moduleCache.marked,
      DOMPurify: moduleCache.dompurify,
      hljs: moduleCache.hljs
    };
  } catch (error) {
    console.error('Failed to load markdown dependencies:', error);
    throw error;
  }
};

interface PreviewProps {
  markdown: string;
  theme: string;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

// Add scrollbar styling to match the preview theme
// Paper is the only light preview theme, all others are dark
const getScrollbarStyles = (theme: string) => {
  const isLightTheme = theme === 'Paper';

  return `
  .preview-scrollbar,
  div.preview-scrollbar {
    overflow: auto !important;
    overflow-x: auto !important;
    overflow-y: auto !important;
    scrollbar-width: auto !important;
    scrollbar-color: ${isLightTheme ? '#a8a29e #f5f5f4' : '#64748b #1e293b'} !important;
  }

  .preview-scrollbar::-webkit-scrollbar,
  div.preview-scrollbar::-webkit-scrollbar {
    width: 14px !important;
    height: 14px !important;
    display: block !important;
  }

  .preview-scrollbar::-webkit-scrollbar-track,
  div.preview-scrollbar::-webkit-scrollbar-track {
    background: ${isLightTheme ? '#f5f5f4' : '#1e293b'} !important;
    border-radius: 7px !important;
  }

  .preview-scrollbar::-webkit-scrollbar-thumb,
  div.preview-scrollbar::-webkit-scrollbar-thumb {
    background: ${isLightTheme ? '#a8a29e' : '#64748b'} !important;
    border-radius: 7px !important;
    border: 2px solid ${isLightTheme ? '#f5f5f4' : '#1e293b'} !important;
  }

  .preview-scrollbar::-webkit-scrollbar-thumb:hover,
  div.preview-scrollbar::-webkit-scrollbar-thumb:hover {
    background: ${isLightTheme ? '#78716c' : '#94a3b8'} !important;
  }

  .preview-scrollbar::-webkit-scrollbar-corner,
  div.preview-scrollbar::-webkit-scrollbar-corner {
    background: ${isLightTheme ? '#f5f5f4' : '#1e293b'} !important;
  }
`};


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
  const [isLoading, setIsLoading] = useState(true);
  const [dependencies, setDependencies] = useState<{
    marked: any;
    DOMPurify: any;
    hljs: any;
  } | null>(null);

  // Load dependencies on first mount
  useEffect(() => {
    let isMounted = true;
    
    const initializeDependencies = async () => {
      try {
        const deps = await loadMarkdownDependencies();
        
        if (!isMounted) return;
        
        // Configure marked with custom renderer
        const renderer = new deps.marked.Renderer();

        // Override the 'code' function to manually control highlighting
        renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
          const language = deps.hljs.getLanguage(lang || '') ? lang || 'plaintext' : 'plaintext';
          const highlightedCode = deps.hljs.highlight(text, { language }).value;

          // Manually construct the final HTML with the correct classes needed by highlight.js themes.
          return `<pre><code class="hljs language-${language}">${highlightedCode}</code></pre>`;
        };
        
        // Use the custom renderer
        deps.marked.use({ renderer, gfm: true, breaks: true });
        
        setDependencies(deps);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize Preview dependencies:', error);
        setIsLoading(false);
      }
    };
    
    initializeDependencies();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // This effect parses the markdown whenever it changes.
  useEffect(() => {
    if (!dependencies || isLoading) {
      return;
    }
    
    // An async function to handle parsing and sanitizing.
    const parseAndSanitize = async () => {
      try {
        // Remove frontmatter before parsing (frontmatter should not appear in preview)
        const markdownWithoutFrontmatter = removeFrontmatter(markdown);
        
        // marked.parse is asynchronous and returns a Promise.
        const rawHtml = await dependencies.marked.parse(markdownWithoutFrontmatter);
        
        // DOMPurify sanitizes the HTML to prevent XSS vulnerabilities.
        // We configure it to allow the tags and attributes necessary for our markdown features.
        const sanitized = dependencies.DOMPurify.sanitize(rawHtml, {
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
    // This effect only depends on the `markdown` prop and dependencies.
  }, [markdown, dependencies, isLoading]);

  const currentThemeStyles = themes[theme] || themes['Default'];

  if (isLoading) {
    return (
      <div className="rounded-t-lg h-full overflow-hidden">
        <div
          ref={ref}
          className="preview-scrollbar h-full overflow-y-auto p-6 prose-styles transition-colors duration-300 flex items-center justify-center"
        >
          <div className="text-slate-500">Loading preview...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-t-lg h-full overflow-hidden">
      <div
        ref={ref}
        onScroll={onScroll}
        className="preview-scrollbar h-full overflow-y-auto p-6 prose-styles transition-colors duration-300"
      >
        <style>{currentThemeStyles}</style>
        <style>{getScrollbarStyles(theme)}</style>
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>
    </div>
  );
});
