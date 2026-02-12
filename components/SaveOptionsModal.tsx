import React, { useState } from 'react';
import { Modal } from './common/Modal';
import type { SaveOptionsModalProps, GitHubCommitOptions } from '../types';

export const SaveOptionsModal: React.FC<SaveOptionsModalProps> = ({
  isOpen,
  onClose,
  currentFile,
  hasChanges,
  onLocalSave,
  onGitHubSave,
  isCommitting,
  commitError,
  isConnected,
  canPush
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState<'local' | 'github'>('github');

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCommitMessage('');
      setCommitDescription('');
      setSelectedOption('github');
    }
  }, [isOpen]);

  const handleGitHubSave = async () => {
    if (!commitMessage.trim()) {
      return;
    }

    const options: GitHubCommitOptions = {
      message: commitMessage.trim(),
      content: '', // This will be filled by the calling component
    };

    // Add extended description if provided
    if (commitDescription.trim()) {
      options.message = `${commitMessage.trim()}\n\n${commitDescription.trim()}`;
    }

    try {
      await onGitHubSave(options);
      // Modal will be closed by parent component on successful save
    } catch (error) {
      // Error handling is managed by parent component
      console.error('Save failed:', error);
    }
  };

  const handleLocalSave = () => {
    onLocalSave();
    onClose();
  };

  const isCommitValid = commitMessage.trim().length >= 3;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Options" maxWidth="md" zIndex={9999}>
      <div>

        {/* Content */}
        <div className="p-6">
          {/* Current File Info */}
          {currentFile && (
            <div className="mb-6 p-4 bg-app-hover rounded-lg">
              <div className="flex items-center gap-2 text-sm text-app-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Current file:</span>
              </div>
              <p className="mt-1 font-mono text-sm text-app-main">
                {currentFile.path}
              </p>
              {hasChanges && (
                <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Unsaved changes
                </div>
              )}
            </div>
          )}

          {/* Save Options */}
          <div className="space-y-4">
            {/* Local Save Option */}
            <div className="border border-app-border-muted rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="saveOption"
                  value="local"
                  checked={selectedOption === 'local'}
                  onChange={(e) => setSelectedOption(e.target.value as 'local')}
                  className="mt-1 w-4 h-4 accent-[var(--app-accent-main)]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-app-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-medium text-app-main">Save to Local Device</span>
                  </div>
                  <p className="mt-1 text-sm text-app-muted">
                    Download the file to your computer
                  </p>
                </div>
              </label>
            </div>

            {/* GitHub Save Option */}
            <div className={`border rounded-lg p-4 ${
              isConnected && canPush
                ? 'border-app-border-muted'
                : 'border-app-border-muted bg-app-hover'
            }`}>
              <label className={`flex items-start gap-3 ${
                isConnected && canPush ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}>
                <input
                  type="radio"
                  name="saveOption"
                  value="github"
                  checked={selectedOption === 'github'}
                  onChange={(e) => setSelectedOption(e.target.value as 'github')}
                  disabled={!isConnected || !canPush}
                  className="mt-1 w-4 h-4 accent-[var(--app-accent-main)] disabled:opacity-50"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-app-muted" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className={`font-medium ${
                      isConnected && canPush
                        ? 'text-app-main'
                        : 'text-app-muted'
                    }`}>
                      Commit to GitHub
                    </span>
                  </div>
                  <p className={`mt-1 text-sm text-app-muted`}>
                    {!isConnected
                      ? 'GitHub not connected'
                      : !canPush
                        ? 'No write permission to repository'
                        : 'Save changes directly to GitHub'
                    }
                  </p>
                </div>
              </label>

              {/* Commit Form */}
              {selectedOption === 'github' && isConnected && canPush && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="commitMessage" className="block text-sm font-medium text-app-secondary mb-1">
                      Commit message *
                    </label>
                    <input
                      id="commitMessage"
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Update markdown content"
                      className="w-full px-3 py-2 border border-app-border-muted rounded-lg bg-app-input text-app-main focus:ring-2 focus:ring-[var(--app-accent-main)] focus:border-transparent placeholder:text-app-muted"
                      required
                    />
                    {commitMessage.length > 0 && commitMessage.length < 3 && (
                      <p className="mt-1 text-xs text-red-400">
                        Commit message must be at least 3 characters
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="commitDescription" className="block text-sm font-medium text-app-secondary mb-1">
                      Extended description (optional)
                    </label>
                    <textarea
                      id="commitDescription"
                      value={commitDescription}
                      onChange={(e) => setCommitDescription(e.target.value)}
                      placeholder="Add more details about this change..."
                      rows={3}
                      className="w-full px-3 py-2 border border-app-border-muted rounded-lg bg-app-input text-app-main focus:ring-2 focus:ring-[var(--app-accent-main)] focus:border-transparent resize-none placeholder:text-app-muted"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {commitError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Commit failed</span>
              </div>
              <p className="mt-1 text-sm text-red-300">{commitError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-app-main">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border rounded-lg transition-colors border-app-main text-app-muted hover:bg-app-hover hover:text-app-main"
          >
            Cancel
          </button>

          {selectedOption === 'local' ? (
            <button
              onClick={handleLocalSave}
              className="px-4 py-2 text-sm font-medium text-app-accent-text bg-app-accent-main hover:bg-app-accent-hover rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Download
            </button>
          ) : (
            <button
              onClick={handleGitHubSave}
              disabled={!isCommitValid || isCommitting || !isConnected || !canPush}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              {isCommitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Committing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Commit & Save
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
