import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Tab } from './Tab';
import { TabBarProps } from '../types';

// CSS to hide scrollbars and add custom animations
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .tab-enter {
    animation: slideIn 0.2s ease-out;
  }
  
  .tab-bar-enter {
    animation: fadeIn 0.3s ease-out;
  }
`;

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabCreate,
  onTabContextMenu,
  theme,
  isCreatingTab = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [focusedTabIndex, setFocusedTabIndex] = useState(-1);

  // Check scroll state
  const checkScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Update scroll state when tabs change or component mounts
  useEffect(() => {
    checkScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollState);
      return () => container.removeEventListener('scroll', checkScrollState);
    }
  }, [tabs, checkScrollState]);

  // Scroll functions
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -120, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  // Scroll active tab into view
  const scrollTabIntoView = useCallback((tabId: string) => {
    const container = scrollContainerRef.current;
    const tabElement = document.getElementById(`tab-${tabId}`);

    if (container && tabElement) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = tabElement.getBoundingClientRect();

      if (tabRect.left < containerRect.left) {
        // Tab is to the left of visible area
        container.scrollBy({
          left: tabRect.left - containerRect.left - 20,
          behavior: 'smooth'
        });
      } else if (tabRect.right > containerRect.right) {
        // Tab is to the right of visible area
        container.scrollBy({
          left: tabRect.right - containerRect.right + 20,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (activeTabId) {
      scrollTabIntoView(activeTabId);
    }
  }, [activeTabId, scrollTabIntoView]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (tabs.length === 0) return;

    const currentActiveIndex = tabs.findIndex(tab => tab.id === activeTabId);

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (focusedTabIndex === -1) {
          // Start keyboard navigation from active tab
          setFocusedTabIndex(currentActiveIndex);
        } else {
          // Move focus left
          const newIndex = Math.max(0, focusedTabIndex - 1);
          setFocusedTabIndex(newIndex);
          scrollTabIntoView(tabs[newIndex].id);
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (focusedTabIndex === -1) {
          // Start keyboard navigation from active tab
          setFocusedTabIndex(currentActiveIndex);
        } else {
          // Move focus right
          const newIndex = Math.min(tabs.length - 1, focusedTabIndex + 1);
          setFocusedTabIndex(newIndex);
          scrollTabIntoView(tabs[newIndex].id);
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedTabIndex >= 0 && focusedTabIndex < tabs.length) {
          onTabSelect(tabs[focusedTabIndex].id);
          setFocusedTabIndex(-1); // Reset focus after selection
        }
        break;

      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        if (focusedTabIndex >= 0 && focusedTabIndex < tabs.length) {
          const tabToClose = tabs[focusedTabIndex];
          onTabClose(tabToClose.id);
          // Adjust focus after closing
          if (focusedTabIndex >= tabs.length - 1) {
            setFocusedTabIndex(Math.max(0, tabs.length - 2));
          }
        }
        break;

      case 'Escape':
        e.preventDefault();
        setFocusedTabIndex(-1); // Exit keyboard navigation
        break;

      default:
        break;
    }
  };

  // Reset focus when clicking outside or when tabs change significantly
  const handleContainerClick = () => {
    setFocusedTabIndex(-1);
  };

  // Enhanced theme-aware styling with improved visual hierarchy
  // Enhanced theme-aware styling with improved visual hierarchy
  const themeClasses = {
    container: 'bg-app-activity-bar border-app-border-main shadow-sm',
    scrollButton: 'bg-app-panel hover:bg-app-hover text-app-muted hover:text-app-main border-app-border-muted hover:shadow-md transition-all duration-200 ease-in-out',
    scrollButtonDisabled: 'bg-app-panel text-app-muted cursor-not-allowed border-app-border-muted opacity-50',
    newTabButton: 'bg-app-panel hover:bg-app-hover text-app-muted hover:text-app-main border-app-border-muted hover:shadow-md transition-all duration-200 ease-in-out hover:scale-105 active:scale-95',
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-app-accent-main focus:ring-opacity-50'
  };

  // Don't render if no tabs (should not happen, but safety check)
  if (tabs.length === 0) {
    return null;
  }

  // Don't render tab bar if only one tab exists (per requirements)
  if (tabs.length === 1) {
    return null;
  }

  return (
    <>
      <style>{scrollbarHideStyle}</style>
      <div
        className={`flex items-center ${themeClasses.container} ${themeClasses.focusRing} tab-bar-enter`}
        role="tablist"
        aria-label="Document tabs"
        onKeyDown={handleKeyDown}
        onClick={handleContainerClick}
        tabIndex={0}
      >
        {/* Left scroll button */}
        <button
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border-r rounded-full ${canScrollLeft ? themeClasses.scrollButton : themeClasses.scrollButtonDisabled
            } ${themeClasses.focusRing}`}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          title="Scroll tabs left"
          aria-label="Scroll tabs left"
          tabIndex={-1}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 9L4.5 6L7.5 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Scrollable tabs container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="flex min-w-max">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`flex-shrink-0 transition-all duration-200 ease-in-out tab-enter ${focusedTabIndex === index
                    ? `ring-2 ring-app-accent-main ring-opacity-50 ring-offset-2 ring-offset-app-bg-main`
                    : ''
                  }`}
              >
                <Tab
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onSelect={() => {
                    onTabSelect(tab.id);
                    setFocusedTabIndex(-1);
                  }}
                  onClose={() => onTabClose(tab.id)}
                  onContextMenu={(event) => onTabContextMenu(tab.id, event)}
                  theme={theme}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right scroll button */}
        <button
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border-l rounded-full ${canScrollRight ? themeClasses.scrollButton : themeClasses.scrollButtonDisabled
            } ${themeClasses.focusRing}`}
          onClick={scrollRight}
          disabled={!canScrollRight}
          title="Scroll tabs right"
          aria-label="Scroll tabs right"
          tabIndex={-1}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 3L7.5 6L4.5 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* New tab button */}
        <button
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border-l rounded-full ${themeClasses.newTabButton} ${themeClasses.focusRing} ${isCreatingTab ? 'opacity-75 cursor-wait' : ''}`}
          onClick={onTabCreate}
          disabled={isCreatingTab}
          title={isCreatingTab ? "Creating new tab..." : "New tab (Ctrl/Cmd + T)"}
          aria-label={isCreatingTab ? "Creating new tab" : "Create new tab"}
          tabIndex={-1}
        >
          {isCreatingTab ? (
            <div
              className="w-3 h-3 rounded-full border-2 border-transparent animate-spin border-t-app-accent-main border-r-app-accent-main"
            />
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-200 ease-in-out group-hover:scale-110"
            >
              <path
                d="M6 2V10M2 6H10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
};