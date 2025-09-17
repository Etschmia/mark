import React from 'react';
import { LintError, getErrorDescription, getErrorSeverity, canAutoFix } from '../utils/markdownLinter';

interface LinterPanelProps {
  errors: LintError[];
  isVisible: boolean;
  onToggle: () => void;
  onErrorClick: (lineNumber: number) => void;
  onAutoFix: (error: LintError) => void;
  theme: 'light' | 'dark';
}

export const LinterPanel: React.FC<LinterPanelProps> = ({
  errors,
  isVisible,
  onToggle,
  onErrorClick,
  onAutoFix,
  theme
}) => {
  const errorCount = errors.length;
  const hasErrors = errorCount > 0;

  // Don't render anything if panel is not visible and there are no errors
  if (!isVisible && !hasErrors) {
    return null;
  }

  return (
    <div className={`border-t ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
      {/* Header */}
      <div 
        className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${hasErrors ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Markdown Linter
          </span>
          {hasErrors && (
            <span className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
              {errorCount} {errorCount === 1 ? 'issue' : 'issues'}
            </span>
          )}
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isVisible ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Content */}
      {isVisible && (
        <div className={`max-h-48 overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {!hasErrors ? (
            <div className="px-4 py-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  No linting issues found
                </span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {errors.map((error, index) => (
                <div 
                  key={index}
                  className={`px-4 py-3 hover:${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} cursor-pointer transition-colors`}
                  onClick={() => onErrorClick(error.lineNumber)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          getErrorSeverity(error) === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Line {error.lineNumber}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                          {error.ruleNames[0]}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        {getErrorDescription(error)}
                      </p>
                      {error.errorContext && (
                        <code className={`text-xs mt-1 block px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
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
                        className={`ml-2 px-2 py-1 text-xs rounded transition-colors ${
                          theme === 'dark' 
                            ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
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