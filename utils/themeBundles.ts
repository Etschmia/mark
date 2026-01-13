// Harmonized Theme Bundles - coordinates Editor, Preview, and UI themes
// The preview colors define the target aesthetic - the actual themes are crafted to match

export interface ThemeBundle {
  id: string;
  name: string;
  description: string;
  category: 'dark' | 'light';
  editorTheme: string;      // CodeMirror theme key from themeMap
  previewTheme: string;     // Preview theme key (bundle-specific themes)
  uiMode: 'light' | 'dark';
  uiColorPreset?: string;   // Light mode UI preset name
  // Target colors that define the bundle's aesthetic
  // Preview themes and UI are crafted to match these
  colors: {
    editorBg: string;
    editorText: string;
    previewBg: string;
    previewText: string;
    previewHeading: string;
    previewAccent: string;
    uiBg: string;
    uiText: string;
    uiAccent: string;
  };
}

export const themeBundles: ThemeBundle[] = [
  // Dark Themes
  {
    id: 'midnight-pro',
    name: 'Midnight Pro',
    description: 'Professional dark theme for focused work',
    category: 'dark',
    editorTheme: 'vscodeDark',
    previewTheme: 'Midnight Pro',
    uiMode: 'dark',
    colors: {
      editorBg: '#1e1e1e',
      editorText: '#d4d4d4',
      previewBg: '#1e1e1e',
      previewText: '#d4d4d4',
      previewHeading: '#569cd6',
      previewAccent: '#4ec9b0',
      uiBg: '#252526',
      uiText: '#cccccc',
      uiAccent: '#007acc',
    },
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    description: 'GitHub-inspired dark theme',
    category: 'dark',
    editorTheme: 'githubDark',
    previewTheme: 'GitHub Dark',
    uiMode: 'dark',
    colors: {
      editorBg: '#0d1117',
      editorText: '#c9d1d9',
      previewBg: '#0d1117',
      previewText: '#c9d1d9',
      previewHeading: '#f0f6fc',
      previewAccent: '#58a6ff',
      uiBg: '#161b22',
      uiText: '#8b949e',
      uiAccent: '#58a6ff',
    },
  },
  {
    id: 'nord-aurora',
    name: 'Nord Aurora',
    description: 'Calm blue-gray arctic theme',
    category: 'dark',
    editorTheme: 'nord',
    previewTheme: 'Nord',
    uiMode: 'dark',
    colors: {
      editorBg: '#2e3440',
      editorText: '#d8dee9',
      previewBg: '#2e3440',
      previewText: '#d8dee9',
      previewHeading: '#88c0d0',
      previewAccent: '#81a1c1',
      uiBg: '#3b4252',
      uiText: '#d8dee9',
      uiAccent: '#88c0d0',
    },
  },
  {
    id: 'dracula-night',
    name: 'Dracula Night',
    description: 'Purple-accented dark theme',
    category: 'dark',
    editorTheme: 'dracula',
    previewTheme: 'Dracula',
    uiMode: 'dark',
    colors: {
      editorBg: '#282a36',
      editorText: '#f8f8f2',
      previewBg: '#282a36',
      previewText: '#f8f8f2',
      previewHeading: '#bd93f9',
      previewAccent: '#ff79c6',
      uiBg: '#44475a',
      uiText: '#f8f8f2',
      uiAccent: '#bd93f9',
    },
  },
  // Light Themes
  {
    id: 'classic-paper',
    name: 'Classic Paper',
    description: 'Clean, print-ready light theme',
    category: 'light',
    editorTheme: 'bbedit',
    previewTheme: 'Classic Paper',
    uiMode: 'light',
    uiColorPreset: 'Classic Paper',
    colors: {
      editorBg: '#ffffff',
      editorText: '#000000',
      previewBg: '#ffffff',
      previewText: '#333333',
      previewHeading: '#1a1a1a',
      previewAccent: '#0066cc',
      uiBg: '#f5f5f5',
      uiText: '#333333',
      uiAccent: '#0066cc',
    },
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    description: 'Modern light theme inspired by GitHub',
    category: 'light',
    editorTheme: 'githubLight',
    previewTheme: 'GitHub Light',
    uiMode: 'light',
    uiColorPreset: 'GitHub Light',
    colors: {
      editorBg: '#ffffff',
      editorText: '#24292f',
      previewBg: '#ffffff',
      previewText: '#24292f',
      previewHeading: '#1f2328',
      previewAccent: '#0969da',
      uiBg: '#f6f8fa',
      uiText: '#57606a',
      uiAccent: '#0969da',
    },
  },
  {
    id: 'solarized-dawn',
    name: 'Solarized Dawn',
    description: 'Eye-friendly warm light theme',
    category: 'light',
    editorTheme: 'solarizedLight',
    previewTheme: 'Solarized',
    uiMode: 'light',
    uiColorPreset: 'Solarized Dawn',
    colors: {
      editorBg: '#fdf6e3',
      editorText: '#657b83',
      previewBg: '#fdf6e3',
      previewText: '#657b83',
      previewHeading: '#073642',
      previewAccent: '#268bd2',
      uiBg: '#eee8d5',
      uiText: '#657b83',
      uiAccent: '#268bd2',
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Calming blue-tinted light theme',
    category: 'light',
    editorTheme: 'materialLight',
    previewTheme: 'Ocean Breeze',
    uiMode: 'light',
    uiColorPreset: 'Ocean Breeze',
    colors: {
      editorBg: '#fafafa',
      editorText: '#546e7a',
      previewBg: '#fafafa',
      previewText: '#546e7a',
      previewHeading: '#37474f',
      previewAccent: '#0288d1',
      uiBg: '#eceff1',
      uiText: '#546e7a',
      uiAccent: '#0288d1',
    },
  },
];

export const getThemeBundleById = (id: string): ThemeBundle | undefined => {
  return themeBundles.find(b => b.id === id);
};

export const getThemeBundlesByCategory = (category: 'dark' | 'light'): ThemeBundle[] => {
  return themeBundles.filter(b => b.category === category);
};

export const getDefaultThemeBundle = (): ThemeBundle => {
  return themeBundles.find(b => b.id === 'midnight-pro')!;
};
