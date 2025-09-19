import { useCallback } from 'react';
import { TabManager } from '../utils/tabManager';
import { lintMarkdown, LintResult, LintError, applyAutoFix } from '../utils/markdownLinter';

interface UseLinterParams {
  isLinterActive: boolean;
  setIsLinterActive: React.Dispatch<React.SetStateAction<boolean>>;
  isLinterPanelVisible: boolean;
  setIsLinterPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
  editorRef: React.RefObject<any>;
  setLintResult: React.Dispatch<React.SetStateAction<LintResult>>;
  lintDebounceRef: React.RefObject<number | null>;
  tabManagerRef: React.RefObject<TabManager>;
  setMarkdown: React.Dispatch<React.SetStateAction<string>>;
  addHistoryEntry: (newMarkdown: string) => void;
}

export const useLinter = ({
  isLinterActive,
  setIsLinterActive,
  isLinterPanelVisible,
  setIsLinterPanelVisible,
  editorRef,
  setLintResult,
  lintDebounceRef,
  tabManagerRef,
  setMarkdown,
  addHistoryEntry,
}: UseLinterParams) => {
  const handleLinterToggle = useCallback(() => {
    setIsLinterPanelVisible(!isLinterPanelVisible);
  }, [isLinterPanelVisible, setIsLinterPanelVisible]);

  const handleLinterErrorClick = useCallback((lineNumber: number) => {
    if (editorRef.current) {
      // Calculate the position of the line
      const content = editorRef.current.getValue();
      const lines = content.split('\n');
      let position = 0;

      for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
        position += lines[i].length + 1; // +1 for newline character
      }

      // Set cursor to the beginning of the line
      editorRef.current.setSelection(position, position);
      editorRef.current.focus();
    }
  }, [editorRef]);

  const handleAutoFix = useCallback((error: LintError) => {
    if (editorRef.current) {
      const currentContent = editorRef.current.getValue();
      const fixedContent = applyAutoFix(currentContent, error);

      if (fixedContent !== currentContent) {
        // Update the editor content
        const activeTab = tabManagerRef.current?.getActiveTab();
        if (activeTab) {
          tabManagerRef.current?.updateTabContent(activeTab.id, fixedContent);
          setMarkdown(fixedContent);

          // Re-lint after fix
          lintMarkdown(fixedContent).then(result => {
            setLintResult(result);
          });

          // Add to history
          addHistoryEntry(fixedContent);
        }
      }
    }
  }, [editorRef, tabManagerRef, setMarkdown, setLintResult, addHistoryEntry]);

  const runLinter = useCallback(() => {
    if (isLinterActive) {
      // Deactivate linter
      setIsLinterActive(false);
      setIsLinterPanelVisible(false);
      setLintResult({ errors: [], errorCount: 0, warningCount: 0 });

      // Clear any pending lint operations
      if (lintDebounceRef.current) {
        clearTimeout(lintDebounceRef.current);
        lintDebounceRef.current = null;
      }
    } else {
      // Activate linter
      setIsLinterActive(true);
      const content = editorRef.current?.getValue() || '';
      lintMarkdown(content).then(result => {
        setLintResult(result);
        setIsLinterPanelVisible(true);
      });
    }
  }, [isLinterActive, setIsLinterActive, setIsLinterPanelVisible, setLintResult, editorRef, lintDebounceRef]);

  return {
    handleLinterToggle,
    handleLinterErrorClick,
    handleAutoFix,
    runLinter,
  };
};