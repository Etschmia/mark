import { useCallback } from 'react';
import { TabManager } from '../utils/tabManager';
import { GitHubState, FileSource } from '../types';
import { isDesktopApp } from '../utils/environment';

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

// --- Desktop file operations (lazy-loaded) ---

async function handleDesktopOpen(
  tabManagerRef: React.RefObject<TabManager>,
  syncStateToActiveTab: () => void,
  setGithubState: React.Dispatch<React.SetStateAction<GitHubState>>,
  createNewTab: UseFileServiceParams['createNewTab'],
  switchToTab: (tabId: string) => boolean,
) {
  syncStateToActiveTab();

  const { desktopOpenFile } = await import('./desktopFileService');
  const result = await desktopOpenFile();
  if (!result) return; // User cancelled

  // Check if file is already open by path
  const tabs = tabManagerRef.current?.getTabs() || [];
  const existingTab = tabs.find(
    t => t.fileSource.type === 'local' && t.fileSource.path === result.filePath
  );
  if (existingTab) {
    switchToTab(existingTab.id);
    return;
  }

  const fileSource: FileSource = { type: 'local', path: result.filePath };
  createNewTab(result.content, result.fileName, undefined, fileSource);
  setGithubState(prev => ({ ...prev, currentFile: null }));
}

async function handleDesktopSave(
  tabManagerRef: React.RefObject<TabManager>,
  syncStateToActiveTab: () => void,
  githubState: GitHubState,
  setIsSaveOptionsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setFileName: React.Dispatch<React.SetStateAction<string>>,
) {
  const activeTab = tabManagerRef.current?.getActiveTab();
  if (!activeTab) return;

  syncStateToActiveTab();
  const updatedTab = tabManagerRef.current?.getActiveTab();
  if (!updatedTab) return;

  // GitHub files still go through the save options modal
  if (updatedTab.fileSource.type === 'github' && githubState.auth.isConnected) {
    setIsSaveOptionsModalOpen(true);
    return;
  }

  const { desktopSaveToPath, desktopSaveFileAs } = await import('./desktopFileService');

  if (updatedTab.fileSource.path) {
    // Save directly to the known path
    await desktopSaveToPath(updatedTab.fileSource.path, updatedTab.content);
    tabManagerRef.current?.markTabAsSaved(updatedTab.id);
  } else {
    // Save As — no path yet
    const result = await desktopSaveFileAs(
      updatedTab.content,
      updatedTab.filename.trim() || 'untitled.md'
    );
    if (!result) return; // User cancelled

    tabManagerRef.current?.updateTabFileSource(updatedTab.id, {
      type: 'local',
      path: result.filePath,
    });
    tabManagerRef.current?.updateTabFilename(updatedTab.id, result.fileName);
    tabManagerRef.current?.markTabAsSaved(updatedTab.id);
    setFileName(result.fileName);
  }
}

/**
 * Open a file by its filesystem path (desktop only).
 * Used by WorkspaceSidebar and CLI argument handling.
 */
export async function openFileByPath(
  filePath: string,
  tabManagerRef: React.RefObject<TabManager>,
  createNewTab: UseFileServiceParams['createNewTab'],
  switchToTab: (tabId: string) => boolean,
) {
  // Check if already open
  const tabs = tabManagerRef.current?.getTabs() || [];
  const existingTab = tabs.find(
    t => t.fileSource.type === 'local' && t.fileSource.path === filePath
  );
  if (existingTab) {
    switchToTab(existingTab.id);
    return;
  }

  const { desktopReadFile } = await import('./desktopFileService');
  const content = await desktopReadFile(filePath);
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'untitled.md';
  const fileSource: FileSource = { type: 'local', path: filePath };
  createNewTab(content, fileName, undefined, fileSource);
}

// --- Main hook ---

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
    // Desktop mode: native dialog
    if (isDesktopApp()) {
      await handleDesktopOpen(
        tabManagerRef, syncStateToActiveTab, setGithubState, createNewTab, switchToTab,
      );
      return;
    }

    // --- Browser mode (unchanged) ---
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

        // Check if file is already open in another tab
        let existingTab = null;
        for (const tab of tabManagerRef.current?.getTabs() || []) {
          if (tab.fileHandle && tab.fileHandle.name === handle.name) {
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
              if (tab.filename === file.name) {
                existingTab = tab;
                break;
              }
            }
          } else if (tab.filename === file.name) {
            existingTab = tab;
            break;
          }
        }

        if (existingTab) {
          switchToTab(existingTab.id);
          return;
        }

        createNewTab(content, file.name, handle, { type: 'local' });
        setGithubState(prev => ({ ...prev, currentFile: null }));
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        console.warn('Modern file open failed, falling back to legacy open:', err);
      }
    }

    // Legacy fallback "Open"
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
          const existingTab = tabManagerRef.current?.findTabByFilename(file.name);
          if (existingTab) {
            switchToTab(existingTab.id);
            return;
          }
          createNewTab(content, file.name, null, { type: 'local' });
          setGithubState(prev => ({ ...prev, currentFile: null }));
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [createNewTab, switchToTab, syncStateToActiveTab, tabManagerRef, setGithubState]);

  const handleSaveFile = useCallback(async () => {
    // Desktop mode: native save
    if (isDesktopApp()) {
      await handleDesktopSave(
        tabManagerRef, syncStateToActiveTab, githubState, setIsSaveOptionsModalOpen, setFileName,
      );
      return;
    }

    // --- Browser mode (unchanged) ---
    const activeTab = tabManagerRef.current?.getActiveTab();
    if (!activeTab) return;

    syncStateToActiveTab();
    const updatedActiveTab = tabManagerRef.current?.getActiveTab();
    if (!updatedActiveTab) return;

    // GitHub files
    if (updatedActiveTab.fileSource.type === 'github' && githubState.auth.isConnected) {
      setIsSaveOptionsModalOpen(true);
      return;
    }

    const saveOperation = async (handle: FileSystemFileHandle) => {
      const writable = await handle.createWritable();
      await writable.write(updatedActiveTab.content);
      await writable.close();
    };

    // Modern "Save" / "Save As" via File System Access API
    if (window.showSaveFilePicker) {
      try {
        if (updatedActiveTab.fileHandle) {
          await saveOperation(updatedActiveTab.fileHandle);
          tabManagerRef.current?.markTabAsSaved(updatedActiveTab.id);
          setFileName(updatedActiveTab.filename);
          fileHandleRef.current = updatedActiveTab.fileHandle;
        } else {
          const handle = await window.showSaveFilePicker({
            suggestedName: updatedActiveTab.filename.trim() || 'untitled.md',
            types: [{
              description: 'Markdown Files',
              accept: { 'text/markdown': ['.md', '.txt', '.markdown'] }
            }],
          });
          await saveOperation(handle);
          tabManagerRef.current?.updateTabFileHandle(updatedActiveTab.id, handle);
          tabManagerRef.current?.updateTabFilename(updatedActiveTab.id, handle.name);
          tabManagerRef.current?.markTabAsSaved(updatedActiveTab.id);
          setFileName(handle.name);
          fileHandleRef.current = handle;
        }
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        console.warn('Modern file save failed, falling back to legacy download:', err);
      }
    }

    // Legacy fallback "Save" (download)
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
    tabManagerRef.current?.markTabAsSaved(updatedActiveTab.id);
  }, [syncStateToActiveTab, githubState.auth.isConnected, tabManagerRef, setIsSaveOptionsModalOpen, setFileName, fileHandleRef]);

  const handleSaveFileAs = useCallback(async () => {
    syncStateToActiveTab();
    const tab = tabManagerRef.current?.getActiveTab();
    if (!tab) return;

    if (isDesktopApp()) {
      const { desktopSaveFileAs } = await import('./desktopFileService');
      const result = await desktopSaveFileAs(
        tab.content,
        tab.filename.trim() || 'untitled.md'
      );
      if (!result) return;

      tabManagerRef.current?.updateTabFileSource(tab.id, {
        type: 'local',
        path: result.filePath,
      });
      tabManagerRef.current?.updateTabFilename(tab.id, result.fileName);
      tabManagerRef.current?.markTabAsSaved(tab.id);
      setFileName(result.fileName);
      return;
    }

    // Browser: show save picker (always as "save as")
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: tab.filename.trim() || 'untitled.md',
          types: [{
            description: 'Markdown Files',
            accept: { 'text/markdown': ['.md', '.txt', '.markdown'] }
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(tab.content);
        await writable.close();
        tabManagerRef.current?.updateTabFileHandle(tab.id, handle);
        tabManagerRef.current?.updateTabFilename(tab.id, handle.name);
        tabManagerRef.current?.markTabAsSaved(tab.id);
        setFileName(handle.name);
        fileHandleRef.current = handle;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.warn('Save As failed:', err);
      }
    }
  }, [syncStateToActiveTab, tabManagerRef, setFileName, fileHandleRef]);

  return {
    handleOpenFile,
    handleSaveFile,
    handleSaveFileAs,
  };
};
