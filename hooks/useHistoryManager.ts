import { useCallback } from 'react';
import { TabManager } from '../utils/tabManager';

interface UseHistoryManagerParams {
  history: string[];
  setHistory: React.Dispatch<React.SetStateAction<string[]>>;
  historyIndex: number;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  tabManagerRef: React.RefObject<TabManager>;
  setMarkdown: React.Dispatch<React.SetStateAction<string>>;
}

export const useHistoryManager = ({
  history,
  setHistory,
  historyIndex,
  setHistoryIndex,
  tabManagerRef,
  setMarkdown,
}: UseHistoryManagerParams) => {
  const addHistoryEntry = useCallback((newMarkdown: string) => {
    // When a new entry is added, clear any "future" history from previous undos
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newMarkdown);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Also update the active tab's history
    const activeTab = tabManagerRef.current?.getActiveTab();
    if (activeTab) {
      tabManagerRef.current?.addToTabHistory(activeTab.id, newMarkdown);
    }
  }, [history, historyIndex, setHistory, setHistoryIndex, tabManagerRef]);

  const handleUndo = useCallback(() => {
    const activeTab = tabManagerRef.current?.getActiveTab();
    if (!activeTab || historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const previousContent = history[newIndex];

    setHistoryIndex(newIndex);
    setMarkdown(previousContent);

    // Update active tab content and history index
    tabManagerRef.current?.updateTabContent(activeTab.id, previousContent);
  }, [history, historyIndex, setHistoryIndex, setMarkdown, tabManagerRef]);

  return {
    addHistoryEntry,
    handleUndo,
  };
};
