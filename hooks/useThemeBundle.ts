import { useCallback } from 'react';
import { EditorSettings } from '../components/SettingsModal';
import { getThemeBundleById, ThemeBundle } from '../utils/themeBundles';

interface UseThemeBundleParams {
  settings: EditorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
  setCodemirrorTheme: React.Dispatch<React.SetStateAction<string>>;
  setPreviewTheme: React.Dispatch<React.SetStateAction<string>>;
  setCurrentColorPreset: React.Dispatch<React.SetStateAction<string>>;
}

export const useThemeBundle = ({
  settings,
  setSettings,
  setCodemirrorTheme,
  setPreviewTheme,
  setCurrentColorPreset,
}: UseThemeBundleParams) => {

  const applyThemeBundle = useCallback((bundleId: string) => {
    const bundle = getThemeBundleById(bundleId);
    if (!bundle) {
      console.warn(`Theme bundle '${bundleId}' not found`);
      return;
    }

    // Apply editor theme
    setCodemirrorTheme(bundle.editorTheme);

    // Apply preview theme
    setPreviewTheme(bundle.previewTheme);

    // Apply UI color preset (only for light mode)
    if (bundle.uiMode === 'light' && bundle.uiColorPreset) {
      setCurrentColorPreset(bundle.uiColorPreset);
    }

    // Update settings with new theme configuration
    const newSettings: EditorSettings = {
      ...settings,
      theme: bundle.uiMode,
      previewTheme: bundle.previewTheme,
      masterTheme: bundleId,
      useUnifiedTheme: true,
    };

    setSettings(newSettings);

    // Persist to localStorage
    try {
      localStorage.setItem('markdown-editor-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Failed to persist settings to localStorage:', error);
    }
  }, [settings, setSettings, setCodemirrorTheme, setPreviewTheme, setCurrentColorPreset]);

  const toggleUnifiedTheme = useCallback((enabled: boolean) => {
    const newSettings: EditorSettings = {
      ...settings,
      useUnifiedTheme: enabled,
    };

    setSettings(newSettings);

    // Persist to localStorage
    try {
      localStorage.setItem('markdown-editor-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Failed to persist settings to localStorage:', error);
    }
  }, [settings, setSettings]);

  const getCurrentBundle = useCallback((): ThemeBundle | undefined => {
    if (!settings.masterTheme) return undefined;
    return getThemeBundleById(settings.masterTheme);
  }, [settings.masterTheme]);

  return {
    applyThemeBundle,
    toggleUnifiedTheme,
    getCurrentBundle,
  };
};
