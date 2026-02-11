import { useState, useCallback, useEffect } from 'react';
import { isDesktopApp } from '../utils/environment';

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

/**
 * Manages workspace state for the desktop app.
 * Provides directory scanning and folder selection.
 */
export function useWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    rootPath: null,
    files: [],
    isLoading: false,
    isOpen: false,
  });

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

  // Auto-scan if there's a workspace path from CLI args
  useEffect(() => {
    if (!isDesktopApp()) return;

    const args = (window as any).__MARK_ARGS__ as string[] | undefined;
    if (args && args.length > 0) {
      // If first arg looks like a directory (no file extension), scan it
      const first = args[0];
      if (first === '.' || !first.match(/\.\w+$/)) {
        // It's a directory path
        const resolvedPath = first === '.' ? '' : first;
        if (resolvedPath) {
          scanDirectory(resolvedPath);
        }
      }
    }
  }, [scanDirectory]);

  return {
    workspace,
    openFolder,
    closeWorkspace,
    toggleSidebar,
    refreshFiles,
    scanDirectory,
  };
}
