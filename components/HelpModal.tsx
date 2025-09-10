import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const keyboardShortcuts = [
    { category: 'Text Formatting', shortcuts: [
      { keys: 'Ctrl/Cmd + B', description: 'Bold - Makes selected text bold (**text**)' },
      { keys: 'Ctrl/Cmd + I', description: 'Italic - Makes selected text italic (*text*)' },
      { keys: 'Ctrl/Cmd + D', description: 'Strikethrough - Strikes through selected text (~~text~~)' },
    ]},
    { category: 'Headers', shortcuts: [
      { keys: 'Ctrl/Cmd + 1', description: 'Header 1 - Creates largest header (# text)' },
      { keys: 'Ctrl/Cmd + 2', description: 'Header 2 - Creates medium header (## text)' },
      { keys: 'Ctrl/Cmd + 3', description: 'Header 3 - Creates small header (### text)' },
    ]},
    { category: 'Lists and Structure', shortcuts: [
      { keys: 'Ctrl/Cmd + U', description: 'Unordered List - Creates bullet points (* item)' },
      { keys: 'Ctrl/Cmd + O', description: 'Ordered List - Creates numbered list (1. item)' },
      { keys: 'Ctrl/Cmd + Shift + C', description: 'Checklist - Creates checkboxes (- [ ] item)' },
      { keys: 'Ctrl/Cmd + Q', description: 'Quote - Creates blockquote (> text)' },
      { keys: 'Ctrl/Cmd + T', description: 'Table - Inserts table template' },
    ]},
    { category: 'Code and Links', shortcuts: [
      { keys: 'Ctrl/Cmd + E', description: 'Code - Inline code (`code`) or code block (```code```)' },
      { keys: 'Ctrl/Cmd + K', description: 'Link - Creates link ([text](url))' },
      { keys: 'Ctrl/Cmd + M', description: 'Image - Inserts image (![alt](url))' },
    ]},
    { category: 'Editor Functions', shortcuts: [
      { keys: 'Ctrl/Cmd + F', description: 'Search - Opens search and replace panel' },
      { keys: 'Ctrl/Cmd + Z', description: 'Undo - Undoes last change' },
      { keys: 'Tab', description: 'Indent - Indents selected lines' },
      { keys: 'Escape', description: 'Close - Closes search panel or help modal' },
    ]},
    { category: 'Tab Management', shortcuts: [
      { keys: 'Ctrl/Cmd + Shift + T', description: 'New Tab - Creates new document tab' },
      { keys: 'Ctrl/Cmd + W', description: 'Close Tab - Closes current tab (with unsaved changes protection)' },
      { keys: 'Ctrl/Cmd + Tab', description: 'Next Tab - Switches to next tab' },
      { keys: 'Ctrl/Cmd + Shift + Tab', description: 'Previous Tab - Switches to previous tab' },
      { keys: 'Ctrl/Cmd + 1-9', description: 'Switch to Tab - Switches to tab by number (1st-9th tab)' },
    ]},
    { category: 'File Operations', shortcuts: [
      { keys: 'Ctrl/Cmd + N', description: 'New - Creates new document' },
      { keys: 'Ctrl/Cmd + S', description: 'Save - Saves current document' },
      { keys: 'Ctrl/Cmd + Shift + S', description: 'Save As - Saves document with new name' },
      { keys: 'Ctrl/Cmd + Shift + O', description: 'Open - Opens existing document' },
    ]},
  ];

  const toolbarItems = [
    { category: 'Text Formatting', items: [
      { icon: 'B', name: 'Bold', description: 'Makes selected text bold. Wraps text with **asterisks**.' },
      { icon: 'I', name: 'Italic', description: 'Makes selected text italic. Wraps text with *single asterisks*.' },
      { icon: 'A̶', name: 'Strikethrough', description: 'Strikes through text. Wraps text with ~~tildes~~.' },
    ]},
    { category: 'Headers', items: [
      { icon: 'H1', name: 'Header 1', description: 'Creates the largest header. Adds # at the beginning of line.' },
      { icon: 'H2', name: 'Header 2', description: 'Creates medium header. Adds ## at the beginning of line.' },
      { icon: 'H3', name: 'Header 3', description: 'Creates small header. Adds ### at the beginning of line.' },
    ]},
    { category: 'Lists and Structure', items: [
      { icon: '"', name: 'Quote', description: 'Creates blockquote. Adds > at the beginning of line.' },
      { icon: '•', name: 'Unordered List', description: 'Creates bullet points. Adds * at the beginning of line.' },
      { icon: '1.', name: 'Ordered List', description: 'Creates numbered list. Adds 1. at the beginning of line.' },
      { icon: '☑', name: 'Checklist', description: 'Creates checkboxes. Adds - [ ] at the beginning of line.' },
      { icon: '⊞', name: 'Table', description: 'Inserts table template with headers and sample data.' },
    ]},
    { category: 'Media and Links', items: [
      { icon: '🖼', name: 'Image', description: 'Inserts image. Creates ![alt text](image-url) format.' },
      { icon: '🔗', name: 'Link', description: 'Creates hyperlink. Creates [link text](url) format.' },
    ]},
    { category: 'Code and Tools', items: [
      { icon: '< >', name: 'Code', description: 'Inserts code block or inline code. Supports multiple languages.' },
      { icon: '🔍', name: 'Search', description: 'Opens search and replace panel with regex support.' },
      { icon: '↶', name: 'Undo', description: 'Undoes the last change. Works with text and formatting.' },
      { icon: '📤', name: 'Export', description: 'Exports document as HTML or PDF with formatting preserved.' },
    ]},
    { category: 'File Operations', items: [
      { icon: 'New', name: 'New File', description: 'Creates a new empty document.' },
      { icon: 'Open', name: 'Open File', description: 'Opens an existing Markdown file from your computer.' },
      { icon: 'Save', name: 'Save File', description: 'Saves the current document to your computer.' },
    ]},
  ];

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Help & Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-150"
            aria-label="Close help"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Keyboard Shortcuts */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-6">
                {keyboardShortcuts.map((category, idx) => (
                  <div key={idx}>
                    <h4 className="text-lg font-medium text-cyan-400 mb-3">{category.category}</h4>
                    <div className="space-y-2">
                      {category.shortcuts.map((shortcut, shortcutIdx) => (
                        <div key={shortcutIdx} className="flex items-start gap-3">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-slate-700 text-slate-300 whitespace-nowrap min-w-[120px]">
                            {shortcut.keys}
                          </span>
                          <span className="text-slate-300 text-sm leading-relaxed">
                            {shortcut.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Toolbar Items */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Toolbar Reference</h3>
              <div className="space-y-6">
                {toolbarItems.map((category, idx) => (
                  <div key={idx}>
                    <h4 className="text-lg font-medium text-cyan-400 mb-3">{category.category}</h4>
                    <div className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-slate-700 text-slate-300 text-sm font-medium flex-shrink-0">
                            {item.icon}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium text-slate-200">{item.name}</div>
                            <div className="text-slate-400 text-sm leading-relaxed">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-8 p-4 bg-slate-700 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-2">Tips</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Most shortcuts work with selected text or at cursor position</li>
              <li>• Use <code className="px-1 py-0.5 bg-slate-600 rounded">Ctrl</code> on Windows/Linux or <code className="px-1 py-0.5 bg-slate-600 rounded">Cmd</code> on Mac</li>
              <li>• Code blocks support syntax highlighting for multiple languages</li>
              <li>• Search supports regular expressions when regex mode is enabled</li>
              <li>• Your work is automatically saved to browser storage</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-slate-700 p-4 text-center">
          <p className="text-slate-400 text-sm">
            Press <kbd className="px-1 py-0.5 bg-slate-600 rounded text-xs">Esc</kbd> to close this help
          </p>
        </div>
      </div>
    </div>
  );
};