import React, { useState } from 'react';
import { Modal } from './common/Modal';
import { appThemes } from '../utils/appThemes';

export interface EditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  debounceTime: number;
  previewTheme: string;
  autoSave: boolean;
  showLineNumbers: boolean;
  themeId: string; // Unified theme ID
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<EditorSettings>(settings);

  // Update local settings when the settings prop changes
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: EditorSettings = {
      theme: 'dark',
      fontSize: 14,
      debounceTime: 500,
      previewTheme: 'Default',
      autoSave: true,
      showLineNumbers: false,
      themeId: 'claude-dark'
    };
    setLocalSettings(defaultSettings);
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to original settings
    onClose();
  };

  // Handle escape key to close modal - always define this hook
  React.useEffect(() => {
    if (!isOpen) return; // Early return if not open, but hook is still called

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-app-panel text-app-main border-app-border-main rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-app-border-muted">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-md transition-colors duration-150 text-app-muted hover:bg-app-hover hover:text-app-main"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-app-accent">
              Appearance
            </h3>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium mb-2 block">Theme</span>
                <select
                  value={localSettings.themeId}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, themeId: e.target.value }))}
                  className={`w-full p-2 border rounded-md bg-app-input text-app-main border-app-main`}
                >
                  <optgroup label="Claude Themes">
                    {appThemes.filter(t => t.id.startsWith('claude-')).map(theme => (
                      <option key={theme.id} value={theme.id}>{theme.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Dark Themes">
                    {appThemes.filter(t => t.type === 'dark' && !t.id.startsWith('claude-')).map(theme => (
                      <option key={theme.id} value={theme.id}>{theme.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Light Themes">
                    {appThemes.filter(t => t.type === 'light' && !t.id.startsWith('claude-')).map(theme => (
                      <option key={theme.id} value={theme.id}>{theme.name}</option>
                    ))}
                  </optgroup>
                </select>
              </label>
            </div>
          </div>

          {/* Editor Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-app-accent">
              Editor
            </h3>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium mb-2 block">
                  Font size: {localSettings.fontSize}px
                </span>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={localSettings.fontSize}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-app-border-muted"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10px</span>
                  <span>24px</span>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.showLineNumbers}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, showLineNumbers: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Show line numbers</span>
              </label>
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-app-accent">
              Behavior
            </h3>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium mb-2 block">
                  Undo debounce time: {localSettings.debounceTime}ms
                </span>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={localSettings.debounceTime}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, debounceTime: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-app-border-muted"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100ms</span>
                  <span>2000ms</span>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.autoSave}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Auto-save to localStorage</span>
              </label>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-4 rounded-lg bg-app-hover">
            <h4 className="font-medium mb-2">💡 Tips</h4>
            <ul className="text-sm space-y-1 opacity-80">
              <li>• Settings are saved automatically</li>
              <li>• Theme changes are applied immediately</li>
              <li>• Debounce time controls how often undo entries are created</li>
              <li>• Auto-save prevents data loss on reload</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between border-app-border-muted">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-md border transition-colors duration-150 border-app-border-main text-app-muted hover:bg-app-hover hover:text-app-main"
          >
            Reset
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-md border transition-colors duration-150 border-app-border-main text-app-muted hover:bg-app-hover hover:text-app-main"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md transition-colors duration-150 bg-app-accent-main hover:bg-app-accent-hover text-app-accent-text"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};