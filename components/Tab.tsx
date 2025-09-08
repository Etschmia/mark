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

  // Theme-aware styling
  const baseClasses = "relative flex items-center px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-150 cursor-pointer select-none";
  
  const themeClasses = theme === 'dark' 
    ? {
        active: "bg-slate-800 text-white border-cyan-500",
        inactive: "bg-slate-700 text-slate-300 border-transparent hover:bg-slate-600 hover:text-white",
        closeButton: "text-slate-400 hover:text-white hover:bg-slate-600",
        closeButtonHovered: "text-white bg-slate-600"
      }
    : {
        active: "bg-white text-gray-900 border-blue-500 shadow-sm",
        inactive: "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200 hover:text-gray-900",
        closeButton: "text-gray-400 hover:text-gray-600 hover:bg-gray-200",
        closeButtonHovered: "text-gray-600 bg-gray-200"
      };

  const tabClasses = `${baseClasses} ${isActive ? themeClasses.active : themeClasses.inactive}`;

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
      {/* Filename with unsaved changes indicator */}
      <span className="flex items-center gap-1 min-w-0">
        <span className="truncate">
          {displayName}
        </span>
        {tab.hasUnsavedChanges && (
          <span 
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              theme === 'dark' 
                ? 'bg-orange-400' 
                : 'bg-orange-500'
            }`}
            title="Unsaved changes"
            aria-label="Unsaved changes"
          />
        )}
      </span>

      {/* Close button */}
      {(isHovered || isActive) && (
        <button
          className={`ml-2 w-4 h-4 rounded-sm flex items-center justify-center transition-colors duration-150 flex-shrink-0 ${
            isCloseHovered 
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
            className="pointer-events-none"
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

      {/* Active tab indicator line */}
      {isActive && (
        <div 
          className={`absolute bottom-0 left-0 right-0 h-0.5 ${
            theme === 'dark' ? 'bg-cyan-500' : 'bg-blue-500'
          }`}
        />
      )}
    </div>
  );
};