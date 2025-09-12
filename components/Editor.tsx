
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { python } from '@codemirror/lang-python';
import { php } from '@codemirror/lang-php';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';
import { searchKeymap, openSearchPanel } from '@codemirror/search';
import { EditorSettings } from './SettingsModal';

// Import basic setup components
import { 
  closeBrackets, 
  autocompletion, 
  closeBracketsKeymap, 
  completionKeymap 
} from '@codemirror/autocomplete';
import { 
  defaultKeymap, 
  historyKeymap,
  history 
} from '@codemirror/commands';
import { 
  bracketMatching, 
  indentOnInput, 
  syntaxHighlighting, 
  defaultHighlightStyle, 
  foldKeymap 
} from '@codemirror/language';
import { highlightSelectionMatches } from '@codemirror/search';

// Create a basic setup that doesn't include line numbers by default
const createBaseSetup = (includeLineNumbers: boolean) => [
  history(),
  EditorView.lineWrapping,
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  highlightSelectionMatches(),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  ...(includeLineNumbers ? [lineNumbers()] : []),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
  ]),
];
const customSearchKeymap = [
  {
    key: 'Mod-f',
    run: (view: EditorView) => {
      openSearchPanel(view);
      return true;
    }
  }
];

// Create formatting keymap
const createFormattingKeymap = (onFormat?: (formatType: string, options?: any) => void) => {
  if (!onFormat) return [];
  
  return [
    // Text formatting
    {
      key: 'Mod-b',
      run: () => {
        onFormat('bold');
        return true;
      }
    },
    {
      key: 'Mod-i',
      run: () => {
        onFormat('italic');
        return true;
      }
    },
    {
      key: 'Mod-d',
      run: () => {
        onFormat('strikethrough');
        return true;
      }
    },
    // Headers
    {
      key: 'Mod-1',
      run: () => {
        onFormat('h1');
        return true;
      }
    },
    {
      key: 'Mod-2',
      run: () => {
        onFormat('h2');
        return true;
      }
    },
    {
      key: 'Mod-3',
      run: () => {
        onFormat('h3');
        return true;
      }
    },
    // Lists and structure
    {
      key: 'Mod-u',
      run: () => {
        onFormat('ul');
        return true;
      }
    },
    {
      key: 'Mod-o',
      run: () => {
        onFormat('ol');
        return true;
      }
    },
    {
      key: 'Mod-Shift-c',
      run: () => {
        onFormat('checklist');
        return true;
      }
    },
    {
      key: 'Mod-q',
      run: () => {
        onFormat('quote');
        return true;
      }
    },
    {
      key: 'Mod-t',
      run: () => {
        onFormat('table');
        return true;
      }
    },
    // Code and links
    {
      key: 'Mod-e',
      run: () => {
        onFormat('code');
        return true;
      }
    },
    {
      key: 'Mod-k',
      run: () => {
        onFormat('link');
        return true;
      }
    },
    {
      key: 'Mod-m',
      run: () => {
        onFormat('image');
        return true;
      }
    },
    // File operations (these will be handled by parent component)
    {
      key: 'Mod-n',
      run: () => {
        onFormat('new');
        return true;
      }
    },
    {
      key: 'Mod-s',
      run: () => {
        onFormat('save');
        return true;
      }
    },
    {
      key: 'Mod-Shift-s',
      run: () => {
        onFormat('saveAs');
        return true;
      }
    },
    {
      key: 'Mod-Shift-o',
      run: () => {
        onFormat('open');
        return true;
      }
    }
  ];
};

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onScroll?: (event: Event) => void;
  onFormat?: (formatType: string, options?: any) => void;
  settings: EditorSettings;
}

export interface EditorRef {
  focus: () => void;
  getSelection: () => { start: number; end: number };
  setSelection: (start: number, end: number) => void;
  getValue: () => string;
  insertText: (text: string, start?: number, end?: number) => void;
  openSearchPanel: () => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(({ value, onChange, onScroll, onFormat, settings }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => viewRef.current?.focus(),
    getSelection: () => {
      const view = viewRef.current;
      if (!view) return { start: 0, end: 0 };
      return {
        start: view.state.selection.main.from,
        end: view.state.selection.main.to
      };
    },
    setSelection: (start: number, end: number) => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        selection: { anchor: start, head: end }
      });
      view.focus();
    },
    getValue: () => viewRef.current?.state.doc.toString() || '',
    insertText: (text: string, start?: number, end?: number) => {
      const view = viewRef.current;
      if (!view) return;
      
      const selection = view.state.selection.main;
      const from = start !== undefined ? start : selection.from;
      const to = end !== undefined ? end : selection.to;
      
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length }
      });
      view.focus();
    },
    openSearchPanel: () => {
      const view = viewRef.current;
      if (!view) return;
      openSearchPanel(view);
    }
  }), []);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      ...createBaseSetup(settings.showLineNumbers),
      markdown(),
      javascript(),
      sql(),
      python(),
      php(),
      xml(),
      ...(settings.theme === 'dark' ? [oneDark] : []),
      keymap.of([indentWithTab, ...customSearchKeymap, ...createFormattingKeymap(onFormat)]),
      // Enable native scrolling
      EditorView.scrollMargins.of(() => ({ top: 0, bottom: 0 })),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          const selection = update.state.selection.main;
          // console.log('🔵 EDITOR CHANGE - Cursor at:', selection.from, 'Content length:', newValue.length);
          onChange(newValue);
        }
      }),
      EditorView.domEventHandlers({
        scroll: (event) => {
          if (onScroll) {
            // Make sure we're getting the right scroll element
            const scrollElement = event.target as HTMLElement;
            if (scrollElement && scrollElement.classList.contains('cm-scroller')) {
              onScroll(event);
            }
          }
        }
      }),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: `${settings.fontSize}px`
        },
        '.cm-editor': {
          height: '100%'
        },
        '.cm-scroller': {
          padding: '24px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          height: '100%',
          maxHeight: '100%',
          overflow: 'auto !important',
          overflowX: 'auto !important',
          overflowY: 'auto !important'
        },
        '.cm-content': {
          padding: '0',
          minHeight: '100%' // Ensure content fills the space
        },
        '.cm-focused': {
          outline: 'none'
        },
        // Theme-aware search panel styling
        '.cm-panel': {
          backgroundColor: settings.theme === 'dark' ? '#374151' : '#f3f4f6',
          border: `1px solid ${settings.theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
          borderRadius: '0.375rem'
        },
        '.cm-panel input': {
          backgroundColor: settings.theme === 'dark' ? '#1f2937' : '#ffffff',
          border: `1px solid ${settings.theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
          borderRadius: '0.25rem',
          color: settings.theme === 'dark' ? '#f9fafb' : '#111827',
          padding: '0.25rem 0.5rem'
        },
        '.cm-panel input:focus': {
          outline: 'none',
          borderColor: settings.theme === 'dark' ? '#06b6d4' : '#3b82f6'
        },
        '.cm-panel button': {
          backgroundColor: settings.theme === 'dark' ? '#4b5563' : '#e5e7eb',
          border: `1px solid ${settings.theme === 'dark' ? '#6b7280' : '#d1d5db'}`,
          borderRadius: '0.25rem',
          color: settings.theme === 'dark' ? '#f9fafb' : '#374151',
          padding: '0.25rem 0.5rem',
          margin: '0 0.125rem'
        },
        '.cm-panel button:hover': {
          backgroundColor: settings.theme === 'dark' ? '#6b7280' : '#d1d5db'
        },
        '.cm-panel label': {
          color: settings.theme === 'dark' ? '#d1d5db' : '#6b7280'
        },
        '.cm-searchMatch': {
          backgroundColor: '#fbbf24',
          color: '#000000'
        },
        '.cm-searchMatch-selected': {
          backgroundColor: '#f59e0b',
          color: '#000000'
        }
      })
    ];

    const startState = EditorState.create({
      doc: value,
      extensions
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;
    
    // Force scrollbar styles with MutationObserver to continuously enforce them
    const forceScrollbarStyles = () => {
      const scrollerElement = editorRef.current?.querySelector('.cm-scroller') as HTMLElement;
      if (scrollerElement) {
        scrollerElement.style.setProperty('overflow-y', 'auto', 'important');
        scrollerElement.style.setProperty('overflow-x', 'auto', 'important');
        scrollerElement.style.setProperty('overflow', 'auto', 'important');
        scrollerElement.style.setProperty('scrollbar-width', 'auto', 'important');
        scrollerElement.style.setProperty('scrollbar-color', settings.theme === 'dark' ? '#64748b #1e293b' : '#9ca3af #ffffff', 'important');
      }
    };
    
    // Apply styles immediately
    setTimeout(forceScrollbarStyles, 50);
    
    // Set up MutationObserver to re-apply styles if CodeMirror changes them
    const observer = new MutationObserver(() => {
      forceScrollbarStyles();
    });
    
    if (editorRef.current) {
      observer.observe(editorRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    // Store observer for cleanup
    (view as any)._scrollbarObserver = observer;

    return () => {
      // Cleanup MutationObserver
      if ((view as any)._scrollbarObserver) {
        (view as any)._scrollbarObserver.disconnect();
      }
      view.destroy();
    };
  }, [settings.theme, settings.fontSize, settings.showLineNumbers]); // Only re-render when specific settings change

  // DO NOT update editor content from value prop during normal typing!
  // This causes cursor jumps. Content updates should only happen during tab switches
  // which are handled by recreating the editor with new initial content.

  // Force native scrollbars on CodeMirror with maximum specificity
  const scrollbarStyles = `
    .cm-editor .cm-scroller,
    .cm-scroller,
    div.cm-editor .cm-scroller {
      overflow: auto !important;
      overflow-x: auto !important;
      overflow-y: auto !important;
      scrollbar-width: auto !important;
      scrollbar-color: ${settings.theme === 'dark' ? '#64748b #1e293b' : '#9ca3af #ffffff'} !important;
    }
    
    .cm-editor .cm-scroller::-webkit-scrollbar,
    .cm-scroller::-webkit-scrollbar,
    div.cm-editor .cm-scroller::-webkit-scrollbar {
      width: 14px !important;
      height: 14px !important;
      display: block !important;
    }
    
    .cm-editor .cm-scroller::-webkit-scrollbar-track,
    .cm-scroller::-webkit-scrollbar-track,
    div.cm-editor .cm-scroller::-webkit-scrollbar-track {
      background: ${settings.theme === 'dark' ? '#1e293b' : '#ffffff'} !important;
      border-radius: 7px !important;
    }
    
    .cm-editor .cm-scroller::-webkit-scrollbar-thumb,
    .cm-scroller::-webkit-scrollbar-thumb,
    div.cm-editor .cm-scroller::-webkit-scrollbar-thumb {
      background: ${settings.theme === 'dark' ? '#64748b' : '#9ca3af'} !important;
      border-radius: 7px !important;
      border: 2px solid ${settings.theme === 'dark' ? '#1e293b' : '#ffffff'} !important;
    }
    
    .cm-editor .cm-scroller::-webkit-scrollbar-thumb:hover,
    .cm-scroller::-webkit-scrollbar-thumb:hover,
    div.cm-editor .cm-scroller::-webkit-scrollbar-thumb:hover {
      background: ${settings.theme === 'dark' ? '#94a3b8' : '#6b7280'} !important;
    }
    
    .cm-editor .cm-scroller::-webkit-scrollbar-corner,
    .cm-scroller::-webkit-scrollbar-corner,
    div.cm-editor .cm-scroller::-webkit-scrollbar-corner {
      background: ${settings.theme === 'dark' ? '#1e293b' : '#ffffff'} !important;
    }
  `;

  return (
    <div className={`rounded-lg h-full flex flex-col overflow-hidden ${
      settings.theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-gray-200'
    }`}>
      <style>{scrollbarStyles}</style>
      <div ref={editorRef} className="w-full h-full min-h-0" />
    </div>
  );
});
