import React, { useEffect, useRef } from 'react';
import type { TabContextMenuProps } from '../types';

export const TabContextMenu: React.FC<TabContextMenuProps> = ({
  isOpen,
  position,
  tabId,
  onClose,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onDuplicateTab
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close context menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation within context menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !menuRef.current) return;

      const menuItems = menuRef.current.querySelectorAll('button');
      const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
          menuItems[nextIndex]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
          menuItems[prevIndex]?.focus();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          (document.activeElement as HTMLButtonElement)?.click();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus first menu item when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstMenuItem = menuRef.current.querySelector('button');
      firstMenuItem?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMenuItemClick = (action: () => void) => {
    action();
    onClose();
  };

  // Adjust position to keep menu within viewport
  const adjustedPosition = { ...position };
  const menuWidth = 200; // Approximate menu width
  const menuHeight = 160; // Approximate menu height

  if (position.x + menuWidth > window.innerWidth) {
    adjustedPosition.x = window.innerWidth - menuWidth - 10;
  }
  if (position.y + menuHeight > window.innerHeight) {
    adjustedPosition.y = window.innerHeight - menuHeight - 10;
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 min-w-[200px]"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="tab-context-menu"
    >
      <div className="py-1">
        <button
          onClick={() => handleMenuItemClick(() => onDuplicateTab(tabId))}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2 focus:outline-none focus:bg-gray-100 dark:focus:bg-slate-600"
          role="menuitem"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Duplicate Tab
        </button>

        <div className="border-t border-gray-200 dark:border-slate-600 my-1"></div>

        <button
          onClick={() => handleMenuItemClick(() => onCloseTab(tabId))}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2 focus:outline-none focus:bg-gray-100 dark:focus:bg-slate-600"
          role="menuitem"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close Tab
        </button>

        <button
          onClick={() => handleMenuItemClick(() => onCloseOtherTabs(tabId))}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2 focus:outline-none focus:bg-gray-100 dark:focus:bg-slate-600"
          role="menuitem"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Close Other Tabs
        </button>

        <button
          onClick={() => handleMenuItemClick(() => onCloseAllTabs())}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
          role="menuitem"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Close All Tabs
        </button>
      </div>
    </div>
  );
};