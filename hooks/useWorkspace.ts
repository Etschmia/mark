import { useState, useCallback, useEffect, useRef } from 'react';
import { isDesktopApp } from '../utils/environment';
import { getStorageService, WorkspaceStateData } from '../services/storage';

export interface WorkspaceFile {
  name: string;
  path: string;
  isDir: boolean;
}

export interface WorkspaceState {
  rootPath: string | null;
  files: WorkspaceFile[];
  isLoading: boolean;
  isOpen: boolean;
}

interface UseWorkspaceOptions {
  /** Called for each file path from CLI args. App.tsx uses this to open files as tabs. */
  onOpenFile?: (filePath: string) => void;
}

/** Info about a previously saved workspace session. */
export interface PreviousSession {
  rootPath: string;
  openFiles: string[];
  activeFile: string | null;
}

/**
 * Manages workspace state for the desktop app.
 * Provides directory scanning, folder selection, and workspace persistence.
 */
export function useWorkspace(options: UseWorkspaceOptions = {}) {
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    rootPath: null,
    files: [],
    isLoading: false,
    isOpen: false,
  });

  // Previous session data for restore dialog
  const [previousSession, setPreviousSession] = useState<PreviousSession | null>(null);

  const onOpenFileRef = useRef(options.onOpenFile);
  onOpenFileRef.current = options.onOpenFile;

  const scanDirectory = useCallback(async (dirPath: string) => {
    setWorkspace(prev => ({ ...prev, isLoading: true }));
    try {
      const { desktopScanDirectory } = await import('../services/desktopFileService');
      const files = await desktopScanDirectory(dirPath);
      setWorkspace({
        rootPath: dirPath,
        files,
        isLoading: false,
        isOpen: true,
      });
    } catch (error) {
      console.warn('Failed to scan directory:', error);
      setWorkspace(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const openFolder = useCallback(async () => {
    try {
      const { desktopOpenFolder } = await import('../services/desktopFileService');
      const dirPath = await desktopOpenFolder();
      if (dirPath) {
        await scanDirectory(dirPath);
      }
    } catch (error) {
      console.warn('Failed to open folder:', error);
    }
  }, [scanDirectory]);

  const closeWorkspace = useCallback(() => {
    setWorkspace({
      rootPath: null,
      files: [],
      isLoading: false,
      isOpen: false,
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setWorkspace(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const refreshFiles = useCallback(async () => {
    if (workspace.rootPath) {
      await scanDirectory(workspace.rootPath);
    }
  }, [workspace.rootPath, scanDirectory]);

  /** Save current workspace state (called by App.tsx when tabs change). */
  const saveCurrentSession = useCallback((openFiles: string[], activeFile: string | null) => {
    if (!isDesktopApp() || !workspace.rootPath) return;

    const storage = getStorageService();
    storage.saveWorkspaceState(workspace.rootPath, {
      openFiles,
      activeFile,
      lastAccessed: Date.now(),
    });
  }, [workspace.rootPath]);

  /** Dismiss the restore dialog without restoring. */
  const dismissRestore = useCallback(() => {
    setPreviousSession(null);
  }, []);

  /** Accept the restore — opens all files from the previous session. */
  const acceptRestore = useCallback(() => {
    if (!previousSession || !onOpenFileRef.current) return;

    for (const fp of previousSession.openFiles) {
      onOpenFileRef.current(fp);
    }
    setPreviousSession(null);
  }, [previousSession]);

  // Process CLI arguments on mount (desktop only)
  useEffect(() => {
    if (!isDesktopApp()) return;

    const args = (window as any).__MARK_ARGS__ as string[] | undefined;
    if (!args || args.length === 0) return;

    (async () => {
      const { desktopIsDirectory } = await import('../services/desktopFileService');

      const filePaths: string[] = [];
      let dirPath: string | null = null;

      for (const arg of args) {
        const isDir = await desktopIsDirectory(arg);
        if (isDir) {
          if (!dirPath) dirPath = arg;
        } else {
          filePaths.push(arg);
        }
      }

      // If a directory was given, scan it for the sidebar
      if (dirPath) {
        await scanDirectory(dirPath);

        // Check if this workspace has a previous session
        const storage = getStorageService();
        const saved = storage.loadWorkspaceState(dirPath);
        if (saved && saved.openFiles.length > 0 && filePaths.length === 0) {
          // Only offer restore if no explicit file args were given
          setPreviousSession({
            rootPath: dirPath,
            openFiles: saved.openFiles,
            activeFile: saved.activeFile,
          });
        }
      }

      // Open file args as tabs
      if (filePaths.length > 0 && onOpenFileRef.current) {
        for (const fp of filePaths) {
          onOpenFileRef.current(fp);
        }
      }

      // If only files were given (no directory), set the directory of the first file as workspace
      if (!dirPath && filePaths.length > 0) {
        const firstFile = filePaths[0];
        const parentDir = firstFile.substring(0, firstFile.lastIndexOf('/')) || '/';
        await scanDirectory(parentDir);
      }
    })();
  }, [scanDirectory]);

  return {
    workspace,
    openFolder,
    closeWorkspace,
    toggleSidebar,
    refreshFiles,
    scanDirectory,
    saveCurrentSession,
    previousSession,
    acceptRestore,
    dismissRestore,
  };
}
