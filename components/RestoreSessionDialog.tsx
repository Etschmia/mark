import React from 'react';
import { PreviousSession } from '../hooks/useWorkspace';

interface RestoreSessionDialogProps {
  session: PreviousSession;
  onRestore: () => void;
  onDismiss: () => void;
}

export const RestoreSessionDialog: React.FC<RestoreSessionDialogProps> = ({
  session,
  onRestore,
  onDismiss,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onDismiss();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onDismiss();
    else if (e.key === 'Enter') onRestore();
  };

  const rootName = session.rootPath.split('/').pop() || session.rootPath;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="relative w-full max-w-sm mx-4 p-5 rounded-lg border shadow-lg bg-app-panel border-app-border-main text-app-main"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-base font-semibold mb-2">
          Sitzung wiederherstellen?
        </h2>
        <p className="text-sm opacity-70 mb-3">
          Workspace <strong>{rootName}</strong> hat eine gespeicherte Sitzung mit{' '}
          {session.openFiles.length} Datei{session.openFiles.length !== 1 ? 'en' : ''}:
        </p>

        <ul className="text-xs opacity-60 mb-4 max-h-32 overflow-y-auto space-y-0.5 pl-3">
          {session.openFiles.map(fp => {
            const rel = fp.replace(session.rootPath, '').replace(/^[/\\]/, '');
            return (
              <li key={fp} className="truncate">
                <span className="opacity-50 mr-1">#</span>
                {rel || fp.split('/').pop()}
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1.5 text-xs rounded border border-app-border-main opacity-70 hover:opacity-100 transition-opacity"
            onClick={onDismiss}
          >
            Nein, neu starten
          </button>
          <button
            className="px-3 py-1.5 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            onClick={onRestore}
            autoFocus
          >
            Wiederherstellen
          </button>
        </div>
      </div>
    </div>
  );
};
