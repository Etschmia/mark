import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Editor, EditorRef } from './components/Editor';
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
  // Load persisted state from localStorage
  const getPersistedState = () => {
    try {
      const savedMarkdown = localStorage.getItem('markdown-editor-content');
      const savedFileName = localStorage.getItem('markdown-editor-filename');
      return {
        markdown: savedMarkdown || '# Hello, Markdown!\n\nStart typing here...',
        fileName: savedFileName || 'untitled.md'
      };
    } catch (error) {
      console.warn('Failed to load persisted state from localStorage:', error);
      return {
        markdown: '# Hello, Markdown!\n\nStart typing here...',
        fileName: 'untitled.md'
      };
    }
  };

  const persistedState = getPersistedState();
  const [markdown, setMarkdown] = useState<string>(persistedState.markdown);
  const [fileName, setFileName] = useState<string>(persistedState.fileName);
  const editorRef = useRef<EditorRef>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null); // For File System Access API

  const [previewTheme, setPreviewTheme] = useState<string>('Default');

  // State and refs for resizing functionality
  const [isResizing, setIsResizing] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  
  // State for Undo/Redo
  const [history, setHistory] = useState<string[]>([persistedState.markdown]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const debounceRef = useRef<number | null>(null);

  // Ref to prevent scroll event loops
  const isSyncingScroll = useRef(false);

  const addHistoryEntry = useCallback((newMarkdown: string) => {
    // When a new entry is added, clear any "future" history from previous undos
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newMarkdown);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    
    // Persist to localStorage immediately for content changes
    try {
      localStorage.setItem('markdown-editor-content', newMarkdown);
    } catch (error) {
      console.warn('Failed to persist markdown content to localStorage:', error);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      addHistoryEntry(newMarkdown);
    }, 500); // Debounce delay of 500ms
  };

  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFileName = event.target.value;
    setFileName(newFileName);
    
    // Persist filename to localStorage
    try {
      localStorage.setItem('markdown-editor-filename', newFileName);
    } catch (error) {
      console.warn('Failed to persist filename to localStorage:', error);
    }
  };

  const handleNewFile = useCallback(() => {
    const newMarkdown = '';
    const newFileName = 'untitled.md';
    setMarkdown(newMarkdown);
    setFileName(newFileName);
    addHistoryEntry(newMarkdown);
    fileHandleRef.current = null; // Reset the file handle for the new file
    
    // Persist new file state to localStorage
    try {
      localStorage.setItem('markdown-editor-content', newMarkdown);
      localStorage.setItem('markdown-editor-filename', newFileName);
    } catch (error) {
      console.warn('Failed to persist new file state to localStorage:', error);
    }
    
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
        
        // Persist opened file state to localStorage
        try {
          localStorage.setItem('markdown-editor-content', content);
          localStorage.setItem('markdown-editor-filename', file.name);
        } catch (error) {
          console.warn('Failed to persist opened file state to localStorage:', error);
        }
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
          
          // Persist opened file state to localStorage
          try {
            localStorage.setItem('markdown-editor-content', content);
            localStorage.setItem('markdown-editor-filename', file.name);
          } catch (error) {
            console.warn('Failed to persist opened file state to localStorage:', error);
          }
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
                
                // Persist saved filename to localStorage
                try {
                  localStorage.setItem('markdown-editor-filename', handle.name);
                } catch (error) {
                  console.warn('Failed to persist saved filename to localStorage:', error);
                }
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
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const selectedText = editor.getValue().substring(selection.start, selection.end);
    const formattedText = `${prefix}${selectedText}${suffix}`;
    
    editor.insertText(formattedText, selection.start, selection.end);
    
    // Set selection after formatting
    const newStart = selection.start + prefix.length;
    const newEnd = newStart + selectedText.length;
    editor.setSelection(newStart, newEnd);
    
    addHistoryEntry(editor.getValue());
  };
  
  const applyLineFormatting = (prefix: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const fullText = editor.getValue();

    let lineStartIndex = fullText.lastIndexOf('\n', selection.start - 1) + 1;
    let lineEndIndex = fullText.indexOf('\n', selection.end);
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

    editor.insertText(formattedLines, lineStartIndex, lineEndIndex);
    addHistoryEntry(editor.getValue());
    
    editor.focus();
  };

  const handleFormat = useCallback((formatType: FormatType, options?: { language?: string }) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Handle file operations first
    if (formatType === 'new') {
      handleNewFile();
      return;
    }
    if (formatType === 'save' || formatType === 'saveAs') {
      handleSaveFile();
      return;
    }
    if (formatType === 'open') {
      handleOpenFile();
      return;
    }

    if (formatType === 'search') {
      editor.openSearchPanel();
      return;
    }

    if (formatType === 'code') {
        const lang = options?.language;
        const selection = editor.getSelection();
        const selectedText = editor.getValue().substring(selection.start, selection.end);
        
        // If a language is specified, always create a fenced code block
        if (lang) {
            applyFormatting(`\`\`\`${lang}\n`, '\n\`\`\`');
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
        
        const selection = editor.getSelection();
        const fullText = editor.getValue();
        const precedingChar = fullText.substring(selection.start - 1, selection.start);
        
        // Add newlines for proper block-level separation
        const prefix = (selection.start === 0 || precedingChar === '\n') ? '' : '\n\n';
        const suffix = '\n';
        const textToInsert = prefix + tableTemplate + suffix;

        editor.insertText(textToInsert, selection.start, selection.end);
        addHistoryEntry(editor.getValue());

        // Select the first header cell
        const headerStart = selection.start + prefix.length + tableTemplate.indexOf('Header 1');
        const headerEnd = headerStart + 'Header 1'.length;
        editor.setSelection(headerStart, headerEnd);
        break;
      }
      case 'image': {
        const url = window.prompt('Geben Sie die Bild-URL ein:', 'https://');
        if (url && url !== 'https://') {
          const selection = editor.getSelection();
          const altText = editor.getValue().substring(selection.start, selection.end) || 'alt text';
          const imageMarkdown = `![${altText}](${url})`;

          editor.insertText(imageMarkdown, selection.start, selection.end);
          addHistoryEntry(editor.getValue());

          // Select the alt text
          const altStart = selection.start + 2; // `![`
          const altEnd = altStart + altText.length;
          editor.setSelection(altStart, altEnd);
        }
        break;
      }
      case 'link': {
        const url = window.prompt('Geben Sie die Ziel-URL ein:', 'https://');
        if (url && url !== 'https://') {
            const selection = editor.getSelection();
            let selectedText = editor.getValue().substring(selection.start, selection.end);
            let isPlaceholder = false;
            
            if (!selectedText) {
                selectedText = 'Link-Text';
                isPlaceholder = true;
            }
            
            const linkMarkdown = `[${selectedText}](${url})`;

            editor.insertText(linkMarkdown, selection.start, selection.end);
            addHistoryEntry(editor.getValue());

            if (isPlaceholder) {
                const linkStart = selection.start + 1; // `[`
                const linkEnd = linkStart + selectedText.length;
                editor.setSelection(linkStart, linkEnd);
            } else {
                const newCursorPos = selection.start + linkMarkdown.length;
                editor.setSelection(newCursorPos, newCursorPos);
            }
        }
        break;
      }
    }
  }, [addHistoryEntry]);

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

  // --- Scroll Sync Logic ---
  const handleScroll = (source: 'editor' | 'preview') => {
    if (isSyncingScroll.current) return;

    isSyncingScroll.current = true;

    // Note: Scroll sync will need to be updated for CodeMirror
    // For now, we disable it to prevent errors
    // TODO: Implement proper scroll sync with CodeMirror API

    // Use a timeout to reset the flag
    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 100); 
  };
  // --- End Scroll Sync Logic ---

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
          markdown={markdown}
        />
      </header>
      <main
        ref={mainRef}
        className="flex-grow grid grid-cols-1 md:grid-cols-[50%_auto_1fr] gap-4 p-4 overflow-hidden"
      >
        <Editor 
          value={markdown} 
          onChange={handleMarkdownChange}
          onScroll={() => handleScroll('editor')}
          onFormat={handleFormat}
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

        <Preview 
          markdown={markdown} 
          theme={previewTheme} 
          onScroll={() => handleScroll('preview')}
          ref={previewRef}
        />
      </main>
    </div>
  );
};

export default App;