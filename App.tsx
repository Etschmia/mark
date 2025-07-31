
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Toolbar } from './components/Toolbar';
import { FormatType } from './types';
import { themes } from './components/preview-themes';

const App: React.FC = () => {
  const initialContent = '# Hello, Markdown!\n\nStart typing here...';
  const [markdown, setMarkdown] = useState<string>(initialContent);
  const [fileName, setFileName] = useState<string>('untitled.md');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const [previewTheme, setPreviewTheme] = useState<string>('Default');

  // State and refs for resizing functionality
  const [isResizing, setIsResizing] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  
  // State for Undo/Redo
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const debounceRef = useRef<number | null>(null);

  const addHistoryEntry = useCallback((newMarkdown: string) => {
    // When a new entry is added, clear any "future" history from previous undos
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newMarkdown);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMarkdown = event.target.value;
    setMarkdown(newMarkdown);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      addHistoryEntry(newMarkdown);
    }, 500); // Debounce delay of 500ms
  };

  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  };

  const handleNewFile = useCallback(() => {
    const newMarkdown = '';
    setMarkdown(newMarkdown);
    setFileName('untitled.md');
    addHistoryEntry(newMarkdown);
    editorRef.current?.focus();
  }, [addHistoryEntry]);

  const handleOpenFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setMarkdown(content);
          setFileName(file.name);
          addHistoryEntry(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [addHistoryEntry]);

  const handleSaveFile = useCallback(() => {
    const downloadName = fileName.trim() || 'untitled.md';
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown, fileName]);
  
  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = `${textarea.value.substring(0, start)}${prefix}${selectedText}${suffix}${textarea.value.substring(end)}`;

    setMarkdown(newText);
    addHistoryEntry(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };
  
  const applyLineFormatting = (prefix: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const fullText = textarea.value;

    let lineStartIndex = fullText.lastIndexOf('\n', start - 1) + 1;
    let lineEndIndex = fullText.indexOf('\n', end);
    if (lineEndIndex === -1) {
      lineEndIndex = fullText.length;
    }
    
    const selectedLinesText = fullText.substring(lineStartIndex, lineEndIndex);
    const lines = selectedLinesText.split('\n');
    const formattedLines = lines.map(line => {
      // Toggle off if prefix already exists
      if (line.startsWith(prefix)) {
        return line.substring(prefix.length);
      }
      return `${prefix}${line}`
    }).join('\n');

    const newText = `${fullText.substring(0, lineStartIndex)}${formattedLines}${fullText.substring(lineEndIndex)}`;
    
    setMarkdown(newText);
    addHistoryEntry(newText);
    
    setTimeout(() => {
      textarea.focus();
      // Adjust selection logic after format
    }, 0);
  };

  const handleFormat = useCallback((formatType: FormatType) => {
    switch (formatType) {
      case 'bold': applyFormatting('**'); break;
      case 'italic': applyFormatting('*'); break;
      case 'strikethrough': applyFormatting('~~'); break;
      case 'h1': applyLineFormatting('# '); break;
      case 'h2': applyLineFormatting('## '); break;
      case 'h3': applyLineFormatting('### '); break;
      case 'quote': applyLineFormatting('> '); break;
      case 'code': applyFormatting('`'); break;
      case 'ul': applyLineFormatting('* '); break;
      case 'ol': applyLineFormatting('1. '); break;
    }
  }, [addHistoryEntry]); // Dependency needed as format actions now create history

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMarkdown(history[newIndex]);
    }
  }, [history, historyIndex]);

  // --- Resizer Logic ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && mainRef.current) {
      const rect = mainRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      
      const minWidth = rect.width * 0.2;
      const maxWidth = rect.width * 0.8;

      if (newWidth > minWidth && newWidth < maxWidth) {
        const newEditorPercentage = (newWidth / rect.width) * 100;
        mainRef.current.style.gridTemplateColumns = `${newEditorPercentage}% auto 1fr`;
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);
  // --- End Resizer Logic ---

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      <header className="flex-shrink-0 bg-slate-800 border-b border-slate-700 shadow-md z-10">
        <Toolbar 
          onFormat={handleFormat}
          onNew={handleNewFile}
          onOpen={handleOpenFile}
          onSave={handleSaveFile}
          fileName={fileName}
          onFileNameChange={handleFileNameChange}
          onUndo={handleUndo}
          canUndo={historyIndex > 0}
          themes={Object.keys(themes)}
          selectedTheme={previewTheme}
          onThemeChange={setPreviewTheme}
        />
      </header>
      <main
        ref={mainRef}
        className="flex-grow grid grid-cols-1 md:grid-cols-[50%_auto_1fr] gap-4 p-4 overflow-hidden"
      >
        <Editor 
          value={markdown} 
          onChange={handleMarkdownChange}
          ref={editorRef}
        />
        
        <div
          onMouseDown={handleMouseDown}
          className="w-2 cursor-col-resize hidden md:flex items-center justify-center group"
          aria-label="Resize panels"
          role="separator"
        >
          <div className="w-1 h-12 bg-slate-700 rounded-full group-hover:bg-cyan-500 transition-colors duration-150" />
        </div>

        <Preview markdown={markdown} theme={previewTheme} />
      </main>
    </div>
  );
};

export default App;
