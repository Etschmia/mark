
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { python } from '@codemirror/lang-python';
import { php } from '@codemirror/lang-php';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';
import { searchKeymap, openSearchPanel } from '@codemirror/search';
import { lineNumbers } from '@codemirror/view';
import { EditorSettings } from './SettingsModal';

// Custom keymap to add Ctrl+F / Cmd+F for search
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
      basicSetup,
      markdown(),
      javascript(),
      sql(),
      python(),
      php(),
      xml(),
      ...(settings.theme === 'dark' ? [oneDark] : []),
      ...(settings.showLineNumbers ? [lineNumbers()] : []),
      keymap.of([indentWithTab, ...searchKeymap, ...customSearchKeymap, ...createFormattingKeymap(onFormat)]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
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
          height: '100%',
          overflow: 'hidden' // Let scroller handle overflow
        },
        '.cm-scroller': {
          padding: '24px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          overflow: 'auto',
          height: '100%',
          maxHeight: '100%'
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

    return () => {
      view.destroy();
    };
  }, [settings]); // Re-render when settings change

  // Update editor content when value prop changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    
    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value
        }
      });
    }
  }, [value]);

  return (
    <div className={`rounded-lg h-full flex flex-col overflow-hidden ${
      settings.theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-gray-200'
    }`}>
      <div ref={editorRef} className="w-full h-full min-h-0" />
    </div>
  );
});
