import React, { useState } from 'react';
import { Modal } from './common/Modal';

export interface EditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  debounceTime: number;
  previewTheme: string;
  autoSave: boolean;
  showLineNumbers: boolean;
  // Theme bundle settings
  masterTheme?: string;        // Theme bundle ID (when using unified theming)
  useUnifiedTheme: boolean;    // Toggle between unified and individual theming
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  availablePreviewThemes: string[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange,
  availablePreviewThemes
}) => {
  const [localSettings, setLocalSettings] = useState<EditorSettings>(settings);

  // Update local settings when the settings prop changes
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Debug: Log when modal should be visible
  React.useEffect(() => {
    if (isOpen) {
      console.log('Settings modal opened');
    }
  }, [isOpen]);

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
      masterTheme: 'midnight-pro',
      useUnifiedTheme: true
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
      <div className={`${
        localSettings.theme === 'dark' 
          ? 'bg-slate-800 text-white border-slate-700' 
          : 'bg-white text-gray-900 border-gray-200'
      } rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          localSettings.theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={handleCancel}
            className={`p-2 rounded-md transition-colors duration-150 ${
              localSettings.theme === 'dark'
                ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
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
            <h3 className={`text-lg font-semibold ${
              localSettings.theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'
            }`}>
              Appearance
            </h3>
            
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium mb-2 block">Editor theme</span>
                <div className="flex gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={localSettings.theme === 'dark'}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                      className="mr-2"
                    />
                    🌙 Dark
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={localSettings.theme === 'light'}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                      className="mr-2"
                    />
                    ☀️ Light
                  </label>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-2 block">Preview theme</span>
                <select
                  value={localSettings.previewTheme}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, previewTheme: e.target.value }))}
                  className={`w-full p-2 border rounded-md ${
                    localSettings.theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {availablePreviewThemes.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Editor Settings */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${
              localSettings.theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'
            }`}>
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
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
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
            <h3 className={`text-lg font-semibold ${
              localSettings.theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'
            }`}>
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
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
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
          <div className={`p-4 rounded-lg ${
            localSettings.theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
          }`}>
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
        <div className={`border-t p-4 flex justify-between ${
          localSettings.theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-md border transition-colors duration-150 ${
              localSettings.theme === 'dark'
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Reset
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className={`px-4 py-2 rounded-md border transition-colors duration-150 ${
                localSettings.theme === 'dark'
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-md transition-colors duration-150 ${
                localSettings.theme === 'dark'
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};