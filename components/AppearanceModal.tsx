import React, { useState } from 'react';
import { EditorSettings } from './SettingsModal';
import { themeBundles, ThemeBundle, getThemeBundleById } from '../utils/themeBundles';

// UI Color Presets for Light Mode
export interface UIColorPreset {
  name: string;
  description: string;
  colors: {
    // Main backgrounds
    headerBg: string;
    toolbarBg: string;
    statusBarBg: string;
    buttonBg: string;
    buttonHoverBg: string;
    dropdownBg: string;
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    // Borders
    border: string;
    divider: string;
    // Accents
    accent: string;
    accentHover: string;
  };
  // Tailwind class mappings
  tailwindClasses: {
    headerBg: string;
    statusBarBg: string;
    statusBarText: string;
    statusBarBorder: string;
    buttonBg: string;
    buttonText: string;
    buttonHover: string;
    dropdownBg: string;
    dropdownText: string;
    dropdownHover: string;
    divider: string;
    inputBg: string;
    inputText: string;
    inputBorder: string;
  };
}

export const lightModePresets: UIColorPreset[] = [
  // Bundle-specific presets
  {
    name: 'Classic Paper',
    description: 'Clean neutral grays - matches Classic Paper bundle',
    colors: {
      headerBg: '#ffffff',
      toolbarBg: '#ffffff',
      statusBarBg: '#f5f5f5',
      buttonBg: '#e8e8e8',
      buttonHoverBg: '#d8d8d8',
      dropdownBg: '#ffffff',
      textPrimary: '#333333',
      textSecondary: '#555555',
      textMuted: '#777777',
      border: '#e0e0e0',
      divider: '#e0e0e0',
      accent: '#0066cc',
      accentHover: '#0052a3',
    },
    tailwindClasses: {
      headerBg: 'bg-white',
      statusBarBg: 'bg-neutral-100',
      statusBarText: 'text-neutral-600',
      statusBarBorder: 'border-neutral-300',
      buttonBg: 'bg-neutral-200',
      buttonText: 'text-neutral-700',
      buttonHover: 'hover:bg-neutral-300',
      dropdownBg: 'bg-white',
      dropdownText: 'text-neutral-700',
      dropdownHover: 'hover:bg-neutral-100',
      divider: 'bg-neutral-300',
      inputBg: 'bg-neutral-200',
      inputText: 'text-neutral-700',
      inputBorder: 'border-neutral-300',
    }
  },
  {
    name: 'GitHub Light',
    description: 'GitHub-style interface - matches GitHub Light bundle',
    colors: {
      headerBg: '#ffffff',
      toolbarBg: '#ffffff',
      statusBarBg: '#f6f8fa',
      buttonBg: '#f3f4f6',
      buttonHoverBg: '#e5e7eb',
      dropdownBg: '#ffffff',
      textPrimary: '#24292f',
      textSecondary: '#57606a',
      textMuted: '#6e7781',
      border: '#d0d7de',
      divider: '#d0d7de',
      accent: '#0969da',
      accentHover: '#0550ae',
    },
    tailwindClasses: {
      headerBg: 'bg-white',
      statusBarBg: 'bg-gray-50',
      statusBarText: 'text-gray-600',
      statusBarBorder: 'border-gray-300',
      buttonBg: 'bg-gray-100',
      buttonText: 'text-gray-700',
      buttonHover: 'hover:bg-gray-200',
      dropdownBg: 'bg-white',
      dropdownText: 'text-gray-700',
      dropdownHover: 'hover:bg-gray-100',
      divider: 'bg-gray-300',
      inputBg: 'bg-gray-100',
      inputText: 'text-gray-700',
      inputBorder: 'border-gray-300',
    }
  },
  {
    name: 'Solarized Dawn',
    description: 'Warm cream tones - matches Solarized Dawn bundle',
    colors: {
      headerBg: '#fdf6e3',
      toolbarBg: '#fdf6e3',
      statusBarBg: '#eee8d5',
      buttonBg: '#eee8d5',
      buttonHoverBg: '#ddd8c5',
      dropdownBg: '#fdf6e3',
      textPrimary: '#657b83',
      textSecondary: '#839496',
      textMuted: '#93a1a1',
      border: '#ddd8c5',
      divider: '#ddd8c5',
      accent: '#268bd2',
      accentHover: '#1a6091',
    },
    tailwindClasses: {
      headerBg: 'bg-amber-50',
      statusBarBg: 'bg-amber-100',
      statusBarText: 'text-slate-600',
      statusBarBorder: 'border-amber-200',
      buttonBg: 'bg-amber-100',
      buttonText: 'text-slate-600',
      buttonHover: 'hover:bg-amber-200',
      dropdownBg: 'bg-amber-50',
      dropdownText: 'text-slate-600',
      dropdownHover: 'hover:bg-amber-100',
      divider: 'bg-amber-200',
      inputBg: 'bg-amber-100',
      inputText: 'text-slate-600',
      inputBorder: 'border-amber-200',
    }
  },
  {
    name: 'Ocean Breeze',
    description: 'Cool blue-gray tones - matches Ocean Breeze bundle',
    colors: {
      headerBg: '#fafafa',
      toolbarBg: '#fafafa',
      statusBarBg: '#eceff1',
      buttonBg: '#eceff1',
      buttonHoverBg: '#cfd8dc',
      dropdownBg: '#fafafa',
      textPrimary: '#546e7a',
      textSecondary: '#78909c',
      textMuted: '#90a4ae',
      border: '#cfd8dc',
      divider: '#cfd8dc',
      accent: '#0288d1',
      accentHover: '#0277bd',
    },
    tailwindClasses: {
      headerBg: 'bg-gray-50',
      statusBarBg: 'bg-slate-100',
      statusBarText: 'text-slate-600',
      statusBarBorder: 'border-slate-300',
      buttonBg: 'bg-slate-100',
      buttonText: 'text-slate-600',
      buttonHover: 'hover:bg-slate-200',
      dropdownBg: 'bg-gray-50',
      dropdownText: 'text-slate-600',
      dropdownHover: 'hover:bg-slate-100',
      divider: 'bg-slate-300',
      inputBg: 'bg-slate-100',
      inputText: 'text-slate-600',
      inputBorder: 'border-slate-300',
    }
  },
  // Legacy presets for backwards compatibility
  {
    name: 'Stone (Default)',
    description: 'Warm neutral grays with paper-like feel',
    colors: {
      headerBg: '#ffffff',
      toolbarBg: '#ffffff',
      statusBarBg: '#f5f5f4',
      buttonBg: '#e7e5e4',
      buttonHoverBg: '#d6d3d1',
      dropdownBg: '#ffffff',
      textPrimary: '#44403c',
      textSecondary: '#57534e',
      textMuted: '#78716c',
      border: '#d6d3d1',
      divider: '#d6d3d1',
      accent: '#0891b2',
      accentHover: '#0e7490',
    },
    tailwindClasses: {
      headerBg: 'bg-white',
      statusBarBg: 'bg-stone-100',
      statusBarText: 'text-stone-600',
      statusBarBorder: 'border-stone-300',
      buttonBg: 'bg-stone-200',
      buttonText: 'text-stone-700',
      buttonHover: 'hover:bg-stone-300',
      dropdownBg: 'bg-white',
      dropdownText: 'text-stone-700',
      dropdownHover: 'hover:bg-stone-100',
      divider: 'bg-stone-300',
      inputBg: 'bg-stone-200',
      inputText: 'text-stone-700',
      inputBorder: 'border-stone-300',
    }
  },
  {
    name: 'Cool Gray',
    description: 'Modern cool-toned interface',
    colors: {
      headerBg: '#f9fafb',
      toolbarBg: '#f9fafb',
      statusBarBg: '#f3f4f6',
      buttonBg: '#e5e7eb',
      buttonHoverBg: '#d1d5db',
      dropdownBg: '#ffffff',
      textPrimary: '#374151',
      textSecondary: '#4b5563',
      textMuted: '#6b7280',
      border: '#d1d5db',
      divider: '#d1d5db',
      accent: '#3b82f6',
      accentHover: '#2563eb',
    },
    tailwindClasses: {
      headerBg: 'bg-gray-50',
      statusBarBg: 'bg-gray-100',
      statusBarText: 'text-gray-600',
      statusBarBorder: 'border-gray-300',
      buttonBg: 'bg-gray-200',
      buttonText: 'text-gray-700',
      buttonHover: 'hover:bg-gray-300',
      dropdownBg: 'bg-white',
      dropdownText: 'text-gray-700',
      dropdownHover: 'hover:bg-gray-100',
      divider: 'bg-gray-300',
      inputBg: 'bg-gray-200',
      inputText: 'text-gray-700',
      inputBorder: 'border-gray-300',
    }
  },
  {
    name: 'Warm Sepia',
    description: 'Warm amber tones for comfortable reading',
    colors: {
      headerBg: '#fffbeb',
      toolbarBg: '#fffbeb',
      statusBarBg: '#fef3c7',
      buttonBg: '#fde68a',
      buttonHoverBg: '#fcd34d',
      dropdownBg: '#fffbeb',
      textPrimary: '#78350f',
      textSecondary: '#92400e',
      textMuted: '#b45309',
      border: '#fcd34d',
      divider: '#fcd34d',
      accent: '#d97706',
      accentHover: '#b45309',
    },
    tailwindClasses: {
      headerBg: 'bg-amber-50',
      statusBarBg: 'bg-amber-100',
      statusBarText: 'text-amber-800',
      statusBarBorder: 'border-amber-300',
      buttonBg: 'bg-amber-200',
      buttonText: 'text-amber-900',
      buttonHover: 'hover:bg-amber-300',
      dropdownBg: 'bg-amber-50',
      dropdownText: 'text-amber-900',
      dropdownHover: 'hover:bg-amber-100',
      divider: 'bg-amber-300',
      inputBg: 'bg-amber-100',
      inputText: 'text-amber-900',
      inputBorder: 'border-amber-300',
    }
  },
  {
    name: 'Forest Green',
    description: 'Natural green-tinted theme',
    colors: {
      headerBg: '#f0fdf4',
      toolbarBg: '#f0fdf4',
      statusBarBg: '#dcfce7',
      buttonBg: '#bbf7d0',
      buttonHoverBg: '#86efac',
      dropdownBg: '#f0fdf4',
      textPrimary: '#14532d',
      textSecondary: '#166534',
      textMuted: '#15803d',
      border: '#86efac',
      divider: '#86efac',
      accent: '#16a34a',
      accentHover: '#15803d',
    },
    tailwindClasses: {
      headerBg: 'bg-green-50',
      statusBarBg: 'bg-green-100',
      statusBarText: 'text-green-800',
      statusBarBorder: 'border-green-300',
      buttonBg: 'bg-green-200',
      buttonText: 'text-green-900',
      buttonHover: 'hover:bg-green-300',
      dropdownBg: 'bg-green-50',
      dropdownText: 'text-green-900',
      dropdownHover: 'hover:bg-green-100',
      divider: 'bg-green-300',
      inputBg: 'bg-green-100',
      inputText: 'text-green-900',
      inputBorder: 'border-green-300',
    }
  }
];

// Helper function to get preset by name
export const getPresetByName = (name: string): UIColorPreset => {
  return lightModePresets.find(p => p.name === name) || lightModePresets[0];
};

// Helper to get the default dark mode classes (for when theme is dark)
export const darkModeClasses = {
  headerBg: 'bg-slate-800',
  statusBarBg: 'bg-slate-800',
  statusBarText: 'text-slate-400',
  statusBarBorder: 'border-slate-700',
  buttonBg: 'bg-slate-700',
  buttonText: 'text-slate-300',
  buttonHover: 'hover:bg-slate-600',
  dropdownBg: 'bg-slate-700',
  dropdownText: 'text-slate-300',
  dropdownHover: 'hover:bg-slate-600',
  divider: 'bg-slate-600',
  inputBg: 'bg-slate-700',
  inputText: 'text-slate-300',
  inputBorder: 'border-slate-600',
};

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  currentPreset: string;
  onPresetChange: (presetName: string) => void;
  onBundleSelect: (bundleId: string) => void;
}

// Theme Bundle Card component
const ThemeBundleCard: React.FC<{
  bundle: ThemeBundle;
  isSelected: boolean;
  onClick: () => void;
  isLight: boolean;
}> = ({ bundle, isSelected, onClick, isLight }) => (
  <button
    onClick={onClick}
    className={`text-left p-4 rounded-lg border-2 transition-all ${
      isSelected
        ? 'border-cyan-500 ring-2 ring-cyan-500/20'
        : isLight
          ? 'border-gray-200 hover:border-gray-300'
          : 'border-slate-600 hover:border-slate-500'
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <div>
        <div className={`font-medium ${isSelected ? 'text-cyan-600' : ''}`}>
          {bundle.name}
        </div>
        <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
          {bundle.description}
        </div>
      </div>
      {/* Color swatches */}
      <div className="flex gap-1">
        <div
          className="w-4 h-4 rounded-full border border-gray-400"
          style={{ backgroundColor: bundle.colors.editorBg }}
          title="Editor"
        />
        <div
          className="w-4 h-4 rounded-full border border-gray-400"
          style={{ backgroundColor: bundle.colors.previewBg }}
          title="Preview"
        />
        <div
          className="w-4 h-4 rounded-full border border-gray-400"
          style={{ backgroundColor: bundle.colors.uiBg }}
          title="UI"
        />
      </div>
    </div>
    {/* Mini preview showing harmonized theme colors */}
    <div className="rounded overflow-hidden border border-gray-400">
      <div className="flex h-14">
        {/* Editor preview */}
        <div
          className="flex-1 p-1.5 text-[9px] font-mono leading-tight"
          style={{ backgroundColor: bundle.colors.editorBg, color: bundle.colors.editorText }}
        >
          <div style={{ color: bundle.colors.previewHeading }}># Heading</div>
          <div style={{ opacity: 0.7 }}>text here</div>
        </div>
        {/* Preview preview */}
        <div
          className="flex-1 p-1.5 text-[9px] leading-tight border-l border-gray-400"
          style={{ backgroundColor: bundle.colors.previewBg, color: bundle.colors.previewText }}
        >
          <div style={{ fontWeight: 600, color: bundle.colors.previewHeading }}>Heading</div>
          <div style={{ color: bundle.colors.previewAccent }}>link</div>
        </div>
      </div>
      {/* UI bar */}
      <div
        className="text-[8px] px-1.5 py-1 border-t border-gray-400 flex justify-between"
        style={{ backgroundColor: bundle.colors.uiBg, color: bundle.colors.uiText }}
      >
        <span>Status Bar</span>
        <span style={{ color: bundle.colors.uiAccent }}>Ln 1</span>
      </div>
    </div>
  </button>
);

// Preview component showing how the UI would look
const PreviewPane: React.FC<{ preset: UIColorPreset; isDark: boolean }> = ({ preset, isDark }) => {
  if (isDark) {
    return (
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        {/* Mini header */}
        <div className="bg-slate-800 border-b border-slate-700 p-2 flex gap-1">
          <div className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">New</div>
          <div className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">Open</div>
          <div className="px-2 py-1 text-xs bg-cyan-600 text-white rounded">Save</div>
        </div>
        {/* Mini content */}
        <div className="p-3 bg-slate-900 h-16">
          <div className="text-slate-400 text-xs">Dark mode preview</div>
        </div>
        {/* Mini status bar */}
        <div className="bg-slate-800 border-t border-slate-700 px-2 py-1 text-xs text-slate-400">
          Ln 1, Col 1
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border" style={{ borderColor: preset.colors.border }}>
      {/* Mini header */}
      <div className="p-2 flex gap-1" style={{ backgroundColor: preset.colors.headerBg }}>
        <div className="px-2 py-1 text-xs rounded" style={{
          backgroundColor: preset.colors.buttonBg,
          color: preset.colors.textPrimary
        }}>New</div>
        <div className="px-2 py-1 text-xs rounded" style={{
          backgroundColor: preset.colors.buttonBg,
          color: preset.colors.textPrimary
        }}>Open</div>
        <div className="px-2 py-1 text-xs rounded" style={{
          backgroundColor: preset.colors.accent,
          color: '#ffffff'
        }}>Save</div>
      </div>
      {/* Mini content */}
      <div className="p-3 h-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="text-xs" style={{ color: preset.colors.textMuted }}>Light mode preview</div>
      </div>
      {/* Mini status bar */}
      <div className="px-2 py-1 text-xs" style={{
        backgroundColor: preset.colors.statusBarBg,
        color: preset.colors.textSecondary,
        borderTop: `1px solid ${preset.colors.border}`
      }}>
        Ln 1, Col 1
      </div>
    </div>
  );
};

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  currentPreset,
  onPresetChange,
  onBundleSelect,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(!settings.useUnifiedTheme);
  const [selectedBundle, setSelectedBundle] = useState(settings.masterTheme || 'midnight-pro');
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(settings.theme);
  const [selectedPreset, setSelectedPreset] = useState(currentPreset);

  // Update local state when props change
  React.useEffect(() => {
    setLocalTheme(settings.theme);
    setSelectedPreset(currentPreset);
    setSelectedBundle(settings.masterTheme || 'midnight-pro');
    setShowAdvanced(!settings.useUnifiedTheme);
  }, [settings.theme, currentPreset, settings.masterTheme, settings.useUnifiedTheme]);

  const handleApply = () => {
    if (showAdvanced) {
      // Advanced mode: use individual settings
      onSettingsChange({
        ...settings,
        theme: localTheme,
        useUnifiedTheme: false,
      });
      onPresetChange(selectedPreset);
    } else {
      // Unified mode: apply bundle
      onBundleSelect(selectedBundle);
    }
    onClose();
  };

  const handleCancel = () => {
    setLocalTheme(settings.theme);
    setSelectedPreset(currentPreset);
    setSelectedBundle(settings.masterTheme || 'midnight-pro');
    setShowAdvanced(!settings.useUnifiedTheme);
    onClose();
  };

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  if (!isOpen) return null;

  const isLight = showAdvanced ? localTheme === 'light' : settings.theme === 'light';
  const activePreset = lightModePresets.find(p => p.name === selectedPreset) || lightModePresets[0];

  const darkBundles = themeBundles.filter(b => b.category === 'dark');
  const lightBundles = themeBundles.filter(b => b.category === 'light');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className={`rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border ${
        isLight
          ? 'bg-white text-gray-900 border-gray-200'
          : 'bg-slate-800 text-white border-slate-700'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isLight ? 'border-gray-200' : 'border-slate-700'
        }`}>
          <h2 className="text-2xl font-bold">Appearance</h2>
          <button
            onClick={handleCancel}
            className={`p-2 rounded-md transition-colors duration-150 ${
              isLight
                ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Theme Bundles (Unified Mode) */}
          {!showAdvanced && (
            <>
              <div className="space-y-3">
                <h3 className={`text-lg font-semibold ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
                  Theme
                </h3>
                <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                  Choose a theme that coordinates Editor, Preview, and UI colors
                </p>
              </div>

              {/* Dark Themes */}
              <div className="space-y-3">
                <h4 className={`text-sm font-medium uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>
                  Dark Themes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {darkBundles.map((bundle) => (
                    <ThemeBundleCard
                      key={bundle.id}
                      bundle={bundle}
                      isSelected={selectedBundle === bundle.id}
                      onClick={() => setSelectedBundle(bundle.id)}
                      isLight={isLight}
                    />
                  ))}
                </div>
              </div>

              {/* Light Themes */}
              <div className="space-y-3">
                <h4 className={`text-sm font-medium uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>
                  Light Themes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lightBundles.map((bundle) => (
                    <ThemeBundleCard
                      key={bundle.id}
                      bundle={bundle}
                      isSelected={selectedBundle === bundle.id}
                      onClick={() => setSelectedBundle(bundle.id)}
                      isLight={isLight}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Advanced Mode Toggle */}
          <div className={`p-4 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-700'}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Advanced Settings</div>
                <div className={`text-sm ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                  {showAdvanced
                    ? 'Configure Editor, Preview, and UI themes separately'
                    : 'Manually control each theme component'}
                </div>
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showAdvanced ? 'bg-cyan-600' : isLight ? 'bg-gray-300' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showAdvanced ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Advanced Mode Content */}
          {showAdvanced && (
            <>
              {/* Mode Selection */}
              <div className="space-y-3">
                <h3 className={`text-lg font-semibold ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
                  Mode
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setLocalTheme('light')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      localTheme === 'light'
                        ? 'border-cyan-500 bg-cyan-50'
                        : isLight
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">☀️</div>
                    <div className={`font-medium ${localTheme === 'light' ? 'text-cyan-700' : ''}`}>Light</div>
                  </button>
                  <button
                    onClick={() => setLocalTheme('dark')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      localTheme === 'dark'
                        ? 'border-cyan-500 bg-slate-700'
                        : isLight
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">🌙</div>
                    <div className={`font-medium ${localTheme === 'dark' ? 'text-cyan-400' : ''}`}>Dark</div>
                  </button>
                </div>
              </div>

              {/* Color Presets (only for light mode) */}
              {localTheme === 'light' && (
                <div className="space-y-3">
                  <h3 className={`text-lg font-semibold ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
                    UI Color Preset
                  </h3>
                  <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                    Choose a color scheme for the light mode interface
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lightModePresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setSelectedPreset(preset.name)}
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          selectedPreset === preset.name
                            ? 'border-cyan-500'
                            : isLight
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className={`font-medium ${selectedPreset === preset.name ? 'text-cyan-600' : ''}`}>
                              {preset.name}
                            </div>
                            <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                              {preset.description}
                            </div>
                          </div>
                          {/* Color swatches */}
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: preset.colors.buttonBg }} />
                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: preset.colors.statusBarBg }} />
                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: preset.colors.accent }} />
                          </div>
                        </div>
                        {/* Mini preview */}
                        <PreviewPane preset={preset} isDark={false} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dark mode preview */}
              {localTheme === 'dark' && (
                <div className="space-y-3">
                  <h3 className={`text-lg font-semibold ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
                    Preview
                  </h3>
                  <PreviewPane preset={lightModePresets[0]} isDark={true} />
                  <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                    Dark mode uses the default slate color palette for optimal readability.
                  </p>
                </div>
              )}

              {/* Info for advanced mode */}
              <div className={`p-4 rounded-lg ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-900/20 border border-amber-700'}`}>
                <h4 className={`font-medium mb-2 ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>Note</h4>
                <p className={`text-sm ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                  In advanced mode, Editor and Preview themes are configured separately in the Settings modal.
                  This only controls the UI appearance.
                </p>
              </div>
            </>
          )}

          {/* Info for unified mode */}
          {!showAdvanced && (
            <div className={`p-4 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-700/50'}`}>
              <h4 className="font-medium mb-2">Theme Bundles</h4>
              <ul className={`text-sm space-y-1 ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>
                <li>Each theme coordinates Editor, Preview, and UI colors</li>
                <li>Changes are applied when you click "Apply"</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t p-4 flex justify-end gap-2 ${
          isLight ? 'border-gray-200' : 'border-slate-700'
        }`}>
          <button
            onClick={handleCancel}
            className={`px-4 py-2 rounded-md border transition-colors duration-150 ${
              isLight
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors duration-150"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
