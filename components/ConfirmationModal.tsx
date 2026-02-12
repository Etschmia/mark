import React from 'react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="relative w-full max-w-md mx-4 p-6 rounded-lg border shadow-lg bg-app-panel border-app-main"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
      >
        {/* Title */}
        <h2
          id="confirmation-title"
          className="text-lg font-semibold mb-4 text-app-main"
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirmation-message"
          className="mb-6 text-app-secondary"
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 border-app-main text-app-muted hover:bg-app-hover hover:text-app-main"
            onClick={onCancel}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                : 'bg-app-accent-main hover:bg-app-accent-hover text-app-accent-text border-app-accent-main'
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
