import React from 'react';
import { WorkspaceFile } from '../hooks/useWorkspace';

interface WorkspaceSidebarProps {
  rootPath: string | null;
  files: WorkspaceFile[];
  isLoading: boolean;
  isOpen: boolean;
  activeFilePath: string | null;
  onFileSelect: (filePath: string) => void;
  onOpenFolder: () => void;
  onClose: () => void;
  onRefresh: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  rootPath,
  files,
  isLoading,
  isOpen,
  activeFilePath,
  onFileSelect,
  onOpenFolder,
  onClose,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const rootName = rootPath
    ? rootPath.split('/').pop() || rootPath.split('\\').pop() || rootPath
    : null;

  return (
    <div className="flex flex-col h-full w-56 min-w-44 max-w-72 border-r border-app-border-main bg-app-panel text-app-main text-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-app-border-main">
        <span className="font-medium truncate" title={rootPath || undefined}>
          {rootName || 'Workspace'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Dateien neu laden"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Sidebar schließen"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <div className="px-3 py-4 text-center opacity-60">Lade...</div>
        ) : !rootPath ? (
          <div className="px-3 py-4 text-center">
            <button
              onClick={onOpenFolder}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs transition-colors"
            >
              Ordner öffnen
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="px-3 py-4 text-center opacity-60 text-xs">
            Keine Markdown-Dateien gefunden
          </div>
        ) : (
          files.map(file => {
            const relativePath = rootPath
              ? file.path.replace(rootPath, '').replace(/^[/\\]/, '')
              : file.name;
            const isActive = file.path === activeFilePath;
            const depth = (relativePath.match(/[/\\]/g) || []).length;

            return (
              <button
                key={file.path}
                onClick={() => onFileSelect(file.path)}
                className={`w-full text-left px-3 py-1 hover:bg-white/5 transition-colors truncate block ${
                  isActive ? 'bg-white/10 font-medium' : ''
                }`}
                style={{ paddingLeft: `${12 + depth * 12}px` }}
                title={relativePath}
              >
                <span className="opacity-40 mr-1.5">
                  {file.name.endsWith('.md') ? '#' : file.name.endsWith('.txt') ? 'T' : '#'}
                </span>
                {relativePath}
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-app-border-main px-3 py-1.5">
        <button
          onClick={onOpenFolder}
          className="w-full text-left text-xs opacity-60 hover:opacity-100 transition-opacity truncate"
        >
          + Ordner öffnen...
        </button>
      </div>
    </div>
  );
};
