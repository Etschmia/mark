import { useEffect } from 'react';
import { TabManager } from '../utils/tabManager';
import { TabManagerState } from '../types';

interface UseKeyboardShortcutsParams {
  tabManagerRef: React.RefObject<TabManager>;
  tabManagerState: TabManagerState;
  switchToTab: (tabId: string) => boolean;
  closeTab: (tabId: string) => boolean;
  createNewTab: () => string;
  isHelpModalOpen: boolean;
  isCheatSheetModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isAboutModalOpen: boolean;
  isGitHubModalOpen: boolean;
  isSaveOptionsModalOpen: boolean;
  isTabConfirmationOpen: boolean;
}

export const useKeyboardShortcuts = ({
  tabManagerRef,
  tabManagerState,
  switchToTab,
  closeTab,
  createNewTab,
  isHelpModalOpen,
  isCheatSheetModalOpen,
  isSettingsModalOpen,
  isAboutModalOpen,
  isGitHubModalOpen,
  isSaveOptionsModalOpen,
  isTabConfirmationOpen,
}: UseKeyboardShortcutsParams) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // Don't handle shortcuts when typing in input fields or modals are open
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      const isModalOpen = isHelpModalOpen || isCheatSheetModalOpen || isSettingsModalOpen || isAboutModalOpen || isGitHubModalOpen || isSaveOptionsModalOpen || isTabConfirmationOpen;

      if (isInputField || isModalOpen) {
        return;
      }

      // Tab navigation shortcuts
      if (ctrlOrCmd) {
        const tabs = tabManagerRef.current?.getTabs() || [];
        const currentTabIndex = tabs.findIndex(tab => tab.id === tabManagerState.activeTabId);

        switch (event.key) {
          case 'Tab':
            event.preventDefault();
            if (event.shiftKey) {
              // Ctrl/Cmd + Shift + Tab: Previous tab
              const prevIndex = currentTabIndex > 0 ? currentTabIndex - 1 : tabs.length - 1;
              if (tabs[prevIndex]) {
                switchToTab(tabs[prevIndex].id);
              }
            } else {
              // Ctrl/Cmd + Tab: Next tab
              const nextIndex = currentTabIndex < tabs.length - 1 ? currentTabIndex + 1 : 0;
              if (tabs[nextIndex]) {
                switchToTab(tabs[nextIndex].id);
              }
            }
            break;

          case 'w':
            // Ctrl/Cmd + W: Close active tab
            event.preventDefault();
            if (tabManagerState.activeTabId) {
              closeTab(tabManagerState.activeTabId);
            }
            break;

          case 'T':
            // Ctrl/Cmd + Shift + T: Create new tab
            if (event.shiftKey) {
              event.preventDefault();
              createNewTab();
            }
            break;

          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            // Ctrl/Cmd + 1-9: Switch to tab by number
            event.preventDefault();
            const tabNumber = parseInt(event.key) - 1;
            if (tabs[tabNumber]) {
              switchToTab(tabs[tabNumber].id);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabManagerRef, tabManagerState.activeTabId, isHelpModalOpen, isCheatSheetModalOpen, isSettingsModalOpen, isAboutModalOpen, isGitHubModalOpen, isSaveOptionsModalOpen, isTabConfirmationOpen, switchToTab, closeTab, createNewTab]);
};
