import { useCallback } from 'react';
import { TabManager } from '../utils/tabManager';
import { EditorState } from '../types';

interface UseScrollSyncParams {
  isSyncingScroll: React.RefObject<boolean>;
  previewRef: React.RefObject<HTMLDivElement>;
  editorRef: React.RefObject<any>;
  tabManagerRef: React.RefObject<TabManager>;
  editorStateDebounceRef: React.RefObject<number | null>;
  handleEditorScroll: (event: Event) => void;
}

export const useScrollSync = ({
  isSyncingScroll,
  previewRef,
  editorRef,
  tabManagerRef,
  editorStateDebounceRef,
  handleEditorScroll,
}: UseScrollSyncParams) => {
  const handleScroll = useCallback((source: 'editor' | 'preview', event?: Event) => {
    if (isSyncingScroll.current) return;

    isSyncingScroll.current = true;

    try {
      if (source === 'editor' && event && previewRef.current) {
        // Get scroll info from the CodeMirror scroll event
        const scrollElement = event.target as HTMLElement;

        if (scrollElement && scrollElement.scrollHeight > scrollElement.clientHeight) {
          const scrollPercentage = scrollElement.scrollTop /
            (scrollElement.scrollHeight - scrollElement.clientHeight);

          const previewScrollHeight = previewRef.current.scrollHeight - previewRef.current.clientHeight;
          const targetScrollTop = scrollPercentage * previewScrollHeight;

          previewRef.current.scrollTop = targetScrollTop;

          // Preserve scroll position in active tab state
          handleEditorScroll(event);
        }
      } else if (source === 'preview' && previewRef.current && editorRef.current) {
        // Get preview scroll info and prevent division by zero
        const previewScrollHeight = previewRef.current.scrollHeight - previewRef.current.clientHeight;

        if (previewScrollHeight <= 0) return;

        const scrollPercentage = previewRef.current.scrollTop / previewScrollHeight;

        // Find the CodeMirror scroller element
        const editorContainer = document.querySelector('.cm-scroller') as HTMLElement;

        if (editorContainer) {
          const editorScrollHeight = editorContainer.scrollHeight - editorContainer.clientHeight;

          if (editorScrollHeight > 0) {
            const targetScrollTop = scrollPercentage * editorScrollHeight;
            editorContainer.scrollTop = targetScrollTop;
          }
        }
      }
    } catch (error) {
      console.warn('Scroll sync error:', error);
    }

    // Use a timeout to reset the flag
    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 100);
  }, [isSyncingScroll, previewRef, editorRef, handleEditorScroll]);

  return {
    handleScroll,
  };
};
