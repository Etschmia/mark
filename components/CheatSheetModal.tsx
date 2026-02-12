import React from 'react';
import { Modal } from './common/Modal';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const markdownSyntax = [
    { category: 'Text Formatting', items: [
      { syntax: '**bold text**', description: 'Bold text', example: '**This is bold**' },
      { syntax: '*italic text*', description: 'Italic text', example: '*This is italic*' },
      { syntax: '~~strikethrough~~', description: 'Strikethrough text', example: '~~This is strikethrough~~' },
      { syntax: '`inline code`', description: 'Inline code', example: '`console.log("Hello")`' },
    ]},
    { category: 'Headers', items: [
      { syntax: '# H1', description: 'Header 1 (largest)', example: '# Main Title' },
      { syntax: '## H2', description: 'Header 2', example: '## Section Title' },
      { syntax: '### H3', description: 'Header 3', example: '### Subsection' },
      { syntax: '#### H4', description: 'Header 4', example: '#### Small Header' },
    ]},
    { category: 'Lists', items: [
      { syntax: '* Item', description: 'Unordered list', example: '* First item\n* Second item' },
      { syntax: '1. Item', description: 'Ordered list', example: '1. First item\n2. Second item' },
      { syntax: '- [ ] Task', description: 'Checklist (unchecked)', example: '- [ ] Todo item' },
      { syntax: '- [x] Task', description: 'Checklist (checked)', example: '- [x] Completed item' },
    ]},
    { category: 'Links & Images', items: [
      { syntax: '[text](url)', description: 'Link', example: '[Google](https://google.com)' },
      { syntax: '![alt](url)', description: 'Image', example: '![Logo](image.png)' },
      { syntax: '[text][ref]', description: 'Reference link', example: '[Google][1]\n[1]: https://google.com' },
    ]},
    { category: 'Code Blocks', items: [
      { syntax: '```\ncode\n```', description: 'Code block', example: '```\nfunction hello() {\n  console.log("Hi");\n}\n```' },
      { syntax: '```javascript\ncode\n```', description: 'Code block with language', example: '```javascript\nconsole.log("Hello");\n```' },
    ]},
    { category: 'Quotes & Lines', items: [
      { syntax: '> Quote', description: 'Blockquote', example: '> This is a quote\n> across multiple lines' },
      { syntax: '---', description: 'Horizontal rule', example: '---' },
    ]},
    { category: 'Tables', items: [
      { syntax: '| Col1 | Col2 |\n|------|------|\n| Cell | Cell |', description: 'Basic table', example: '| Name | Age |\n|------|-----|\n| John | 25  |\n| Jane | 30  |' },
      { syntax: '| Left | Center | Right |\n|:-----|:------:|------:|\n| L    | C      | R     |', description: 'Table with alignment', example: '| Left | Center | Right |\n|:-----|:------:|------:|\n| Text | Text   | Text  |' },
    ]},
    { category: 'Special Characters', items: [
      { syntax: '\\*', description: 'Escape special chars', example: '\\* Not a list item' },
      { syntax: '&nbsp;', description: 'Non-breaking space', example: 'Word&nbsp;together' },
      { syntax: '&lt; &gt;', description: 'HTML entities', example: '&lt;html&gt; tags' },
    ]},
  ];

  // Body overflow handling
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Markdown Cheat Sheet" maxWidth="5xl">
      <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {markdownSyntax.map((category, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-xl font-semibold text-app-accent border-b border-app-border-muted pb-2">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="bg-app-hover rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-app-main font-medium text-sm">
                          {item.description}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-app-main rounded p-2 font-mono text-sm">
                          <span className="text-green-400">Syntax:</span>
                          <pre className="text-app-secondary mt-1 whitespace-pre-wrap">{item.syntax}</pre>
                        </div>
                        <div className="bg-app-input rounded p-2 font-mono text-sm">
                          <span className="text-yellow-400">Example:</span>
                          <pre className="text-app-secondary mt-1 whitespace-pre-wrap">{item.example}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="mt-8 p-4 bg-app-hover rounded-lg">
            <h4 className="text-lg font-medium text-app-main mb-3">Quick Tips</h4>
            <ul className="text-app-secondary text-sm space-y-2">
              <li>• <strong>Combine formatting:</strong> Use <code className="px-1 py-0.5 bg-app-input rounded">***bold and italic***</code> for both effects</li>
              <li>• <strong>Line breaks:</strong> End a line with two spaces for a soft break</li>
              <li>• <strong>Nested lists:</strong> Use 2-4 spaces to indent sub-items</li>
              <li>• <strong>Code languages:</strong> Specify language after ``` for syntax highlighting</li>
              <li>• <strong>Links in new tab:</strong> Not possible in standard Markdown (use HTML)</li>
              <li>• <strong>Keyboard shortcuts:</strong> Use Ctrl/Cmd + shortcuts for quick formatting</li>
            </ul>
          </div>

          {/* Common Languages for Code Blocks */}
          <div className="mt-6 p-4 bg-app-hover rounded-lg">
            <h4 className="text-lg font-medium text-app-main mb-3">Supported Code Languages</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {['javascript', 'python', 'sql', 'php', 'xml', 'html', 'css', 'json', 'bash', 'markdown', 'yaml', 'typescript'].map((lang) => (
                <span key={lang} className="px-2 py-1 bg-app-input rounded text-app-secondary text-center">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-app-main p-4 text-center">
          <p className="text-app-muted text-sm">
            Press <kbd className="px-1 py-0.5 bg-app-input rounded text-xs">Esc</kbd> to close • Use toolbar buttons or keyboard shortcuts for quick formatting
          </p>
        </div>
      </Modal>
    );
};
