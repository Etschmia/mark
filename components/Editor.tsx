
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
}

export interface EditorRef {
  focus: () => void;
  getSelection: () => { start: number; end: number };
  setSelection: (start: number, end: number) => void;
  getValue: () => string;
  insertText: (text: string, start?: number, end?: number) => void;
  openSearchPanel: () => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(({ value, onChange, onScroll, onFormat }, ref) => {
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

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        javascript(),
        sql(),
        python(),
        php(),
        xml(),
        oneDark,
        keymap.of([indentWithTab, ...searchKeymap, ...customSearchKeymap, ...createFormattingKeymap(onFormat)]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.domEventHandlers({
          scroll: (event) => {
            if (onScroll) onScroll(event);
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px'
          },
          '.cm-editor': {
            height: '100%'
          },
          '.cm-scroller': {
            padding: '24px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
          },
          '.cm-content': {
            padding: '0',
            minHeight: '100%'
          },
          '.cm-focused': {
            outline: 'none'
          },
          // Style the search panel to match the dark theme
          '.cm-panel': {
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '0.375rem'
          },
          '.cm-panel input': {
            backgroundColor: '#1f2937',
            border: '1px solid #4b5563',
            borderRadius: '0.25rem',
            color: '#f9fafb',
            padding: '0.25rem 0.5rem'
          },
          '.cm-panel input:focus': {
            outline: 'none',
            borderColor: '#06b6d4'
          },
          '.cm-panel button': {
            backgroundColor: '#4b5563',
            border: '1px solid #6b7280',
            borderRadius: '0.25rem',
            color: '#f9fafb',
            padding: '0.25rem 0.5rem',
            margin: '0 0.125rem'
          },
          '.cm-panel button:hover': {
            backgroundColor: '#6b7280'
          },
          '.cm-panel label': {
            color: '#d1d5db'
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
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

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
    <div className="bg-slate-800 rounded-lg h-full flex flex-col">
      <div ref={editorRef} className="w-full h-full" />
    </div>
  );
});
