import { useCallback } from 'react';
import { TabManager } from '../utils/tabManager';
import { TabManagerState, FileSource, EditorState } from '../types';
import { lintMarkdown } from '../utils/markdownLinter';

// Minimal types for File System Access API
interface FileSystemFileHandle {
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableFileStream>;
  name: string;
}

interface FileSystemWritableFileStream {
  write: (data: BlobPart) => Promise<void>;
  close: () => Promise<void>;
}

interface UseTabManagerParams {
  tabManagerRef: React.RefObject<TabManager>;
  setTabManagerState: React.Dispatch<React.SetStateAction<TabManagerState>>;
  setMarkdown: React.Dispatch<React.SetStateAction<string>>;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  setHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  setFileSource: React.Dispatch<React.SetStateAction<FileSource>>;
  setOriginalContent: React.Dispatch<React.SetStateAction<string>>;
  fileHandleRef: React.RefObject<FileSystemFileHandle | null>;
  editorRef: React.RefObject<any>;
  tabManagerState: TabManagerState;
  isLinterActive: boolean;
  setLintResult: React.Dispatch<React.SetStateAction<any>>;
  syncStateToActiveTab: () => void;
  setTabConfirmationData: React.Dispatch<React.SetStateAction<any>>;
  setIsTabConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTabContextMenuTabId: React.Dispatch<React.SetStateAction<string | null>>;
  setTabContextMenuPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setIsTabContextMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useTabManager = ({
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
  syncStateToActiveTab,
  setTabConfirmationData,
  setIsTabConfirmationOpen,
  setTabContextMenuTabId,
  setTabContextMenuPosition,
  setIsTabContextMenuOpen,
}: UseTabManagerParams) => {
  // State synchronization methods
  const syncActiveTabToState = useCallback(() => {
    const activeTab = tabManagerRef.current?.getActiveTab();
    if (activeTab) {
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
  }, [tabManagerRef, setMarkdown, setFileName, setHistory, setHistoryIndex, setFileSource, setOriginalContent, fileHandleRef, isLinterActive, setLintResult, editorRef]);

  // Tab operation handlers
  const createNewTab = useCallback((content?: string, filename?: string, fileHandle?: FileSystemFileHandle, fileSource?: FileSource) => {
    // Sync current state to active tab before creating new tab
    syncStateToActiveTab();

    const newTabId = tabManagerRef.current?.createTab(content, filename, fileHandle, fileSource);
    return newTabId;
  }, [syncStateToActiveTab, tabManagerRef]);

  const closeTab = useCallback((tabId: string) => {
    const tab = tabManagerRef.current?.getTab(tabId);
    if (!tab) return false;

    // Check for unsaved changes and show confirmation dialog
    if (tab.hasUnsavedChanges) {
      setTabConfirmationData({
        type: 'close',
        tabId,
        tabName: tab.filename,
        callback: () => tabManagerRef.current?.forceCloseTab(tabId)
      });
      setIsTabConfirmationOpen(true);
      return false;
    }

    return tabManagerRef.current?.closeTab(tabId) || false;
  }, [tabManagerRef, setTabConfirmationData, setIsTabConfirmationOpen]);

  const forceCloseTab = useCallback((tabId: string) => {
    return tabManagerRef.current?.forceCloseTab(tabId) || false;
  }, [tabManagerRef]);

  const switchToTab = useCallback((tabId: string) => {
    // Sync current state to active tab before switching
    syncStateToActiveTab();

    const success = tabManagerRef.current?.switchToTab(tabId) || false;
    if (success) {
      // Force immediate persistence for tab switching
      tabManagerRef.current?.forcePersist();

      // State will be synced via the subscription callback
      // But we'll also do it immediately to ensure UI updates
      syncActiveTabToState();
    }
    return success;
  }, [syncStateToActiveTab, syncActiveTabToState, tabManagerRef]);

  const duplicateTab = useCallback((tabId: string) => {
    const newTabId = tabManagerRef.current?.duplicateTab(tabId);
    return newTabId;
  }, [tabManagerRef]);

  const closeOtherTabs = useCallback((keepTabId: string) => {
    const keepTab = tabManagerRef.current?.getTab(keepTabId);
    if (!keepTab) return false;

    // Check if any other tabs have unsaved changes
    const otherTabs = tabManagerRef.current?.getTabs().filter(t => t.id !== keepTabId) || [];
    const hasUnsavedOtherTabs = otherTabs.some(tab => tab.hasUnsavedChanges);

    if (hasUnsavedOtherTabs) {
      const unsavedCount = otherTabs.filter(tab => tab.hasUnsavedChanges).length;
      setTabConfirmationData({
        type: 'closeOthers',
        tabId: keepTabId,
        tabName: `${unsavedCount} tab${unsavedCount > 1 ? 's' : ''}`,
        callback: () => tabManagerRef.current?.forceCloseOtherTabs(keepTabId)
      });
      setIsTabConfirmationOpen(true);
      return false;
    }

    return tabManagerRef.current?.closeOtherTabs(keepTabId) || false;
  }, [tabManagerRef, setTabConfirmationData, setIsTabConfirmationOpen]);

  const forceCloseOtherTabs = useCallback((keepTabId: string) => {
    return tabManagerRef.current?.forceCloseOtherTabs(keepTabId) || false;
  }, [tabManagerRef]);

  const closeAllTabs = useCallback(() => {
    // Check if any tabs have unsaved changes
    const tabs = tabManagerRef.current?.getTabs() || [];
    const hasUnsavedTabs = tabs.some(tab => tab.hasUnsavedChanges);

    if (hasUnsavedTabs) {
      const unsavedCount = tabs.filter(tab => tab.hasUnsavedChanges).length;
      setTabConfirmationData({
        type: 'closeAll',
        tabName: `${unsavedCount} tab${unsavedCount > 1 ? 's' : ''}`,
        callback: () => tabManagerRef.current?.forceCloseAllTabs()
      });
      setIsTabConfirmationOpen(true);
      return false;
    }

    return tabManagerRef.current?.closeAllTabs() || false;
  }, [tabManagerRef, setTabConfirmationData, setIsTabConfirmationOpen]);

  const forceCloseAllTabs = useCallback(() => {
    return tabManagerRef.current?.forceCloseAllTabs() || false;
  }, [tabManagerRef]);

  // Tab context menu handlers
  const handleTabContextMenu = useCallback((tabId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setTabContextMenuTabId(tabId);
    setTabContextMenuPosition({ x: event.clientX, y: event.clientY });
    setIsTabContextMenuOpen(true);
  }, [setTabContextMenuTabId, setTabContextMenuPosition, setIsTabContextMenuOpen]);

  const handleTabContextMenuClose = useCallback(() => {
    setIsTabContextMenuOpen(false);
    setTabContextMenuTabId(null);
  }, [setIsTabContextMenuOpen, setTabContextMenuTabId]);

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
  const handleTabConfirmationConfirm = useCallback((tabConfirmationData: any) => {
    if (tabConfirmationData?.callback) {
      tabConfirmationData.callback();
    }
    setIsTabConfirmationOpen(false);
    setTabConfirmationData(null);
  }, [setIsTabConfirmationOpen, setTabConfirmationData]);

  const handleTabConfirmationCancel = useCallback(() => {
    setIsTabConfirmationOpen(false);
    setTabConfirmationData(null);
  }, [setIsTabConfirmationOpen, setTabConfirmationData]);

  return {
    syncActiveTabToState,
    syncStateToActiveTab,
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
  };
};
