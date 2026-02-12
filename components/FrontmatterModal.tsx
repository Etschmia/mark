import React, { useState, useEffect } from 'react';
import { Modal } from './common/Modal';
import { FrontmatterData } from '../utils/frontmatterUtils';
import { getCurrentDate } from '../utils/frontmatterUtils';

interface FrontmatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontmatter: FrontmatterData;
  onSave: (frontmatter: FrontmatterData) => void;
}

interface FrontmatterEntry {
  key: string;
  value: string;
}

const DEFAULT_KEYS = ['title', 'date', 'description', 'tags', 'author'];

export const FrontmatterModal: React.FC<FrontmatterModalProps> = ({
  isOpen,
  onClose,
  frontmatter,
  onSave
}) => {
  const [entries, setEntries] = useState<FrontmatterEntry[]>([]);

  // Initialize entries from frontmatter when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialEntries: FrontmatterEntry[] = [];

      // Only show keys that actually exist in the frontmatter
      // If frontmatter is empty, show default keys as empty entries
      if (Object.keys(frontmatter).length === 0) {
        // Show default keys as empty entries when no frontmatter exists
        for (const key of DEFAULT_KEYS) {
          initialEntries.push({
            key,
            value: key === 'date' ? getCurrentDate() : ''
          });
        }
      } else {
        // Only show keys that are actually in the frontmatter
        for (const [key, value] of Object.entries(frontmatter)) {
          initialEntries.push({ key, value: value || '' });
        }
      }

      setEntries(initialEntries);
    }
  }, [isOpen, frontmatter]);

  const handleKeyChange = (index: number, newKey: string) => {
    const newEntries = [...entries];
    newEntries[index].key = newKey;
    setEntries(newEntries);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newEntries = [...entries];
    newEntries[index].value = newValue;
    setEntries(newEntries);
  };

  const handleDelete = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const handleAddEntry = () => {
    setEntries([...entries, { key: '', value: '' }]);
  };

  const handleSave = () => {
    const frontmatterData: FrontmatterData = {};

    for (const entry of entries) {
      const trimmedKey = entry.key.trim();
      const trimmedValue = entry.value.trim();
      // Only add entries with non-empty keys and values
      if (trimmedKey && trimmedValue) {
        frontmatterData[trimmedKey] = trimmedValue;
      }
    }

    // Auto-fill date if it was in the entries but is now empty
    const hasDateKey = entries.some(e => e.key.trim() === 'date');
    if (hasDateKey && (!frontmatterData.date || frontmatterData.date === '')) {
      frontmatterData.date = getCurrentDate();
    }

    onSave(frontmatterData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit document frontmatter"
      maxWidth="2xl"
    >
      <div className="p-6">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_2fr_auto] gap-4 pb-2 border-b border-app-main">
            <div className="text-sm font-semibold text-app-secondary">Key</div>
            <div className="text-sm font-semibold text-app-secondary">Value</div>
            <div></div>
          </div>

          {/* Entries */}
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-4 items-center">
                <input
                  type="text"
                  value={entry.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  placeholder="Key"
                  className="px-3 py-2 bg-app-input border border-app-border-muted rounded-md text-app-main placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-[var(--app-accent-main)]"
                />
                <input
                  type="text"
                  value={entry.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  placeholder="Value"
                  className="px-3 py-2 bg-app-input border border-app-border-muted rounded-md text-app-main placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-[var(--app-accent-main)]"
                />
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 text-app-muted hover:text-red-400 hover:bg-app-hover rounded-md transition-colors duration-150"
                  title="Delete entry"
                  aria-label="Delete entry"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add Entry Button */}
          <button
            onClick={handleAddEntry}
            className="w-full px-4 py-2 bg-app-accent-main hover:bg-app-accent-hover text-app-accent-text rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent-main)]"
          >
            Add entry
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-app-main p-6 flex justify-end gap-2">
        <button
          onClick={handleCancel}
          className="px-4 py-2 border border-app-main text-app-muted hover:bg-app-hover hover:text-app-main rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent-main)]"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-app-accent-main hover:bg-app-accent-hover text-app-accent-text rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent-main)]"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};
