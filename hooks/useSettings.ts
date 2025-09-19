import { useCallback } from 'react';
import { EditorSettings } from '../components/SettingsModal';

interface UseSettingsParams {
  settings: EditorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
  setPreviewTheme: React.Dispatch<React.SetStateAction<string>>;
}

export const useSettings = ({
  settings,
  setSettings,
  setPreviewTheme,
}: UseSettingsParams) => {
  const handleSettingsChange = useCallback((newSettings: EditorSettings) => {
    setSettings(newSettings);
    setPreviewTheme(newSettings.previewTheme);

    // Persist settings to localStorage
    try {
      localStorage.setItem('markdown-editor-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Failed to persist settings to localStorage:', error);
    }
  }, [setSettings, setPreviewTheme]);

  const toggleLineNumbers = useCallback(() => {
    handleSettingsChange({ ...settings, showLineNumbers: !settings.showLineNumbers });
  }, [settings, handleSettingsChange]);

  return {
    handleSettingsChange,
    toggleLineNumbers,
  };
};
