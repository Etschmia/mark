import React, { useState } from 'react';
import { TabProps } from '../types';

export const Tab: React.FC<TabProps> = ({
  tab,
  isActive,
  onSelect,
  onClose,
  onContextMenu,
  theme
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsCloseHovered(false);
  };

  const handleCloseMouseEnter = () => setIsCloseHovered(true);
  const handleCloseMouseLeave = () => setIsCloseHovered(false);

  // Truncate filename if too long
  const displayName = tab.filename.length > 20
    ? `${tab.filename.substring(0, 17)}...`
    : tab.filename;

  // Enhanced theme-aware styling with improved transitions and focus states
  const baseClasses = "relative flex items-center px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 ease-in-out cursor-pointer select-none group min-w-0";

  const themeClasses = {
    active: "bg-app-panel text-app-main border-app-accent-main shadow-lg",
    inactive: "bg-app-activity-bar text-app-muted border-transparent hover:bg-app-hover hover:text-app-main hover:shadow-md",
    closeButton: "text-app-muted hover:text-app-main hover:bg-app-hover hover:shadow-sm",
    closeButtonHovered: "text-app-main bg-app-hover shadow-sm",
    focusRing: "focus:outline-none focus:ring-2 focus:ring-app-accent-main focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-app-bg-main"
  };

  const tabClasses = `${baseClasses} ${isActive ? themeClasses.active : themeClasses.inactive} ${themeClasses.focusRing}`;

  return (
    <div
      className={tabClasses}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={tab.filename} // Show full filename on hover
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${tab.id}`}
      id={`tab-${tab.id}`}
      tabIndex={isActive ? 0 : -1}
    >
      {/* Filename with loading, unsaved changes indicators */}
      <span className="flex items-center gap-2 min-w-0 max-w-[200px]">
        <span className="truncate font-medium text-sm">
          {displayName}
        </span>

        {/* Loading indicator */}
        {tab.isLoading && (
          <div
            className="w-3 h-3 rounded-full border-2 border-transparent flex-shrink-0 animate-spin border-t-app-accent-main border-r-app-accent-main"
            title="Loading..."
            aria-label="Loading"
          />
        )}

        {/* Unsaved changes indicator */}
        {tab.hasUnsavedChanges && !tab.isLoading && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse bg-orange-500 shadow-sm shadow-orange-500/50"
            title="Unsaved changes"
            aria-label="Unsaved changes"
          />
        )}
      </span>

      {/* Close button with enhanced animations */}
      {(isHovered || isActive) && (
        <button
          className={`ml-2 w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-200 ease-in-out flex-shrink-0 transform hover:scale-110 ${isCloseHovered
              ? themeClasses.closeButtonHovered
              : themeClasses.closeButton
            }`}
          onClick={handleCloseClick}
          onMouseEnter={handleCloseMouseEnter}
          onMouseLeave={handleCloseMouseLeave}
          title="Close tab"
          aria-label={`Close ${tab.filename}`}
          tabIndex={-1} // Prevent tab focus, use mouse only
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none transition-transform duration-200 ease-in-out"
          >
            <path
              d="M1 1L7 7M7 1L1 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Enhanced active tab indicator with gradient */}
      {isActive && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ease-in-out ${theme === 'dark'
              ? 'bg-gradient-to-r from-cyan-400 to-cyan-600 shadow-sm shadow-cyan-500/50'
              : 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-sm shadow-blue-500/50'
            }`}
        />
      )}

      {/* Subtle hover indicator for inactive tabs */}
      {!isActive && isHovered && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200 ease-in-out ${theme === 'dark'
              ? 'bg-slate-500'
              : 'bg-gray-400'
            }`}
        />
      )}
    </div>
  );
};