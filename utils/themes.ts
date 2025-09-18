// Central theme configuration for CodeMirror
import { 
  basicDark,
  aura,
  dracula,
  githubDark,
  githubLight,
  materialDark,
  materialLight,
  monokai,
  nord,
  okaidia,
  solarizedDark,
  solarizedLight,
  tokyoNight,
  vscodeDark,
  vscodeLight
} from '@uiw/codemirror-themes-all';

// Theme mapping with proper extension functions
export const themeMap: Record<string, any> = {
  basicDark: basicDark,
  aura: aura,
  dracula: dracula,
  githubDark: githubDark,
  githubLight: githubLight,
  materialDark: materialDark,
  materialLight: materialLight,
  monokai: monokai,
  nord: nord,
  okaidia: okaidia,
  solarizedDark: solarizedDark,
  solarizedLight: solarizedLight,
  tokyoNight: tokyoNight,
  vscodeDark: vscodeDark,
  vscodeLight: vscodeLight
};

// Helper function to safely get theme extensions
export const getThemeExtension = (themeName: string) => {
  try {
    const theme = themeMap[themeName];
    if (!theme) {
      console.warn(`Theme '${themeName}' not found in themeMap, available themes:`, Object.keys(themeMap));
      return themeMap.basicDark;
    }
    
    return theme;
  } catch (error) {
    console.error(`Error accessing theme '${themeName}':`, error);
    return themeMap.basicDark;
  }
};

// Helper to format theme names for display
export const formatThemeName = (name: string) => {
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
};