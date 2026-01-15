
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState, Compartment, Extension } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { indentWithTab } from '@codemirror/commands';
import { searchKeymap, openSearchPanel } from '@codemirror/search';
import { EditorSettings } from './SettingsModal';

// Import CodeMirror theme creation function
import { createTheme } from '@uiw/codemirror-themes';

// Import central theme configuration
import { themeMap, getThemeExtension } from '../utils/themes';

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

// Dynamic imports for language modules
type LanguageModule = {
  javascript?: any;
  sql?: any;
  python?: any;
  php?: any;
  xml?: any;
};

// Cache for dynamically loaded modules
const languageCache: LanguageModule = {};

// Dynamic language loader
const loadLanguage = async (language: string) => {
  if (languageCache[language as keyof LanguageModule]) {
    return languageCache[language as keyof LanguageModule];
  }

  try {
    let module;
    switch (language) {
      case 'javascript':
        module = await import('@codemirror/lang-javascript');
        languageCache.javascript = module.javascript;
        return module.javascript;
      case 'sql':
        module = await import('@codemirror/lang-sql');
        languageCache.sql = module.sql;
        return module.sql;
      case 'python':
        module = await import('@codemirror/lang-python');
        languageCache.python = module.python;
        return module.python;
      case 'php':
        module = await import('@codemirror/lang-php');
        languageCache.php = module.php;
        return module.php;
      case 'xml':
        module = await import('@codemirror/lang-xml');
        languageCache.xml = module.xml;
        return module.xml;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to load language module: ${language}`, error);
    return null;
  }
};

// Theme compartment will be created per editor instance to avoid conflicts

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
  onChange: (value: string, cursor?: { line: number, column: number }) => void;
  onScroll?: (event: Event) => void;
  onFormat?: (formatType: string, options?: any) => void;
  settings: EditorSettings;
  codemirrorTheme?: string; // Legacy string based theme
  theme?: Extension; // Direct extension theme
}

export interface EditorRef {
  focus: () => void;
  getSelection: () => { start: number; end: number };
  setSelection: (start: number, end: number) => void;
  getValue: () => string;
  insertText: (text: string, start?: number, end?: number) => void;
  setValue: (value: string) => void;
  openSearchPanel: () => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(({ value, onChange, onScroll, onFormat, settings, codemirrorTheme = 'basicDark', theme }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Create theme compartment per editor instance to avoid conflicts
  const themeCompartment = useRef(new Compartment()).current;

  // Debug: Log available themes on first render
  useEffect(() => {
    console.log('Available CodeMirror themes:', Object.keys(themeMap));
    console.log('Current theme:', codemirrorTheme);
    console.log('Okaidia theme object:', themeMap.okaidia);
  }, []);

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
    setValue: (value: string) => {
      const view = viewRef.current;
      if (!view) return;

      const currentContent = view.state.doc.toString();
      if (currentContent !== value) {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: value
          },
          selection: { anchor: Math.min(view.state.selection.main.anchor, value.length) }
        });
      }
    },
    openSearchPanel: () => {
      const view = viewRef.current;
      if (!view) return;
      openSearchPanel(view);
    }
  }), []);

  // Create editor extensions with dynamic language loading
  const createEditorExtensions = async (settings: EditorSettings) => {
    const extensions = [
      ...createBaseSetup(settings.showLineNumbers),
      markdown(), // Markdown is always loaded since it's the primary language
      keymap.of([indentWithTab, ...customSearchKeymap, ...createFormattingKeymap(onFormat)]),
      // Enable native scrolling
      EditorView.scrollMargins.of(() => ({ top: 0, bottom: 0 })),
      EditorView.updateListener.of((update) => {
        // Check if document changed or selection changed
        if (update.docChanged || update.selectionSet) {
          const newValue = update.state.doc.toString();
          const selection = update.state.selection.main;

          // Calculate line and column from cursor position
          const pos = selection.from;
          const line = update.state.doc.lineAt(pos);
          const column = pos - line.from + 1; // 1-based indexing
          const lineNum = line.number;

          // console.log('🔵 EDITOR CHANGE - Cursor at:', selection.from, 'Content length:', newValue.length);
          onChange(newValue, { line: lineNum, column: column });
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
        // Only style search panel if no CodeMirror theme is applied or for light themes
        ...(codemirrorTheme === 'basicLight' || codemirrorTheme === 'githubLight' || codemirrorTheme === 'materialLight' || codemirrorTheme === 'solarizedLight' || codemirrorTheme === 'bbedit' ? {
          '.cm-panel': {
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem'
          },
          '.cm-panel input': {
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            color: '#111827',
            padding: '0.25rem 0.5rem'
          },
          '.cm-panel input:focus': {
            outline: 'none',
            borderColor: '#3b82f6'
          },
          '.cm-panel button': {
            backgroundColor: '#e5e7eb',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            color: '#374151',
            padding: '0.25rem 0.5rem',
            margin: '0 0.125rem'
          },
          '.cm-panel button:hover': {
            backgroundColor: '#d1d5db'
          },
          '.cm-panel label': {
            color: '#6b7280'
          }
        } : {}),
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

    // Preload commonly used languages for better UX
    // These will be cached for future use
    const languagesToPreload = ['javascript', 'sql', 'python', 'php', 'xml'];
    const preloadPromises = languagesToPreload.map(lang => loadLanguage(lang));
    const loadedLanguages = await Promise.all(preloadPromises);

    // Add loaded languages to extensions
    loadedLanguages.forEach(lang => {
      if (lang) {
        extensions.push(lang());
      }
    });

    return extensions;
  };

  // Main effect for editor initialization
  useEffect(() => {
    if (!editorRef.current) return;

    let view: EditorView | null = null;
    let isMounted = true;

    const initializeEditor = async () => {
      try {
        const baseExtensions = await createEditorExtensions(settings);

        // Safely get the initial theme with fallback
        const initialTheme = theme || getThemeExtension(codemirrorTheme);

        if (!isMounted) return; // Component was unmounted while loading

        const startState = EditorState.create({
          doc: value,
          extensions: [
            ...baseExtensions,
            themeCompartment.of(initialTheme.flat())
          ]
        });

        view = new EditorView({
          state: startState,
          parent: editorRef.current!
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
      } catch (error) {
        console.error('Failed to initialize editor:', error);
      }
    };

    initializeEditor();

    return () => {
      isMounted = false;
      if (view) {
        // Cleanup MutationObserver
        if ((view as any)._scrollbarObserver) {
          (view as any)._scrollbarObserver.disconnect();
        }
        view.destroy();
      }
    };
  }, [settings.theme, settings.fontSize, settings.showLineNumbers]); // Don't recreate on codemirror theme change

  // Separate effect for updating CodeMirror theme without recreating the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    try {
      const newTheme = theme || getThemeExtension(codemirrorTheme);
      console.log('🎨 Updating CodeMirror theme extension');

      view.dispatch({
        effects: themeCompartment.reconfigure(Array.isArray(newTheme) ? newTheme : [newTheme])
      });
    } catch (error) {
      console.error('Failed to update CodeMirror theme:', error);
    }
  }, [codemirrorTheme, theme]);


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
    <div className="rounded-t-lg h-full flex flex-col overflow-hidden bg-app-panel border border-app-border-main">
      <style>{scrollbarStyles}</style>
      <div ref={editorRef} className="w-full h-full min-h-0" />
    </div>
  );
});
