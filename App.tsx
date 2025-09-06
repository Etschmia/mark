import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Editor, EditorRef } from './components/Editor';
import { Preview } from './components/Preview';
import { Toolbar } from './components/Toolbar';
import { FormatType, GitHubState, GitHubUser, GitHubRepository, GitHubFile, GitHubCommitOptions, FileSource } from './types';
import { themes } from './components/preview-themes';
import { EditorSettings } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { CheatSheetModal } from './components/CheatSheetModal';
import { SettingsModal } from './components/SettingsModal';
import { pwaManager } from './utils/pwaManager';
import { githubService } from './utils/githubService';
import { GitHubModal } from './components/GitHubModal';
import { SaveOptionsModal } from './components/SaveOptionsModal';

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
      const savedSettings = localStorage.getItem('markdown-editor-settings');
      
      const defaultSettings: EditorSettings = {
        theme: 'dark',
        fontSize: 14,
        debounceTime: 500,
        previewTheme: 'Default',
        autoSave: true,
        showLineNumbers: false
      };
      
      return {
        markdown: savedMarkdown || '# Hello, Markdown!\n\nStart typing here...',
        fileName: savedFileName || 'untitled.md',
        settings: savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings
      };
    } catch (error) {
      console.warn('Failed to load persisted state from localStorage:', error);
      return {
        markdown: '# Hello, Markdown!\n\nStart typing here...',
        fileName: 'untitled.md',
        settings: {
          theme: 'dark',
          fontSize: 14,
          debounceTime: 500,
          previewTheme: 'Default',
          autoSave: true,
          showLineNumbers: false
        }
      };
    }
  };

  const persistedState = getPersistedState();
  const [markdown, setMarkdown] = useState<string>(persistedState.markdown);
  const [fileName, setFileName] = useState<string>(persistedState.fileName);
  const [settings, setSettings] = useState<EditorSettings>(persistedState.settings);
  const editorRef = useRef<EditorRef>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null); // For File System Access API

  const [previewTheme, setPreviewTheme] = useState<string>(persistedState.settings.previewTheme);

  // Handle settings changes
  const handleSettingsChange = useCallback((newSettings: EditorSettings) => {
    setSettings(newSettings);
    setPreviewTheme(newSettings.previewTheme);
    
    // Persist settings to localStorage
    try {
      localStorage.setItem('markdown-editor-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Failed to persist settings to localStorage:', error);
    }
  }, []);

  // State and refs for resizing functionality
  const [isResizing, setIsResizing] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  
  // State for Undo/Redo
  const [history, setHistory] = useState<string[]>([persistedState.markdown]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const debounceRef = useRef<number | null>(null);

  // Ref to prevent scroll event loops
  const isSyncingScroll = useRef(false);

  // Modal states
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCheatSheetModalOpen, setIsCheatSheetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // GitHub integration state
  const [githubState, setGithubState] = useState<GitHubState>({
    auth: {
      isConnected: false,
      user: null,
      accessToken: null,
      tokenExpiry: null
    },
    repositories: [],
    currentRepository: null,
    currentFile: null,
    currentPath: '',
    files: [],
    isLoadingRepos: false,
    isLoadingFiles: false,
    isLoadingFile: false,
    isCommitting: false,
    error: null,
    lastSync: null
  });
  
  // GitHub modal states
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isSaveOptionsModalOpen, setIsSaveOptionsModalOpen] = useState(false);
  
  // File source tracking
  const [fileSource, setFileSource] = useState<FileSource>({ type: 'local' });
  const [originalContent, setOriginalContent] = useState<string>(''); // Track original content for change detection
  
  // PWA state
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const addHistoryEntry = useCallback((newMarkdown: string) => {
    // When a new entry is added, clear any "future" history from previous undos
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newMarkdown);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Check if current content differs from original (for GitHub files)
  const hasUnsavedChanges = useCallback(() => {
    if (fileSource.type === 'github') {
      return markdown !== originalContent;
    }
    return false; // Local files don't need change tracking for save options
  }, [markdown, originalContent, fileSource.type]);

  // Initialize PWA functionality
  useEffect(() => {
    // Handle offline status changes
    pwaManager.onOfflineStatusChange((offline) => {
      setIsOffline(offline);
      if (offline) {
        console.log('[PWA] App is now offline');
      } else {
        console.log('[PWA] App is back online');
      }
    });

    // Handle URL shortcuts from PWA
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'new') {
      // Handle new file action
      const newMarkdown = '';
      const newFileName = 'untitled.md';
      setMarkdown(newMarkdown);
      setFileName(newFileName);
      addHistoryEntry(newMarkdown);
    } else if (action === 'help') {
      setIsHelpModalOpen(true);
    }

    // Initialize GitHub authentication if token exists
    initializeGitHubAuth();
  }, [addHistoryEntry]);

  // GitHub Authentication Functions
  const initializeGitHubAuth = async () => {
    const storedToken = githubService.getStoredToken();
    if (storedToken) {
      try {
        setGithubState(prev => ({
          ...prev,
          auth: { ...prev.auth, isConnected: false }
        }));
        
        const user = await githubService.initializeWithToken(storedToken);
        
        setGithubState(prev => ({
          ...prev,
          auth: {
            isConnected: true,
            user,
            accessToken: storedToken,
            tokenExpiry: null
          },
          error: null
        }));
      } catch (error) {
        console.error('Failed to initialize GitHub auth:', error);
        setGithubState(prev => ({
          ...prev,
          auth: {
            isConnected: false,
            user: null,
            accessToken: null,
            tokenExpiry: null
          },
          error: 'Authentication failed'
        }));
      }
    }
  };

  const handleGitHubConnect = async () => {
    try {
      // Check network connectivity
      if (isOffline) {
        setGithubState(prev => ({
          ...prev,
          error: 'Cannot connect to GitHub while offline. Please check your internet connection.'
        }));
        return;
      }

      setGithubState(prev => ({
        ...prev,
        auth: { ...prev.auth, isConnected: false },
        error: null
      }));

      const deviceInfo = await githubService.initializeAuth();
      
      // Show device code to user (this would typically be in a modal)
      const userConsent = window.confirm(
        `To connect to GitHub, please visit:\n${deviceInfo.verificationUri}\n\nAnd enter code: ${deviceInfo.userCode}\n\nClick OK after completing authorization.`
      );

      if (userConsent) {
        const { token, user } = await githubService.completeAuth(deviceInfo.deviceCode);
        
        setGithubState(prev => ({
          ...prev,
          auth: {
            isConnected: true,
            user,
            accessToken: token,
            tokenExpiry: null
          },
          error: null
        }));
      }
    } catch (error) {
      console.error('GitHub connection failed:', error);
      let errorMessage = 'Connection failed';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Connection timeout. Please check your internet connection and try again.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('unauthorized')) {
          errorMessage = 'Authorization failed. Please check your GitHub credentials.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setGithubState(prev => ({
        ...prev,
        error: errorMessage
      }));
    }
  };

  const handleGitHubDisconnect = () => {
    githubService.disconnect();
    setGithubState({
      auth: {
        isConnected: false,
        user: null,
        accessToken: null,
        tokenExpiry: null
      },
      repositories: [],
      currentRepository: null,
      currentFile: null,
      currentPath: '',
      files: [],
      isLoadingRepos: false,
      isLoadingFiles: false,
      isLoadingFile: false,
      isCommitting: false,
      error: null,
      lastSync: null
    });
    setFileSource({ type: 'local' });
  };

  const handleBrowseRepositories = async () => {
    if (!githubState.auth.isConnected) {
      await handleGitHubConnect();
      return;
    }

    // Check network connectivity
    if (isOffline) {
      setGithubState(prev => ({
        ...prev,
        error: 'Cannot browse repositories while offline. Please check your internet connection.'
      }));
      return;
    }

    try {
      setGithubState(prev => ({ ...prev, isLoadingRepos: true, error: null }));
      
      const repositories = await githubService.getRepositories({
        sort: 'updated',
        per_page: 50
      });
      
      setGithubState(prev => ({
        ...prev,
        repositories,
        isLoadingRepos: false
      }));
      
      setIsGitHubModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      let errorMessage = 'Failed to load repositories';
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
        } else if (error.message.includes('unauthorized') || error.message.includes('Invalid or expired token')) {
          errorMessage = 'GitHub authentication expired. Please reconnect.';
          // Auto-disconnect on auth errors
          handleGitHubDisconnect();
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setGithubState(prev => ({
        ...prev,
        isLoadingRepos: false,
        error: errorMessage
      }));
    }
  };

  const handleRepositorySelect = async (repository: GitHubRepository) => {
    try {
      setGithubState(prev => ({
        ...prev,
        currentRepository: repository,
        currentPath: '',
        isLoadingFiles: true,
        error: null
      }));

      const files = await githubService.getRepositoryContents(
        repository.owner.login,
        repository.name
      );
      
      setGithubState(prev => ({
        ...prev,
        files,
        isLoadingFiles: false
      }));
    } catch (error) {
      console.error('Failed to load repository contents:', error);
      setGithubState(prev => ({
        ...prev,
        isLoadingFiles: false,
        error: error instanceof Error ? error.message : 'Failed to load repository contents'
      }));
    }
  };

  const handleFileSelect = async (file: GitHubFile) => {
    if (file.type !== 'file' || !file.path.endsWith('.md')) {
      return;
    }

    try {
      setGithubState(prev => ({ ...prev, isLoadingFile: true, error: null }));
      
      const content = await githubService.getFileContent(
        githubState.currentRepository!.owner.login,
        githubState.currentRepository!.name,
        file.path
      );
      
      // Load the file into the editor
      setMarkdown(content);
      setFileName(file.name);
      addHistoryEntry(content);
      setOriginalContent(content); // Track original content for change detection
      
      // Update file source and GitHub state
      setFileSource({
        type: 'github',
        repository: githubState.currentRepository!,
        path: file.path,
        sha: file.sha
      });
      
      setGithubState(prev => ({
        ...prev,
        currentFile: file,
        isLoadingFile: false
      }));
      
      setIsGitHubModalOpen(false);
    } catch (error) {
      console.error('Failed to load file:', error);
      setGithubState(prev => ({
        ...prev,
        isLoadingFile: false,
        error: error instanceof Error ? error.message : 'Failed to load file'
      }));
    }
  };

  const handleGitHubNavigate = async (path: string) => {
    if (!githubState.currentRepository) return;

    try {
      setGithubState(prev => ({ ...prev, currentPath: path, isLoadingFiles: true }));
      
      const files = await githubService.getRepositoryContents(
        githubState.currentRepository.owner.login,
        githubState.currentRepository.name,
        path
      );
      
      setGithubState(prev => ({
        ...prev,
        files,
        isLoadingFiles: false
      }));
    } catch (error) {
      console.error('Failed to navigate:', error);
      setGithubState(prev => ({
        ...prev,
        isLoadingFiles: false,
        error: error instanceof Error ? error.message : 'Failed to navigate'
      }));
    }
  };

  const handleGitHubSave = async (options: GitHubCommitOptions) => {
    if (!githubState.currentRepository || !githubState.currentFile) {
      throw new Error('No GitHub file selected');
    }

    try {
      setGithubState(prev => ({ ...prev, isCommitting: true, error: null }));
      
      const result = await githubService.saveFile(
        githubState.currentRepository.owner.login,
        githubState.currentRepository.name,
        githubState.currentFile.path,
        markdown,
        {
          ...options,
          sha: fileSource.sha // Include current SHA for updates
        }
      );
      
      // Update file source with new SHA and original content
      setFileSource(prev => ({
        ...prev,
        sha: result.content.sha
      }));
      setOriginalContent(markdown); // Update original content after successful save
      
      setGithubState(prev => ({
        ...prev,
        currentFile: result.content,
        isCommitting: false,
        lastSync: Date.now()
      }));
      
      setIsSaveOptionsModalOpen(false);
    } catch (error) {
      console.error('Failed to save to GitHub:', error);
      setGithubState(prev => ({
        ...prev,
        isCommitting: false,
        error: error instanceof Error ? error.message : 'Failed to save to GitHub'
      }));
      throw error; // Re-throw so the modal can handle it
    }
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    
    // Persist to localStorage immediately for content changes (if auto-save enabled)
    if (settings.autoSave) {
      try {
        localStorage.setItem('markdown-editor-content', newMarkdown);
      } catch (error) {
        console.warn('Failed to persist markdown content to localStorage:', error);
      }
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      addHistoryEntry(newMarkdown);
    }, settings.debounceTime); // Use settings debounce time
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
    
    // Reset file source to local
    setFileSource({ type: 'local' });
    setGithubState(prev => ({ ...prev, currentFile: null }));
    setOriginalContent(''); // Reset original content tracking
    
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
        
        // Reset to local file source
        setFileSource({ type: 'local' });
        setGithubState(prev => ({ ...prev, currentFile: null }));
        
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
          
          // Reset to local file source
          setFileSource({ type: 'local' });
          setGithubState(prev => ({ ...prev, currentFile: null }));
          
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
    // If this is a GitHub file, show save options modal
    if (fileSource.type === 'github' && githubState.auth.isConnected) {
      setIsSaveOptionsModalOpen(true);
      return;
    }

    // Original local save logic
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
  }, [markdown, fileName, fileSource, githubState.auth.isConnected]);
  
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
    <div className={`flex flex-col h-screen font-sans ${
      settings.theme === 'dark' 
        ? 'bg-slate-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-orange-600 text-white text-center py-2 text-sm font-medium">
          📡 You're offline - Your work is saved locally and will sync when back online
        </div>
      )}
      
      {/* GitHub Error Display */}
      {githubState.error && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {githubState.error}
          <button 
            onClick={() => setGithubState(prev => ({ ...prev, error: null }))}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <header className={`flex-shrink-0 shadow-md z-10 ${
        settings.theme === 'dark'
          ? 'bg-slate-800 border-b border-slate-700'
          : 'bg-white border-b border-gray-200'
      }`}>
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
          settings={settings}
          onSettingsChange={handleSettingsChange}
          isHelpModalOpen={isHelpModalOpen}
          setIsHelpModalOpen={setIsHelpModalOpen}
          isCheatSheetModalOpen={isCheatSheetModalOpen}
          setIsCheatSheetModalOpen={setIsCheatSheetModalOpen}
          isSettingsModalOpen={isSettingsModalOpen}
          setIsSettingsModalOpen={setIsSettingsModalOpen}
          // GitHub integration props
          githubState={githubState}
          onGitHubConnect={handleGitHubConnect}
          onGitHubDisconnect={handleGitHubDisconnect}
          onBrowseRepositories={handleBrowseRepositories}
          fileSource={fileSource}
        />
      </header>
      <main
        ref={mainRef}
        className="flex-grow grid grid-cols-1 md:grid-cols-[50%_auto_1fr] gap-2 p-4 overflow-hidden"
      >
        <Editor 
          value={markdown} 
          onChange={handleMarkdownChange}
          onScroll={() => handleScroll('editor')}
          onFormat={handleFormat}
          settings={settings}
          ref={editorRef}
        />
        
        <div
          onMouseDown={handleMouseDown}
          className="w-1 cursor-col-resize hidden md:flex items-center justify-center group"
          aria-label="Resize panels"
          role="separator"
        >
          <div className="w-0.5 h-12 bg-slate-700 rounded-full group-hover:bg-cyan-500 transition-colors duration-150" />
        </div>

        <Preview 
          markdown={markdown} 
          theme={previewTheme} 
          onScroll={() => handleScroll('preview')}
          ref={previewRef}
        />
      </main>
      
      {/* Modals rendered at app level for proper z-index */}
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
      
      <CheatSheetModal 
        isOpen={isCheatSheetModalOpen} 
        onClose={() => setIsCheatSheetModalOpen(false)} 
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        availablePreviewThemes={Object.keys(themes)}
      />

      {/* GitHub Integration Modals */}
      <GitHubModal 
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        repositories={githubState.repositories}
        selectedRepository={githubState.currentRepository}
        currentPath={githubState.currentPath}
        files={githubState.files}
        onRepositorySelect={handleRepositorySelect}
        onFileSelect={handleFileSelect}
        onNavigate={handleGitHubNavigate}
        isLoading={githubState.isLoadingRepos}
        isLoadingFiles={githubState.isLoadingFiles}
        error={githubState.error || undefined}
      />
      
      <SaveOptionsModal 
        isOpen={isSaveOptionsModalOpen}
        onClose={() => setIsSaveOptionsModalOpen(false)}
        currentFile={githubState.currentFile || undefined}
        hasChanges={hasUnsavedChanges()}
        onLocalSave={handleSaveFile}
        onGitHubSave={handleGitHubSave}
        isCommitting={githubState.isCommitting}
        commitError={githubState.error || undefined}
        isConnected={githubState.auth.isConnected}
        canPush={githubState.currentRepository?.permissions?.push ?? false}
      />
    </div>
  );
};

export default App;