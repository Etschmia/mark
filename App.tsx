
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Toolbar } from './components/Toolbar';
import { FormatType } from './types';
import { themes } from './components/preview-themes';

// Minimal types for File System Access API to support modern file saving
// and avoid TypeScript errors.
interface FileSystemFileHandle {
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableFileStream>;
  name: string;
}
interface FileSystemWritableFileStream {
  write: (data: BlobPart) => Promise<void>;
  close: () => Promise<void>;
}
// Augment the global Window type
declare global {
  interface Window {
    showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
  }
}

const App: React.FC = () => {
  const initialContent = '# Hello, Markdown!\n\nStart typing here...';
  const [markdown, setMarkdown] = useState<string>(initialContent);
  const [fileName, setFileName] = useState<string>('untitled.md');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null); // For File System Access API

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
    fileHandleRef.current = null; // Reset the file handle for the new file
    editorRef.current?.focus();
  }, [addHistoryEntry]);

  const handleOpenFile = useCallback(async () => {
    // Modern "Open" logic using File System Access API
    if (window.showOpenFilePicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Markdown Files',
            accept: { 'text/markdown': ['.md', '.txt', '.markdown'] }
          }],
        });
        fileHandleRef.current = handle;
        const file = await handle.getFile();
        const content = await file.text();
        setMarkdown(content);
        setFileName(file.name);
        addHistoryEntry(content);
        return; // Success: exit and don't fall through
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return; // User cancelled the picker, do nothing.
        }
        console.warn('Modern file open failed, falling back to legacy open:', err);
        // For other errors (like cross-origin), we fall through to the legacy method.
      }
    }

    // Legacy fallback "Open" for older browsers or when modern API fails
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.markdown';
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
          fileHandleRef.current = null; // Ensure handle is cleared for legacy open
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [addHistoryEntry]);

  const handleSaveFile = useCallback(async () => {
    const saveOperation = async (handle: FileSystemFileHandle) => {
        const writable = await handle.createWritable();
        await writable.write(markdown);
        await writable.close();
    };

    // Modern "Save" / "Save As" logic using File System Access API
    if (window.showSaveFilePicker) {
        try {
            if (fileHandleRef.current) {
                // "Save" to the existing file handle
                await saveOperation(fileHandleRef.current);
            } else {
                // "Save As" for a new file
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName.trim() || 'untitled.md',
                    types: [{
                        description: 'Markdown Files',
                        accept: { 'text/markdown': ['.md', '.txt', '.markdown'] }
                    }],
                });
                fileHandleRef.current = handle;
                setFileName(handle.name);
                await saveOperation(handle);
            }
            return; // Success: exit and don't fall through
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                return; // User cancelled, do nothing.
            }
            console.warn('Modern file save failed, falling back to legacy download:', err);
            // For other errors (like cross-origin), we fall through to the legacy method.
        }
    }

    // Legacy fallback "Save" (always triggers a download)
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

  const handleFormat = useCallback((formatType: FormatType, options?: { language?: string }) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    if (formatType === 'code') {
        const lang = options?.language;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        // If a language is specified, always create a fenced code block
        if (lang) {
            applyFormatting(`\`\`\`${lang}\n`, '\n```');
        } else { // "Default Code": use logic for inline vs block
            if (selectedText.includes('\n') || !selectedText) {
                applyFormatting('```\n', '\n```');
            } else {
                applyFormatting('`');
            }
        }
        return;
    }

    switch (formatType) {
      case 'bold': applyFormatting('**'); break;
      case 'italic': applyFormatting('*'); break;
      case 'strikethrough': applyFormatting('~~'); break;
      case 'h1': applyLineFormatting('# '); break;
      case 'h2': applyLineFormatting('## '); break;
      case 'h3': applyLineFormatting('### '); break;
      case 'quote': applyLineFormatting('> '); break;
      case 'ul': applyLineFormatting('* '); break;
      case 'ol': applyLineFormatting('1. '); break;
      case 'checklist': applyLineFormatting('- [ ] '); break;
      case 'table': {
        const tableTemplate = `| Header 1 | Header 2 |\n|:---------|:---------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |`;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const precedingChar = textarea.value.substring(start - 1, start);
        
        // Add newlines for proper block-level separation
        const prefix = (start === 0 || precedingChar === '\n') ? '' : '\n\n';
        const suffix = '\n';
        const textToInsert = prefix + tableTemplate + suffix;

        const newText = `${textarea.value.substring(0, start)}${textToInsert}${textarea.value.substring(end)}`;

        setMarkdown(newText);
        addHistoryEntry(newText);

        setTimeout(() => {
          textarea.focus();
          const selectionStart = start + prefix.length + tableTemplate.indexOf('Header 1');
          const selectionEnd = selectionStart + 'Header 1'.length;
          textarea.setSelectionRange(selectionStart, selectionEnd);
        }, 0);
        break;
      }
      case 'image': {
        const url = window.prompt('Geben Sie die Bild-URL ein:', 'https://');
        if (url && url !== 'https://') {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const altText = textarea.value.substring(start, end) || 'alt text';
          const imageMarkdown = `![${altText}](${url})`;

          const newText = `${textarea.value.substring(0, start)}${imageMarkdown}${textarea.value.substring(end)}`;
          
          setMarkdown(newText);
          addHistoryEntry(newText);

          setTimeout(() => {
            textarea.focus();
            const selectionStart = start + 2; // `![`
            const selectionEnd = selectionStart + altText.length;
            textarea.setSelectionRange(selectionStart, selectionEnd);
          }, 0);
        }
        break;
      }
      case 'link': {
        const url = window.prompt('Geben Sie die Ziel-URL ein:', 'https://');
        if (url && url !== 'https://') {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            let selectedText = textarea.value.substring(start, end);
            let isPlaceholder = false;
            
            if (!selectedText) {
                selectedText = 'Link-Text';
                isPlaceholder = true;
            }
            
            const linkMarkdown = `[${selectedText}](${url})`;

            const newText = `${textarea.value.substring(0, start)}${linkMarkdown}${textarea.value.substring(end)}`;
            
            setMarkdown(newText);
            addHistoryEntry(newText);

            setTimeout(() => {
                textarea.focus();
                if (isPlaceholder) {
                    const selectionStart = start + 1; // `[`
                    const selectionEnd = selectionStart + selectedText.length;
                    textarea.setSelectionRange(selectionStart, selectionEnd);
                } else {
                    const newCursorPos = start + linkMarkdown.length;
                    textarea.setSelectionRange(newCursorPos, newCursorPos);
                }
            }, 0);
        }
        break;
      }
    }
  }, [addHistoryEntry, markdown]);

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
