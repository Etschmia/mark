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

  // State synchronization methods
  const syncActiveTabToState = useCallback(() => {
    const activeTab = tabManagerRef.current.getActiveTab();
    if (activeTab) {
      // console.log('🟢 App syncActiveTabToState - TAB SWITCH:', {
      //   tabId: activeTab.id,
      //   filename: activeTab.filename,
      //   contentLength: activeTab.content.length,
      //   contentPreview: activeTab.content.substring(0, 50) + (activeTab.content.length > 50 ? '...' : ''),
      //   willSetMarkdown: true,
      //   thisWillTriggerEditorValueProp: true
      // });

      setMarkdown(activeTab.content);
      setFileName(activeTab.filename);
      setHistory(activeTab.history);
      setHistoryIndex(activeTab.historyIndex);
      setFileSource(activeTab.fileSource);
      setOriginalContent(activeTab.originalContent);
      fileHandleRef.current = activeTab.fileHandle;

      // Run linter if active
      if (isLinterActive) {
        const result = lintMarkdown(activeTab.content);
        setLintResult(result);
      }

      // Restore editor state after a short delay to ensure editor is ready
      setTimeout(() => {
        if (editorRef.current && activeTab.editorState) {
          // Only restore if the selection is valid for the current content length
          const contentLength = activeTab.content.length;
          const selectionStart = Math.min(activeTab.editorState.selection.start, contentLength);
          const selectionEnd = Math.min(activeTab.editorState.selection.end, contentLength);

          // Restore cursor position and selection
          editorRef.current.setSelection(selectionStart, selectionEnd);

          // Restore scroll position
          const scrollElement = document.querySelector('.cm-scroller') as HTMLElement;
          if (scrollElement && activeTab.editorState.scrollPosition > 0) {
            scrollElement.scrollTop = activeTab.editorState.scrollPosition;
          }
        }
      }, 50); // Small delay to ensure DOM is updated
    }
  }, []);

  const syncStateToActiveTab = useCallback(() => {
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
        tabManagerRef.current.updateTabFileHandle(activeTab.id, fileHandleRef.current);
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
  }, [markdown, fileName, fileSource, originalContent]);

  // Tab operation handlers
  const createNewTab = useCallback((content?: string, filename?: string, fileHandle?: FileSystemFileHandle, fileSource?: FileSource) => {
    // Sync current state to active tab before creating new tab
    syncStateToActiveTab();

    const newTabId = tabManagerRef.current.createTab(content, filename, fileHandle, fileSource);
    return newTabId;
  }, [syncStateToActiveTab]);

  const closeTab = useCallback((tabId: string) => {
    const tab = tabManagerRef.current.getTab(tabId);
    if (!tab) return false;

    // Check for unsaved changes and show confirmation dialog
    if (tab.hasUnsavedChanges) {
      setTabConfirmationData({
        type: 'close',
        tabId,
        tabName: tab.filename,
        callback: () => tabManagerRef.current.forceCloseTab(tabId)
      });
      setIsTabConfirmationOpen(true);
      return false;
    }

    return tabManagerRef.current.closeTab(tabId);
  }, []);

  const forceCloseTab = useCallback((tabId: string) => {
    return tabManagerRef.current.forceCloseTab(tabId);
  }, []);

  // Update functionality
  const handleUpdate = useCallback(async () => {
    try {
      const result = await checkAndInstallUpdate();

      setUpdateInfoStatus(result.status);
      setUpdateBuildInfo(result.buildInfo || null);
      setIsUpdateInfoModalOpen(true);

    } catch (error) {
      console.error('Update check failed:', error);
      setUpdateInfoStatus('fail');
      setUpdateBuildInfo(null);
      setIsUpdateInfoModalOpen(true);
    }
  }, []);

  const switchToTab = useCallback((tabId: string) => {
    // Sync current state to active tab before switching
    syncStateToActiveTab();

    const success = tabManagerRef.current.switchToTab(tabId);
    if (success) {
      // Force immediate persistence for tab switching
      tabManagerRef.current.forcePersist();

      // State will be synced via the subscription callback
      // But we'll also do it immediately to ensure UI updates
      syncActiveTabToState();
    }
    return success;
  }, [syncStateToActiveTab, syncActiveTabToState]);

  const duplicateTab = useCallback((tabId: string) => {
    const newTabId = tabManagerRef.current.duplicateTab(tabId);
    return newTabId;
  }, []);

  const closeOtherTabs = useCallback((keepTabId: string) => {
    const keepTab = tabManagerRef.current.getTab(keepTabId);
    if (!keepTab) return false;

    // Check if any other tabs have unsaved changes
    const otherTabs = tabManagerRef.current.getTabs().filter(t => t.id !== keepTabId);
    const hasUnsavedOtherTabs = otherTabs.some(tab => tab.hasUnsavedChanges);

    if (hasUnsavedOtherTabs) {
      const unsavedCount = otherTabs.filter(tab => tab.hasUnsavedChanges).length;
      setTabConfirmationData({
        type: 'closeOthers',
        tabId: keepTabId,
        tabName: `${unsavedCount} tab${unsavedCount > 1 ? 's' : ''}`,
        callback: () => tabManagerRef.current.forceCloseOtherTabs(keepTabId)
      });
      setIsTabConfirmationOpen(true);
      return false;
    }

    return tabManagerRef.current.closeOtherTabs(keepTabId);
  }, []);

  const forceCloseOtherTabs = useCallback((keepTabId: string) => {
    return tabManagerRef.current.forceCloseOtherTabs(keepTabId);
  }, []);

  const closeAllTabs = useCallback(() => {
    // Check if any tabs have unsaved changes
    const tabs = tabManagerRef.current.getTabs();
    const hasUnsavedTabs = tabs.some(tab => tab.hasUnsavedChanges);

    if (hasUnsavedTabs) {
      const unsavedCount = tabs.filter(tab => tab.hasUnsavedChanges).length;
      setTabConfirmationData({
        type: 'closeAll',
        tabName: `${unsavedCount} tab${unsavedCount > 1 ? 's' : ''}`,
        callback: () => tabManagerRef.current.forceCloseAllTabs()
      });
      setIsTabConfirmationOpen(true);
      return false;
    }

    return tabManagerRef.current.closeAllTabs();
  }, []);

  const forceCloseAllTabs = useCallback(() => {
    return tabManagerRef.current.forceCloseAllTabs();
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

  // Tab context menu handlers
  const handleTabContextMenu = useCallback((tabId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setTabContextMenuTabId(tabId);
    setTabContextMenuPosition({ x: event.clientX, y: event.clientY });
    setIsTabContextMenuOpen(true);
  }, []);

  const handleTabContextMenuClose = useCallback(() => {
    setIsTabContextMenuOpen(false);
    setTabContextMenuTabId(null);
  }, []);

  const handleTabContextMenuCloseTab = useCallback((tabId: string) => {
    closeTab(tabId);
    handleTabContextMenuClose();
  }, [closeTab, handleTabContextMenuClose]);

  const handleTabContextMenuCloseOtherTabs = useCallback((tabId: string) => {
    closeOtherTabs(tabId);
    handleTabContextMenuClose();
  }, [closeOtherTabs, handleTabContextMenuClose]);

  const handleTabContextMenuCloseAllTabs = useCallback(() => {
    closeAllTabs();
    handleTabContextMenuClose();
  }, [closeAllTabs, handleTabContextMenuClose]);

  const handleTabContextMenuDuplicateTab = useCallback((tabId: string) => {
    duplicateTab(tabId);
    handleTabContextMenuClose();
  }, [duplicateTab, handleTabContextMenuClose]);

  // Tab confirmation modal handlers
  const handleTabConfirmationConfirm = useCallback(() => {
    if (tabConfirmationData?.callback) {
      tabConfirmationData.callback();
    }
    setIsTabConfirmationOpen(false);
    setTabConfirmationData(null);
  }, [tabConfirmationData]);

  const handleTabConfirmationCancel = useCallback(() => {
    setIsTabConfirmationOpen(false);
    setTabConfirmationData(null);
  }, []);

  const addHistoryEntry = useCallback((newMarkdown: string) => {
    // When a new entry is added, clear any "future" history from previous undos
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newMarkdown);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Also update the active tab's history
    const activeTab = tabManagerRef.current.getActiveTab();
    if (activeTab) {
      tabManagerRef.current.addToTabHistory(activeTab.id, newMarkdown);
    }
  }, [history, historyIndex]);

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

      // Check if we already have a valid token
      const storedToken = githubService.getStoredToken();
      if (storedToken) {
        try {
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
          return;
        } catch (error) {
          // Token is invalid, continue with new authentication
          console.log('Stored token is invalid, requesting new authentication');
        }
      }

      // Check for OAuth callback
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

      // Prompt for personal access token
      const token = prompt(
        'Please enter your GitHub Personal Access Token:\n\n' +
        '1. Visit: https://github.com/settings/tokens/new\n' +
        '2. Create a token with "repo" and "public_repo" scopes\n' +
        '3. Copy and paste the token below:'
      );

      if (token && token.trim()) {
        const user = await githubService.authenticateWithToken(token.trim());
        setGithubState(prev => ({
          ...prev,
          auth: {
            isConnected: true,
            user,
            accessToken: token.trim(),
            tokenExpiry: null
          },
          error: null
        }));
      } else {
        setGithubState(prev => ({
          ...prev,
          error: 'GitHub authentication cancelled'
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
        } else if (error.message.includes('unauthorized') || error.message.includes('Invalid GitHub token')) {
          errorMessage = 'Invalid GitHub token. Please check your token and try again.';
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

      // Sync current state to active tab before loading new file
      syncStateToActiveTab();

      // Check if this GitHub file is already open in another tab
      const fileSource: FileSource = {
        type: 'github',
        repository: githubState.currentRepository!,
        path: file.path,
        sha: file.sha
      };

      const existingTab = tabManagerRef.current.findTabByFileSource(fileSource);
      if (existingTab) {
        // Switch to existing tab
        switchToTab(existingTab.id);
        setGithubState(prev => ({
          ...prev,
          currentFile: file,
          isLoadingFile: false
        }));
        setIsGitHubModalOpen(false);
        return;
      }

      const content = await githubService.getFileContent(
        githubState.currentRepository!.owner.login,
        githubState.currentRepository!.name,
        file.path
      );

      // Create new tab for the GitHub file
      const newTabId = createNewTab(content, file.name, null, fileSource);

      // Update the new tab's original content for change tracking
      tabManagerRef.current.updateTabOriginalContent(newTabId, content);

      // Update local state to reflect the new GitHub file
      setFileSource(fileSource);
      setOriginalContent(content);

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
    const activeTab = tabManagerRef.current.getActiveTab();
    if (!githubState.currentRepository || !githubState.currentFile || !activeTab) {
      throw new Error('No GitHub file selected');
    }

    try {
      setGithubState(prev => ({ ...prev, isCommitting: true, error: null }));

      // Sync current state to active tab before saving
      syncStateToActiveTab();

      // Get the updated tab after sync
      const updatedActiveTab = tabManagerRef.current.getActiveTab();
      if (!updatedActiveTab) {
        throw new Error('Active tab not found after sync');
      }

      const result = await githubService.saveFile(
        githubState.currentRepository.owner.login,
        githubState.currentRepository.name,
        githubState.currentFile.path,
        updatedActiveTab.content,
        {
          ...options,
          sha: updatedActiveTab.fileSource.sha // Include current SHA for updates
        }
      );

      // Update tab's file source with new SHA
      const updatedFileSource: FileSource = {
        ...updatedActiveTab.fileSource,
        sha: result.content.sha
      };

      // Update tab in manager with new file source and original content
      tabManagerRef.current.updateTabFileSource(updatedActiveTab.id, updatedFileSource);
      tabManagerRef.current.updateTabOriginalContent(updatedActiveTab.id, updatedActiveTab.content);
      tabManagerRef.current.markTabAsSaved(updatedActiveTab.id);

      // Update local state to reflect the saved GitHub file
      setFileSource(updatedFileSource);
      setOriginalContent(updatedActiveTab.content);

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
        const result = lintMarkdown(newMarkdown);
        setLintResult(result);
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

  // Linter functions
  const handleLinterToggle = () => {
    setIsLinterPanelVisible(!isLinterPanelVisible);
  };

  const handleLinterErrorClick = (lineNumber: number) => {
    if (editorRef.current) {
      // Calculate the position of the line
      const content = editorRef.current.getValue();
      const lines = content.split('\n');
      let position = 0;

      for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
        position += lines[i].length + 1; // +1 for newline character
      }

      // Set cursor to the beginning of the line
      editorRef.current.setSelection(position, position);
      editorRef.current.focus();
    }
  };

  const handleAutoFix = (error: LintError) => {
    if (editorRef.current) {
      const currentContent = editorRef.current.getValue();
      const fixedContent = applyAutoFix(currentContent, error);

      if (fixedContent !== currentContent) {
        // Update the editor content
        const activeTab = tabManagerRef.current.getActiveTab();
        if (activeTab) {
          tabManagerRef.current.updateTabContent(activeTab.id, fixedContent);
          setMarkdown(fixedContent);

          // Re-lint after fix
          const result = lintMarkdown(fixedContent);
          setLintResult(result);

          // Add to history
          addHistoryEntry(fixedContent);
        }
      }
    }
  };

  const runLinter = () => {
    if (isLinterActive) {
      // Deactivate linter
      setIsLinterActive(false);
      setIsLinterPanelVisible(false);
      setLintResult({ errors: [], errorCount: 0, warningCount: 0 });

      // Clear any pending lint operations
      if (lintDebounceRef.current) {
        clearTimeout(lintDebounceRef.current);
        lintDebounceRef.current = null;
      }
    } else {
      // Activate linter
      setIsLinterActive(true);
      const content = editorRef.current?.getValue() || '';
      const result = lintMarkdown(content);
      setLintResult(result);
      setIsLinterPanelVisible(true);
    }
  };

  // Handle editor scroll events to preserve scroll position
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

  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFileName = event.target.value;
    setFileName(newFileName);

    // Update active tab filename
    const activeTab = tabManagerRef.current.getActiveTab();
    if (activeTab) {
      tabManagerRef.current.updateTabFilename(activeTab.id, newFileName);
    }
  };

  const handleNewFile = useCallback(() => {
    // Create new tab with default welcome content (no parameters = default tab)
    createNewTab();

    // Reset GitHub state for new file
    setGithubState(prev => ({ ...prev, currentFile: null }));

    editorRef.current?.focus();
  }, [createNewTab]);

  const handleOpenFile = useCallback(async () => {
    // Sync current state to active tab before opening new file
    syncStateToActiveTab();

    // Modern "Open" logic using File System Access API
    if (window.showOpenFilePicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Markdown Files',
            accept: { 'text/markdown': ['.md', '.txt', '.markdown'] }
          }],
        });

        const file = await handle.getFile();
        const content = await file.text();

        // Check if file is already open in another tab by comparing file handles
        // First check by file handle if available, then fallback to filename
        let existingTab = null;
        for (const tab of tabManagerRef.current.getTabs()) {
          if (tab.fileHandle && tab.fileHandle.name === handle.name) {
            // More robust check: compare file handles if available
            try {
              const existingFile = await tab.fileHandle.getFile();
              const currentFile = await handle.getFile();
              if (existingFile.name === currentFile.name &&
                existingFile.size === currentFile.size &&
                existingFile.lastModified === currentFile.lastModified) {
                existingTab = tab;
                break;
              }
            } catch (error) {
              // If file handle comparison fails, fallback to filename comparison
              if (tab.filename === file.name) {
                existingTab = tab;
                break;
              }
            }
          } else if (tab.filename === file.name) {
            // Fallback to filename comparison for tabs without file handles
            existingTab = tab;
            break;
          }
        }

        if (existingTab) {
          // Switch to existing tab
          switchToTab(existingTab.id);
          return;
        }

        // Create new tab for the opened file
        createNewTab(content, file.name, handle, { type: 'local' });

        // Reset GitHub state for new local file
        setGithubState(prev => ({ ...prev, currentFile: null }));

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

          // Check if file is already open in another tab
          const existingTab = tabManagerRef.current.findTabByFilename(file.name);
          if (existingTab) {
            // Switch to existing tab
            switchToTab(existingTab.id);
            return;
          }

          // Create new tab for the opened file
          createNewTab(content, file.name, null, { type: 'local' });

          // Reset GitHub state for new local file
          setGithubState(prev => ({ ...prev, currentFile: null }));
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [createNewTab, switchToTab, syncStateToActiveTab]);

  const handleSaveFile = useCallback(async () => {
    const activeTab = tabManagerRef.current.getActiveTab();
    if (!activeTab) return;

    // Sync current state to active tab before saving
    syncStateToActiveTab();

    // Get the updated tab after sync
    const updatedActiveTab = tabManagerRef.current.getActiveTab();
    if (!updatedActiveTab) return;

    // If this is a GitHub file, show save options modal
    if (updatedActiveTab.fileSource.type === 'github' && githubState.auth.isConnected) {
      setIsSaveOptionsModalOpen(true);
      return;
    }

    // Original local save logic
    const saveOperation = async (handle: FileSystemFileHandle) => {
      const writable = await handle.createWritable();
      await writable.write(updatedActiveTab.content);
      await writable.close();
    };

    // Modern "Save" / "Save As" logic using File System Access API
    if (window.showSaveFilePicker) {
      try {
        if (updatedActiveTab.fileHandle) {
          // "Save" to the existing file handle
          await saveOperation(updatedActiveTab.fileHandle);

          // Mark tab as saved and update local state
          tabManagerRef.current.markTabAsSaved(updatedActiveTab.id);

          // Update local state to reflect saved status
          setFileName(updatedActiveTab.filename);
          fileHandleRef.current = updatedActiveTab.fileHandle;
        } else {
          // "Save As" for a new file
          const handle = await window.showSaveFilePicker({
            suggestedName: updatedActiveTab.filename.trim() || 'untitled.md',
            types: [{
              description: 'Markdown Files',
              accept: { 'text/markdown': ['.md', '.txt', '.markdown'] }
            }],
          });

          // Save the file first
          await saveOperation(handle);

          // Update tab with new file handle and filename
          tabManagerRef.current.updateTabFileHandle(updatedActiveTab.id, handle);
          tabManagerRef.current.updateTabFilename(updatedActiveTab.id, handle.name);
          tabManagerRef.current.markTabAsSaved(updatedActiveTab.id);

          // Update local state to reflect new filename and file handle
          setFileName(handle.name);
          fileHandleRef.current = handle;
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
    const downloadName = updatedActiveTab.filename.trim() || 'untitled.md';
    const blob = new Blob([updatedActiveTab.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Mark tab as saved for legacy save as well
    tabManagerRef.current.markTabAsSaved(updatedActiveTab.id);
  }, [syncStateToActiveTab, githubState.auth.isConnected]);

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

    if (formatType === 'lint') {
      runLinter();
      return;
    }

    if (formatType === 'code') {
      const lang = options?.language;
      const selection = editor.getSelection();
      const selectedText = editor.getValue().substring(selection.start, selection.end);

      // If a language is specified, always create a fenced code block
      if (lang) {
        applyFormatting(`\
`, '\n');
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
    const activeTab = tabManagerRef.current.getActiveTab();
    if (!activeTab || historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const previousContent = history[newIndex];

    setHistoryIndex(newIndex);
    setMarkdown(previousContent);

    // Update active tab content and history index
    tabManagerRef.current.updateTabContent(activeTab.id, previousContent);
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
  const handleScroll = (source: 'editor' | 'preview', event?: Event) => {
    if (isSyncingScroll.current) return;

    isSyncingScroll.current = true;

    try {
      if (source === 'editor' && event && previewRef.current) {
        // Get scroll info from the CodeMirror scroll event
        const scrollElement = event.target as HTMLElement;

        if (scrollElement && scrollElement.scrollHeight > scrollElement.clientHeight) {
          const scrollPercentage = scrollElement.scrollTop /
            (scrollElement.scrollHeight - scrollElement.clientHeight);

          const previewScrollHeight = previewRef.current.scrollHeight - previewRef.current.clientHeight;
          const targetScrollTop = scrollPercentage * previewScrollHeight;

          previewRef.current.scrollTop = targetScrollTop;

          // Preserve scroll position in active tab state
          handleEditorScroll(event);
        }
      } else if (source === 'preview' && previewRef.current && editorRef.current) {
        // Get preview scroll info and prevent division by zero
        const previewScrollHeight = previewRef.current.scrollHeight - previewRef.current.clientHeight;

        if (previewScrollHeight <= 0) return;

        const scrollPercentage = previewRef.current.scrollTop / previewScrollHeight;

        // Find the CodeMirror scroller element
        const editorContainer = document.querySelector('.cm-scroller') as HTMLElement;

        if (editorContainer) {
          const editorScrollHeight = editorContainer.scrollHeight - editorContainer.clientHeight;

          if (editorScrollHeight > 0) {
            const targetScrollTop = scrollPercentage * editorScrollHeight;
            editorContainer.scrollTop = targetScrollTop;
          }
        }
      }
    } catch (error) {
      console.warn('Scroll sync error:', error);
    }

    // Use a timeout to reset the flag
    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 100);
  };
  // --- End Scroll Sync Logic ---

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
            onTabCreate={handleNewFile}
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
        onConfirm={handleTabConfirmationConfirm}
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
