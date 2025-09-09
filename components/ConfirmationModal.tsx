import React from 'react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme: 'light' | 'dark';
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
  theme,
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

  // Theme-aware styling
  const themeClasses = theme === 'dark' 
    ? {
        backdrop: 'bg-black bg-opacity-50',
        modal: 'bg-slate-800 border-slate-700',
        title: 'text-white',
        message: 'text-slate-300',
        cancelButton: 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border-slate-600',
        confirmButton: variant === 'danger' 
          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
          : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
      }
    : {
        backdrop: 'bg-black bg-opacity-50',
        modal: 'bg-white border-gray-200',
        title: 'text-gray-900',
        message: 'text-gray-700',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border-gray-300',
        confirmButton: variant === 'danger'
          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
          : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
      };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${themeClasses.backdrop}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={`relative w-full max-w-md mx-4 p-6 rounded-lg border shadow-lg ${themeClasses.modal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
      >
        {/* Title */}
        <h2
          id="confirmation-title"
          className={`text-lg font-semibold mb-4 ${themeClasses.title}`}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirmation-message"
          className={`mb-6 ${themeClasses.message}`}
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 ${themeClasses.cancelButton}`}
            onClick={onCancel}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 ${themeClasses.confirmButton}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};