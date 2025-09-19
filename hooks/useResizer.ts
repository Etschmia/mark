import { useCallback, useEffect } from 'react';

interface UseResizerParams {
  isResizing: boolean;
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
  mainRef: React.RefObject<HTMLElement>;
}

export const useResizer = ({
  isResizing,
  setIsResizing,
  mainRef,
}: UseResizerParams) => {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, [setIsResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, [setIsResizing]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && mainRef.current) {
      const rect = mainRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;

      const minWidth = rect.width * 0.2;
      const maxWidth = rect.width * 0.8;

      if (newWidth > minWidth && newWidth < maxWidth) {
        const newEditorPercentage = (newWidth / rect.width) * 100;
        mainRef.current.style.gridTemplateColumns = `${newEditorPercentage}% auto 1fr`;
      }
    }
  }, [isResizing, mainRef]);

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
  };
};
