import { useCallback } from 'react';
import { FormatType } from '../types';

interface UseFormattingParams {
  editorRef: React.RefObject<any>;
  addHistoryEntry: (newMarkdown: string) => void;
  handleNewFile: () => void;
  handleSaveFile: () => Promise<void>;
  handleOpenFile: () => Promise<void>;
  runLinter: () => void;
}

export const useFormatting = ({
  editorRef,
  addHistoryEntry,
  handleNewFile,
  handleSaveFile,
  handleOpenFile,
  runLinter,
}: UseFormattingParams) => {
  const applyFormatting = useCallback((prefix: string, suffix: string = prefix) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const selectedText = editor.getValue().substring(selection.start, selection.end);
    const formattedText = `${prefix}${selectedText}${suffix}`;

    editor.insertText(formattedText, selection.start, selection.end);

    // Set selection after formatting
    const newStart = selection.start + prefix.length;
    const newEnd = newStart + selectedText.length;
    editor.setSelection(newStart, newEnd);

    addHistoryEntry(editor.getValue());
  }, [editorRef, addHistoryEntry]);

  const applyLineFormatting = useCallback((prefix: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const fullText = editor.getValue();

    let lineStartIndex = fullText.lastIndexOf('\n', selection.start - 1) + 1;
    let lineEndIndex = fullText.indexOf('\n', selection.end);
    if (lineEndIndex === -1) {
      lineEndIndex = fullText.length;
    }

    const selectedLinesText = fullText.substring(lineStartIndex, lineEndIndex);
    const lines = selectedLinesText.split('\n');
    const formattedLines = lines.map(line => {
      // Toggle off if prefix already exists
      if (line.startsWith(prefix)) {
        return line.substring(prefix.length);
      }
      return `${prefix}${line}`
    }).join('\n');

    editor.insertText(formattedLines, lineStartIndex, lineEndIndex);
    addHistoryEntry(editor.getValue());

    editor.focus();
  }, [editorRef, addHistoryEntry]);

  const handleFormat = useCallback((formatType: FormatType, options?: { language?: string }) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Handle file operations first
    if (formatType === 'new') {
      handleNewFile();
      return;
    }
    if (formatType === 'save' || formatType === 'saveAs') {
      handleSaveFile();
      return;
    }
    if (formatType === 'open') {
      handleOpenFile();
      return;
    }

    if (formatType === 'search') {
      editor.openSearchPanel();
      return;
    }

    if (formatType === 'lint') {
      runLinter();
      return;
    }

    if (formatType === 'code') {
      const lang = options?.language;
      const selection = editor.getSelection();
      const selectedText = editor.getValue().substring(selection.start, selection.end);

      // If a language is specified, always create a fenced code block
      if (lang) {
        applyFormatting(`\`\`\`${lang}\n`, '\n```');
      } else { // "Default Code": use logic for inline vs block
        if (selectedText.includes('\n') || !selectedText) {
          applyFormatting('```\n', '\n```');
        } else {
          applyFormatting('`');
        }
      }
      return;
    }

    switch (formatType) {
      case 'bold': applyFormatting('**'); break;
      case 'italic': applyFormatting('*'); break;
      case 'strikethrough': applyFormatting('~~'); break;
      case 'h1': applyLineFormatting('# '); break;
      case 'h2': applyLineFormatting('## '); break;
      case 'h3': applyLineFormatting('### '); break;
      case 'quote': applyLineFormatting('> '); break;
      case 'ul': applyLineFormatting('* '); break;
      case 'ol': applyLineFormatting('1. '); break;
      case 'checklist': applyLineFormatting('- [ ] '); break;
      case 'table': {
        const tableTemplate = `| Header 1 | Header 2 |\n|:---------|:---------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |`;

        const selection = editor.getSelection();
        const fullText = editor.getValue();
        const precedingChar = fullText.substring(selection.start - 1, selection.start);

        // Add newlines for proper block-level separation
        const prefix = (selection.start === 0 || precedingChar === '\n') ? '' : '\n\n';
        const suffix = '\n';
        const textToInsert = prefix + tableTemplate + suffix;

        editor.insertText(textToInsert, selection.start, selection.end);
        addHistoryEntry(editor.getValue());

        // Select the first header cell
        const headerStart = selection.start + prefix.length + tableTemplate.indexOf('Header 1');
        const headerEnd = headerStart + 'Header 1'.length;
        editor.setSelection(headerStart, headerEnd);
        break;
      }
      case 'image': {
        const url = window.prompt('Geben Sie die Bild-URL ein:', 'https://');
        if (url && url !== 'https://') {
          const selection = editor.getSelection();
          const altText = editor.getValue().substring(selection.start, selection.end) || 'alt text';
          const imageMarkdown = `![${altText}](${url})`;

          editor.insertText(imageMarkdown, selection.start, selection.end);
          addHistoryEntry(editor.getValue());

          // Select the alt text
          const altStart = selection.start + 2; // `![`
          const altEnd = altStart + altText.length;
          editor.setSelection(altStart, altEnd);
        }
        break;
      }
      case 'link': {
        const url = window.prompt('Geben Sie die Ziel-URL ein:', 'https://');
        if (url && url !== 'https://') {
          const selection = editor.getSelection();
          let selectedText = editor.getValue().substring(selection.start, selection.end);
          let isPlaceholder = false;

          if (!selectedText) {
            selectedText = 'Link-Text';
            isPlaceholder = true;
          }

          const linkMarkdown = `[${selectedText}](${url})`;

          editor.insertText(linkMarkdown, selection.start, selection.end);
          addHistoryEntry(editor.getValue());

          if (isPlaceholder) {
            const linkStart = selection.start + 1; // `[`
            const linkEnd = linkStart + selectedText.length;
            editor.setSelection(linkStart, linkEnd);
          } else {
            const newCursorPos = selection.start + linkMarkdown.length;
            editor.setSelection(newCursorPos, newCursorPos);
          }
        }
        break;
      }
    }
  }, [editorRef, addHistoryEntry, handleNewFile, handleSaveFile, handleOpenFile, runLinter, applyFormatting, applyLineFormatting]);

  return {
    applyFormatting,
    applyLineFormatting,
    handleFormat,
  };
};
