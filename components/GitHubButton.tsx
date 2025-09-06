import React, { useState } from 'react';
import type { GitHubButtonProps, GitHubConnectionStatus } from '../types';

export const GitHubButton: React.FC<GitHubButtonProps> = ({
  connectionStatus,
  user,
  onConnect,
  onDisconnect,
  onBrowseRepos,
  isLoading = false,
  error,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      );
    }

    if (connectionStatus === 'connected' && user) {
      return (
        <div className="flex items-center gap-2">
          <img 
            src={user.avatar_url} 
            alt={`${user.login} avatar`} 
            className="w-5 h-5 rounded-full"
          />
          <span className="hidden sm:inline">GitHub {user.login}</span>
          <span className="sm:hidden">GitHub</span>
          <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
        <span>Connect with GitHub</span>
      </div>
    );
  };

  const getButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors relative";
    
    if (error) {
      return `${baseStyle} bg-red-600 text-white hover:bg-red-700`;
    }
    
    if (connectionStatus === 'connected') {
      return `${baseStyle} bg-green-600 text-white hover:bg-green-700`;
    }
    
    return `${baseStyle} bg-slate-700 text-white hover:bg-slate-600`;
  };

  const handleButtonClick = () => {
    if (connectionStatus === 'connected') {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      onConnect();
    }
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest('.github-button-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className={`github-button-container relative ${className}`}>
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className={getButtonStyle()}
        title={error || (connectionStatus === 'connected' ? `Connected as ${user?.login}` : 'Connect to GitHub')}
      >
        {getButtonContent()}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && connectionStatus === 'connected' && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-600">
              <div className="flex items-center gap-3">
                <img 
                  src={user?.avatar_url} 
                  alt={`${user?.login} avatar`} 
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || user?.login}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{user?.login}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <button
              onClick={() => {
                onBrowseRepos();
                handleDropdownClose();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 11h8" />
              </svg>
              Browse Repositories
            </button>

            <a
              href={user?.html_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDropdownClose}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
              <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <div className="border-t border-gray-200 dark:border-slate-600">
              <button
                onClick={() => {
                  onDisconnect();
                  handleDropdownClose();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};