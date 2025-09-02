
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

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onScroll?: (event: Event) => void;
}

export interface EditorRef {
  focus: () => void;
  getSelection: () => { start: number; end: number };
  setSelection: (start: number, end: number) => void;
  getValue: () => string;
  insertText: (text: string, start?: number, end?: number) => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(({ value, onChange, onScroll }, ref) => {
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
        keymap.of([indentWithTab]),
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
