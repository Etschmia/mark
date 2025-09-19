import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Editor, EditorRef } from './components/Editor';
import { Preview } from './components/Preview';
import { Toolbar } from './components/Toolbar';
import { TabBar } from './components/TabBar';
import { FormatType, GitHubState, GitHubUser, GitHubRepository, GitHubFile, GitHubCommitOptions, FileSource, TabManagerState, Tab, EditorState } from './types';
import { themes } from './components/preview-themes';
import { EditorSettings } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { CheatSheetModal } from './components/CheatSheetModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { UpdateInfoModal } from './components/UpdateInfoModal';
import { pwaManager } from './utils/pwaManager';
import { githubService } from './utils/githubService';
import { GitHubModal } from './components/GitHubModal';
import { SaveOptionsModal } from './components/SaveOptionsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { TabManager } from './utils/tabManager';
import { TabContextMenu } from './components/TabContextMenu';
import { checkAndInstallUpdate, checkUpdateCompletion } from './utils/updateManager';
import { StatusBar } from './components/StatusBar';
import { LinterPanel } from './components/LinterPanel';
import { lintMarkdown, LintResult, LintError, applyAutoFix } from './utils/markdownLinter';

// Import the new hooks and services
import { useTabManager } from './hooks/useTabManager';
import { useFileService } from './services/fileService';
import { useGitHubServiceHandlers } from './services/githubServiceHandlers';
import { useFormatting } from './hooks/useFormatting';
import { useHistoryManager } from './hooks/useHistoryManager';
import { useLinter } from './hooks/useLinter';
import { useResizer } from './hooks/useResizer';
import { useScrollSync } from './hooks/useScrollSync';
import { useUpdateService } from './services/updateService';

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

// Import central theme configuration
import { themeMap, formatThemeName } from './utils/themes';

const App: React.FC = () => {
  // Initialize TabManager
  const tabManagerRef = useRef<TabManager>(new TabManager());
  const [tabManagerState, setTabManagerState] = useState<TabManagerState>(tabManagerRef.current.getState());

  // Load persisted state from localStorage (for settings only, tabs are handled by TabManager)
  const getPersistedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('markdown-editor-settings');

      const defaultSettings: EditorSettings = {
        theme: 'dark',
        fontSize: 14,
        debounceTime: 500,
        previewTheme: 'Default',
        autoSave: true,
        showLineNumbers: false
      };

      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.warn('Failed to load persisted settings from localStorage:', error);
      return {
        theme: 'dark',
        fontSize: 14,
        debounceTime: 500,
        previewTheme: 'Default',
        autoSave: true,
        showLineNumbers: false
      };
    }
  };

  const persistedSettings = getPersistedSettings();

  // Get active tab for current state
  const activeTab = tabManagerRef.current.getActiveTab();

  // Keep the markdown state for other components that need it (preview, etc.)
  const [markdown, setMarkdown] = useState<string>(activeTab?.content || '');

  // Get editor content directly from active tab
  const getEditorValue = () => {
    const currentTab = tabManagerRef.current.getActiveTab();
    return currentTab?.content || '';
  };
  const [fileName, setFileName] = useState<string>(activeTab?.filename || 'untitled.md');
  const [settings, setSettings] = useState<EditorSettings>(persistedSettings);
  const editorRef = useRef<EditorRef>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(activeTab?.fileHandle || null);

  const [previewTheme, setPreviewTheme] = useState<string>(persistedSettings.previewTheme);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // Add state for CodeMirror theme
  const [codemirrorTheme, setCodemirrorTheme] = useState<string>('basicDark');
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

  // State for Undo/Redo (now managed per tab)
  const [history, setHistory] = useState<string[]>(activeTab?.history || [activeTab?.content || '']);
  const [historyIndex, setHistoryIndex] = useState(activeTab?.historyIndex || 0);
  const debounceRef = useRef<number | null>(null);

  // Ref to prevent scroll event loops
  const isSyncingScroll = useRef(false);

  // Debounce ref for editor state updates
  const editorStateDebounceRef = useRef<number | null>(null);

  // Modal states
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCheatSheetModalOpen, setIsCheatSheetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Update modal states
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);
  const [updateInfoStatus, setUpdateInfoStatus] = useState<'success' | 'fail' | 'unchanged'>('unchanged');
  const [updateBuildInfo, setUpdateBuildInfo] = useState<any>(null);

  // Tab context menu state
  const [isTabContextMenuOpen, setIsTabContextMenuOpen] = useState(false);
  const [tabContextMenuPosition, setTabContextMenuPosition] = useState({ x: 0, y: 0 });
  const [tabContextMenuTabId, setTabContextMenuTabId] = useState<string | null>(null);

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

  // Tab confirmation modal states
  const [isTabConfirmationOpen, setIsTabConfirmationOpen] = useState(false);
  const [tabConfirmationData, setTabConfirmationData] = useState<{
    type: 'close' | 'closeOthers' | 'closeAll';
    tabId?: string;
    tabName?: string;
    callback?: () => void;
  } | null>(null);

  // File source tracking (now managed per tab)
  const [fileSource, setFileSource] = useState<FileSource>(activeTab?.fileSource || { type: 'local' });
  const [originalContent, setOriginalContent] = useState<string>(activeTab?.originalContent || ''); // Track original content for change detection

  // PWA state
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Linter state
  const [lintResult, setLintResult] = useState<LintResult>({ errors: [], errorCount: 0, warningCount: 0 });
  const [isLinterPanelVisible, setIsLinterPanelVisible] = useState(false);
  const [isLinterActive, setIsLinterActive] = useState(false);
  const lintDebounceRef = useRef<number | null>(null);

  // Use the tab manager hook
  const {
    syncActiveTabToState,
    createNewTab,
    closeTab,
    forceCloseTab,
    switchToTab,
    duplicateTab,
    closeOtherTabs,
    forceCloseOtherTabs,
    closeAllTabs,
    forceCloseAllTabs,
    handleTabContextMenu,
    handleTabContextMenuClose,
    handleTabContextMenuCloseTab,
    handleTabContextMenuCloseOtherTabs,
    handleTabContextMenuCloseAllTabs,
    handleTabContextMenuDuplicateTab,
    handleTabConfirmationConfirm,
    handleTabConfirmationCancel,
    syncStateToActiveTab,
  } = useTabManager({
    tabManagerRef,
    setTabManagerState,
    setMarkdown,
    setFileName,
    setHistory,
    setHistoryIndex,
    setFileSource,
    setOriginalContent,
    fileHandleRef,
    editorRef,
    tabManagerState,
    isLinterActive,
    setLintResult,
    syncStateToActiveTab: () => {
      const activeTab = tabManagerRef.current.getActiveTab();
      if (activeTab) {
        // Update tab content
        tabManagerRef.current.updateTabContent(activeTab.id, markdown);

        // Update tab filename if changed
        if (activeTab.filename !== fileName) {
          tabManagerRef.current.updateTabFilename(activeTab.id, fileName);
        }

        // Update file handle if changed
        if (activeTab.fileHandle !== fileHandleRef.current) {
          tabManagerRef.current.updateTabFileHandle(activeTab.id, fileHandleRef.current as any);
        }

        // Update file source if changed
        if (JSON.stringify(activeTab.fileSource) !== JSON.stringify(fileSource)) {
          tabManagerRef.current.updateTabFileSource(activeTab.id, fileSource);
        }

        // Update original content if changed
        if (activeTab.originalContent !== originalContent) {
          tabManagerRef.current.updateTabOriginalContent(activeTab.id, originalContent);
        }

        // Update editor state if available
        if (editorRef.current) {
          const selection = editorRef.current.getSelection();
          const scrollElement = document.querySelector('.cm-scroller') as HTMLElement;
          const scrollPosition = scrollElement ? scrollElement.scrollTop : 0;

          const editorState: EditorState = {
            cursorPosition: selection.start,
            scrollPosition: scrollPosition,
            selection: { start: selection.start, end: selection.end }
          };
          tabManagerRef.current.updateTabEditorState(activeTab.id, editorState);
        }
      }
    },
    setTabConfirmationData,
    setIsTabConfirmationOpen,
    setTabContextMenuTabId,
    setTabContextMenuPosition,
    setIsTabContextMenuOpen,
  });

  // Use the file service hook
  const { handleOpenFile, handleSaveFile } = useFileService({
    tabManagerRef,
    syncStateToActiveTab,
    githubState,
    setIsSaveOptionsModalOpen,
    setFileName,
    fileHandleRef,
    setGithubState,
    createNewTab,
    switchToTab,
  });

  // Use the GitHub service handlers hook
  const {
    handleGitHubConnect,
    handleGitHubDisconnect,
    handleBrowseRepositories,
    handleRepositorySelect,
    handleFileSelect,
    handleGitHubNavigate,
    handleGitHubSave,
  } = useGitHubServiceHandlers({
    githubState,
    setGithubState,
    isOffline,
    setIsGitHubModalOpen,
    createNewTab,
    switchToTab,
    tabManagerRef,
    syncStateToActiveTab,
    setFileSource,
    setOriginalContent,
    setIsSaveOptionsModalOpen,
  });

  // Use the history manager hook
  const { addHistoryEntry, handleUndo } = useHistoryManager({
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    tabManagerRef,
    setMarkdown,
  });

  // Use the linter hook
  const { handleLinterToggle, handleLinterErrorClick, handleAutoFix, runLinter } = useLinter({
    isLinterActive,
    setIsLinterActive,
    isLinterPanelVisible,
    setIsLinterPanelVisible,
    editorRef,
    setLintResult,
    lintDebounceRef,
    tabManagerRef,
    setMarkdown,
    addHistoryEntry,
  });

  // Use the formatting hook
  const { applyFormatting, applyLineFormatting, handleFormat } = useFormatting({
    editorRef,
    addHistoryEntry,
    handleNewFile: () => {
      // Create new tab with default welcome content (no parameters = default tab)
      createNewTab();

      // Reset GitHub state for new file
      setGithubState(prev => ({ ...prev, currentFile: null }));

      editorRef.current?.focus();
    },
    handleSaveFile,
    handleOpenFile,
    runLinter,
  });

  // Use the resizer hook
  const { handleMouseDown, handleMouseUp, handleMouseMove } = useResizer({
    isResizing,
    setIsResizing,
    mainRef,
  });

  // Use the scroll sync hook
  const handleEditorScroll = useCallback((event: Event) => {
    if (isSyncingScroll.current) return;

    const activeTab = tabManagerRef.current.getActiveTab();
    if (!activeTab || !editorRef.current) return;

    // Debounce editor state updates to avoid excessive calls
    if (editorStateDebounceRef.current) {
      clearTimeout(editorStateDebounceRef.current);
    }

    editorStateDebounceRef.current = window.setTimeout(() => {
      const selection = editorRef.current!.getSelection();
      const scrollElement = event.target as HTMLElement;
      const scrollPosition = scrollElement.scrollTop;

      const editorState: EditorState = {
        cursorPosition: selection.start,
        scrollPosition: scrollPosition,
        selection: { start: selection.start, end: selection.end }
      };

      tabManagerRef.current.updateTabEditorState(activeTab.id, editorState);
    }, 100); // 100ms debounce for editor state updates
  }, []);

  const { handleScroll } = useScrollSync({
    isSyncingScroll,
    previewRef,
    editorRef,
    tabManagerRef,
    editorStateDebounceRef,
    handleEditorScroll,
  });

  // Use the update service hook
  const { handleUpdate } = useUpdateService({
    setUpdateInfoStatus,
    setUpdateBuildInfo,
    setIsUpdateInfoModalOpen,
  });

  // Tab Manager subscription and initialization
  useEffect(() => {
    let lastActiveTabId = tabManagerRef.current.getState().activeTabId;

    // Initialize with the active tab content on first load
    const initialActiveTab = tabManagerRef.current.getActiveTab();
    if (initialActiveTab) {
      // console.log('🔵 Initial tab load:', initialActiveTab.filename, initialActiveTab.content.substring(0, 50));
      setMarkdown(initialActiveTab.content);
      setFileName(initialActiveTab.filename);
      setHistory(initialActiveTab.history);
      setHistoryIndex(initialActiveTab.historyIndex);
      setFileSource(initialActiveTab.fileSource);
      setOriginalContent(initialActiveTab.originalContent);
      fileHandleRef.current = initialActiveTab.fileHandle;

      // Initial linting - removed, only on demand now
    }

    const unsubscribe = tabManagerRef.current.subscribe((newState) => {
      const previousState = tabManagerState;
      setTabManagerState(newState);

      // Only sync active tab state when the active tab actually changes (not on content updates)
      if (newState.activeTabId !== lastActiveTabId) {
        // console.log('🟢 REAL TAB SWITCH detected:', lastActiveTabId, '→', newState.activeTabId);
        lastActiveTabId = newState.activeTabId;
        syncActiveTabToState();
      }
    });

    return () => {
      unsubscribe();

      // Cleanup debounce timers
      if (editorStateDebounceRef.current) {
        clearTimeout(editorStateDebounceRef.current);
      }

      // Cleanup tab manager
      tabManagerRef.current.destroy();
    };
  }, []);

  // Keyboard shortcuts for tab navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // Don't handle shortcuts when typing in input fields or modals are open
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      const isModalOpen = isHelpModalOpen || isCheatSheetModalOpen || isSettingsModalOpen || isAboutModalOpen || isGitHubModalOpen || isSaveOptionsModalOpen || isTabConfirmationOpen;

      if (isInputField || isModalOpen) {
        return;
      }

      // Tab navigation shortcuts
      if (ctrlOrCmd) {
        const tabs = tabManagerRef.current.getTabs();
        const currentTabIndex = tabs.findIndex(tab => tab.id === tabManagerState.activeTabId);

        switch (event.key) {
          case 'Tab':
            event.preventDefault();
            if (event.shiftKey) {
              // Ctrl/Cmd + Shift + Tab: Previous tab
              const prevIndex = currentTabIndex > 0 ? currentTabIndex - 1 : tabs.length - 1;
              if (tabs[prevIndex]) {
                switchToTab(tabs[prevIndex].id);
              }
            } else {
              // Ctrl/Cmd + Tab: Next tab
              const nextIndex = currentTabIndex < tabs.length - 1 ? currentTabIndex + 1 : 0;
              if (tabs[nextIndex]) {
                switchToTab(tabs[nextIndex].id);
              }
            }
            break;

          case 'w':
            // Ctrl/Cmd + W: Close active tab
            event.preventDefault();
            if (tabManagerState.activeTabId) {
              closeTab(tabManagerState.activeTabId);
            }
            break;

          case 'T':
            // Ctrl/Cmd + Shift + T: Create new tab
            if (event.shiftKey) {
              event.preventDefault();
              createNewTab();
            }
            break;

          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            // Ctrl/Cmd + 1-9: Switch to tab by number
            event.preventDefault();
            const tabNumber = parseInt(event.key) - 1;
            if (tabs[tabNumber]) {
              switchToTab(tabs[tabNumber].id);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabManagerState.activeTabId, isHelpModalOpen, isCheatSheetModalOpen, isSettingsModalOpen, isAboutModalOpen, isGitHubModalOpen, isSaveOptionsModalOpen, isTabConfirmationOpen, switchToTab, closeTab, createNewTab]);

  // Check if current content differs from original (for GitHub files)
  const hasUnsavedChanges = useCallback(() => {
    const activeTab = tabManagerRef.current.getActiveTab();
    if (!activeTab) return false;

    if (activeTab.fileSource.type === 'github') {
      return activeTab.content !== activeTab.originalContent;
    }
    return false; // Local files don't need change tracking for save options
  }, []);

  // Check if there are unsaved changes for toolbar display
  const hasUnsavedChangesForToolbar = useCallback(() => {
    const activeTab = tabManagerRef.current.getActiveTab();
    if (!activeTab) return false;

    // Default placeholder content should not be considered as unsaved changes
    const defaultContent = '# Hello, Markdown!\n\nStart typing here...';

    // If content is still the default placeholder, no unsaved changes
    if (activeTab.content === defaultContent) {
      return false;
    }

    // For GitHub files, check against original content
    if (activeTab.fileSource.type === 'github') {
      return activeTab.content !== activeTab.originalContent;
    }

    // For local files, check if tab has unsaved changes flag
    return activeTab.hasUnsavedChanges;
  }, [markdown, fileName]); // Re-evaluate when content or filename changes

  // Initialize PWA functionality
  useEffect(() => {
    // Check for completed updates
    const updateCheck = checkUpdateCompletion();
    if (updateCheck.wasUpdated) {
      // Show success modal after a brief delay to ensure app is fully loaded
      setTimeout(() => {
        setUpdateInfoStatus('success');
        // Try to get fresh build info
        fetch('/build-info.json')
          .then(response => response.json())
          .then(buildInfo => setUpdateBuildInfo(buildInfo))
          .catch(() => setUpdateBuildInfo(null))
          .finally(() => setIsUpdateInfoModalOpen(true));
      }, 1000);
    }

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
      createNewTab('', 'untitled.md', null, { type: 'local' });
    } else if (action === 'help') {
      setIsHelpModalOpen(true);
    }

    // Initialize GitHub authentication if token exists
    const initGitHub = async () => {
      try {
        // Check for OAuth callback first
        const callbackResult = await githubService.handleOAuthCallback();
        if (callbackResult) {
          setGithubState(prev => ({
            ...prev,
            auth: {
              isConnected: true,
              user: callbackResult.user,
              accessToken: callbackResult.token,
              tokenExpiry: null
            },
            error: null
          }));
          return;
        }

        // If no callback, try stored token
        await initializeGitHubAuth();
      } catch (error) {
        console.error('Failed to initialize GitHub:', error);
        // Continue without GitHub auth
      }
    };

    initGitHub();

    // Add global force update function for debugging
    (window as any).forceAppUpdate = async () => {
      console.log('🔄 Forcing app update via global function...');
      await pwaManager.forceUpdate();
    };

    // Add global function to show update banner for debugging
    (window as any).showUpdateBanner = () => {
      console.log('🔄 Showing update banner...');
      pwaManager.showUpdateBanner();
    };

    // Add cache info function for debugging
    (window as any).getCacheInfo = async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('📦 Active caches:', cacheNames);
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          console.log(`Cache ${cacheName}:`, keys.map(req => req.url));
        }
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('🔧 Service worker registrations:', registrations);
      }
    };
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

  const handleMarkdownChange = (newMarkdown: string, cursor?: { line: number, column: number }) => {
    // console.log('🟡 APP handleMarkdownChange - Tab:', tabManagerState.activeTabId, 'Length:', newMarkdown.length);
    if (cursor) {
      setCursorPosition(cursor);
    }

    // Update active tab content immediately
    const activeTab = tabManagerRef.current.getActiveTab();
    if (activeTab) {
      tabManagerRef.current.updateTabContent(activeTab.id, newMarkdown);
    }

    // Update markdown state for preview and other components
    setMarkdown(newMarkdown);

    // Debounced linting - only if linter is active
    if (isLinterActive) {
      if (lintDebounceRef.current) {
        clearTimeout(lintDebounceRef.current);
      }

      lintDebounceRef.current = window.setTimeout(() => {
        lintMarkdown(newMarkdown).then(result => {
          setLintResult(result);
        });
      }, 1000); // Lint after 1 second of inactivity
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      // Add to history after debounce
      addHistoryEntry(newMarkdown);
    }, settings.debounceTime); // Use settings debounce time
  };

  const toggleLineNumbers = () => {
    handleSettingsChange({ ...settings, showLineNumbers: !settings.showLineNumbers });
  };

  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFileName = event.target.value;
    setFileName(newFileName);

    // Update active tab filename
    const activeTab = tabManagerRef.current.getActiveTab();
    if (activeTab) {
      tabManagerRef.current.updateTabFilename(activeTab.id, newFileName);
    }
  };

  return (
    <div className={`flex flex-col h-screen font-sans ${settings.theme === 'dark'
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

      <header className={`flex-shrink-0 shadow-md z-10 ${settings.theme === 'dark'
        ? 'bg-slate-800 border-b border-slate-700'
        : 'bg-white border-b border-gray-200'
        }`}>
        <Toolbar
          onFormat={handleFormat}
          onNew={() => {
            // Create new tab with default welcome content (no parameters = default tab)
            createNewTab();

            // Reset GitHub state for new file
            setGithubState(prev => ({ ...prev, currentFile: null }));

            editorRef.current?.focus();
          }}
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
          isAboutModalOpen={isAboutModalOpen}
          setIsAboutModalOpen={setIsAboutModalOpen}
          // Update functionality
          onUpdate={handleUpdate}
          // GitHub integration props
          githubState={githubState}
          onGitHubConnect={handleGitHubConnect}
          onGitHubDisconnect={handleGitHubDisconnect}
          onBrowseRepositories={handleBrowseRepositories}
          fileSource={fileSource}
          // Save state props
          hasUnsavedChanges={hasUnsavedChangesForToolbar()}
          // Linter props
          isLinterActive={isLinterActive}
        />
      </header>
      <main
        ref={mainRef}
        className="flex-grow grid grid-cols-1 md:grid-cols-[50%_auto_1fr] gap-2 p-4 overflow-hidden"
      >
        <div className="flex flex-col min-h-0">
          {/* TabBar - conditionally rendered when multiple tabs exist */}
          <TabBar
            tabs={tabManagerState.tabs}
            activeTabId={tabManagerState.activeTabId}
            onTabSelect={switchToTab}
            onTabClose={closeTab}
            onTabCreate={() => {
              // Create new tab with default welcome content (no parameters = default tab)
              createNewTab();

              // Reset GitHub state for new file
              setGithubState(prev => ({ ...prev, currentFile: null }));

              editorRef.current?.focus();
            }}
            onTabContextMenu={handleTabContextMenu}
            theme={settings.theme}
          />

          <div className="flex flex-col min-h-0 flex-grow">
            <Editor
              key={tabManagerState.activeTabId}
              value={getEditorValue()}
              onChange={handleMarkdownChange}
              onScroll={(event) => handleScroll('editor', event)}
              onFormat={handleFormat}
              settings={settings}
              ref={editorRef}
              codemirrorTheme={codemirrorTheme} // Pass the CodeMirror theme
            />
            <LinterPanel
              errors={lintResult.errors}
              isVisible={isLinterPanelVisible}
              onToggle={handleLinterToggle}
              onErrorClick={handleLinterErrorClick}
              onAutoFix={handleAutoFix}
              theme={settings.theme}
            />
            <StatusBar items={[
              <button onClick={toggleLineNumbers} className="text-xs">
                {settings.showLineNumbers ? 'Hide' : 'Show'} Line Numbers
              </button>,
              <span>{`Ln ${cursorPosition.line}, Col ${cursorPosition.column}`}</span>,
              // Add CodeMirror theme selector to status bar
              <div className="flex items-center gap-1">
                <label className="text-xs text-slate-400">Theme:</label>
                <select
                  value={codemirrorTheme}
                  onChange={(e) => setCodemirrorTheme(e.target.value)}
                  className="bg-slate-700 text-white text-xs rounded p-1 max-w-[120px]"
                >
                  {Object.keys(themeMap).map(themeKey => (
                    <option key={themeKey} value={themeKey}>
                      {formatThemeName(themeKey)}
                    </option>
                  ))}
                </select>
              </div>
            ]} />
          </div>
        </div>

        <div
          onMouseDown={handleMouseDown}
          className="w-1 cursor-col-resize hidden md:flex items-center justify-center group"
          aria-label="Resize panels"
          role="separator"
        >
          <div className="w-0.5 h-12 bg-slate-700 rounded-full group-hover:bg-cyan-500 transition-colors duration-150" />
        </div>

        <div className="flex flex-col min-h-0">
          <div className="flex flex-col min-h-0 flex-grow">
            <Preview
              markdown={markdown}
              theme={previewTheme}
              onScroll={(event) => handleScroll('preview', event.nativeEvent)}
              ref={previewRef}
            />
            <StatusBar items={[
              <div className="flex items-center gap-1">
                <label className="text-xs text-slate-400">Theme:</label>
                <select
                  value={previewTheme}
                  onChange={(e) => setPreviewTheme(e.target.value)}
                  className="bg-slate-700 text-white text-xs rounded p-1"
                >
                  {Object.keys(themes).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>,
              <span>{`${markdown.length} Chars`}</span>
            ]} />
          </div>
        </div>
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

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <UpdateInfoModal
        isOpen={isUpdateInfoModalOpen}
        onClose={() => setIsUpdateInfoModalOpen(false)}
        status={updateInfoStatus}
        buildInfo={updateBuildInfo}
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

      {/* Tab Confirmation Modal */}
      <ConfirmationModal
        isOpen={isTabConfirmationOpen}
        title={
          tabConfirmationData?.type === 'close'
            ? 'Close Tab with Unsaved Changes?'
            : tabConfirmationData?.type === 'closeOthers'
              ? 'Close Other Tabs with Unsaved Changes?'
              : 'Close All Tabs with Unsaved Changes?'
        }
        message={
          tabConfirmationData?.type === 'close'
            ? `The tab \"${tabConfirmationData.tabName}\" has unsaved changes. Are you sure you want to close it? Your changes will be lost.`
            : tabConfirmationData?.type === 'closeOthers'
              ? `${tabConfirmationData.tabName} with unsaved changes will be closed. Are you sure you want to continue? Your changes will be lost.`
              : `${tabConfirmationData?.tabName} with unsaved changes will be closed. Are you sure you want to continue? Your changes will be lost.`
        }
        confirmText="Close"
        cancelText="Cancel"
        onConfirm={() => handleTabConfirmationConfirm(tabConfirmationData)}
        onCancel={handleTabConfirmationCancel}
        theme={settings.theme}
        variant="danger"
      />

      {/* Tab Context Menu */}
      <TabContextMenu
        isOpen={isTabContextMenuOpen}
        position={tabContextMenuPosition}
        tabId={tabContextMenuTabId || ''}
        onClose={handleTabContextMenuClose}
        onCloseTab={handleTabContextMenuCloseTab}
        onCloseOtherTabs={handleTabContextMenuCloseOtherTabs}
        onCloseAllTabs={handleTabContextMenuCloseAllTabs}
        onDuplicateTab={handleTabContextMenuDuplicateTab}
      />
    </div>
  );
};

export default App;
