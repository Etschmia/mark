import React from 'react';
import { LintError, getErrorDescription, getErrorSeverity, canAutoFix } from '../utils/markdownLinter';

interface LinterPanelProps {
  errors: LintError[];
  isVisible: boolean;
  onToggle: () => void;
  onErrorClick: (lineNumber: number) => void;
  onAutoFix: (error: LintError) => void;
}

export const LinterPanel: React.FC<LinterPanelProps> = ({
  errors,
  isVisible,
  onToggle,
  onErrorClick,
  onAutoFix,
}) => {
  const errorCount = errors.length;
  const hasErrors = errorCount > 0;

  // Don't render anything if panel is not visible and there are no errors
  if (!isVisible && !hasErrors) {
    return null;
  }

  return (
    <div className="border-t border-app-main bg-app-panel">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-app-hover transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${hasErrors ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className="text-sm font-medium text-app-main">
            Markdown Linter
          </span>
          {hasErrors && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-400">
              {errorCount} {errorCount === 1 ? 'issue' : 'issues'}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isVisible ? 'rotate-180' : ''} text-app-muted`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Content */}
      {isVisible && (
        <div className="max-h-48 overflow-y-auto bg-app-main">
          {!hasErrors ? (
            <div className="px-4 py-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-app-secondary">
                  No linting issues found
                </span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-app-main">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-app-hover cursor-pointer transition-colors"
                  onClick={() => onErrorClick(error.lineNumber)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          getErrorSeverity(error) === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-xs font-mono text-app-muted">
                          Line {error.lineNumber}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-app-input text-app-secondary">
                          {error.ruleNames[0]}
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-app-main">
                        {getErrorDescription(error)}
                      </p>
                      {error.errorContext && (
                        <code className="text-xs mt-1 block px-2 py-1 rounded bg-app-input text-app-secondary">
                          {error.errorContext}
                        </code>
                      )}
                    </div>
                    {canAutoFix(error) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAutoFix(error);
                        }}
                        className="ml-2 px-2 py-1 text-xs rounded transition-colors bg-blue-900/30 text-blue-400 hover:bg-blue-800/40"
                        title="Auto-fix this issue"
                      >
                        Fix
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
