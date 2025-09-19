import { useCallback } from 'react';
import { TabManager } from '../utils/tabManager';
import { GitHubState } from '../types';

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

// Augment the global Window type
declare global {
  interface Window {
    showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
  }
}

interface UseFileServiceParams {
  tabManagerRef: React.RefObject<TabManager>;
  syncStateToActiveTab: () => void;
  githubState: GitHubState;
  setIsSaveOptionsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  fileHandleRef: React.RefObject<FileSystemFileHandle | null>;
  setGithubState: React.Dispatch<React.SetStateAction<GitHubState>>;
  createNewTab: (content?: string, filename?: string, fileHandle?: FileSystemFileHandle, fileSource?: any) => string;
  switchToTab: (tabId: string) => boolean;
}

export const useFileService = ({
  tabManagerRef,
  syncStateToActiveTab,
  githubState,
  setIsSaveOptionsModalOpen,
  setFileName,
  fileHandleRef,
  setGithubState,
  createNewTab,
  switchToTab,
}: UseFileServiceParams) => {
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
        for (const tab of tabManagerRef.current?.getTabs() || []) {
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
          const existingTab = tabManagerRef.current?.findTabByFilename(file.name);
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
  }, [createNewTab, switchToTab, syncStateToActiveTab, tabManagerRef, setGithubState]);

  const handleSaveFile = useCallback(async () => {
    const activeTab = tabManagerRef.current?.getActiveTab();
    if (!activeTab) return;

    // Sync current state to active tab before saving
    syncStateToActiveTab();

    // Get the updated tab after sync
    const updatedActiveTab = tabManagerRef.current?.getActiveTab();
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
          tabManagerRef.current?.markTabAsSaved(updatedActiveTab.id);

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
          tabManagerRef.current?.updateTabFileHandle(updatedActiveTab.id, handle);
          tabManagerRef.current?.updateTabFilename(updatedActiveTab.id, handle.name);
          tabManagerRef.current?.markTabAsSaved(updatedActiveTab.id);

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
    tabManagerRef.current?.markTabAsSaved(updatedActiveTab.id);
  }, [syncStateToActiveTab, githubState.auth.isConnected, tabManagerRef, setIsSaveOptionsModalOpen, setFileName, fileHandleRef]);

  return {
    handleOpenFile,
    handleSaveFile,
  };
};
