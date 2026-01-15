# Theme System Refactoring (January 2026)

## Overview
This document details the refactoring of the application's theming system. The goal was to replace the fragmented "theme bundle" logic with a unified, single-source-of-truth system that consistently applies styles across the Editor (CodeMirror), the Preview pane, and the Application GUI.

## New Architecture

### 1. Unified Theme Registry (`utils/appThemes.ts`)
We introduced a central registry for all application themes. Each theme implements the `AppTheme` interface and defines:
*   **Metadata**: `id`, `name`, `type` (light/dark).
*   **CodeMirror Theme**: Direct reference to the CodeMirror extension (e.g., `oneDark`, `dracula`).
*   **Preview Theme**: The specific CSS class/style for the markdown preview.
*   **Colors**: A semantic palette for the GUI (backgrounds, text, borders, accents).

### 2. Dynamic CSS Variables (`hooks/useAppTheme.ts`)
A new hook, `useAppTheme`, manages the active theme state. Crucially, it **injects the active theme's colors as CSS variables** into the document root.
*   `--app-bg-main`: Main application background.
*   --app-text-main`: Primary text color.
*   `--app-border`: Standard border color.
*   ...and others for accents, panels, inputs, etc.

### 3. CSS-Variable Utility Classes (`index.css`)
Tailwind-like utility classes are defined in `@layer utilities` that map directly to these CSS variables.
*   `.bg-app-main` -> `background-color: var(--app-bg-main)`
*   `.text-app-muted` -> `color: var(--app-text-muted)`

This allows UI components to simple use `className="bg-app-main"` and automatically adapt to *any* selected theme, without needing complex conditional logic or "presets".

## Component Updates

*   **App.tsx**: Removed legacy `useThemeBundle` and `AppearanceModal` code. Now uses `useAppTheme` to provide the unified `currentTheme` object to children.
*   **Toolbar.tsx & StatusBar.tsx**: Refactored to use the new CSS-variable-based classes. Removed dependency on `UIColorPreset` and `darkModeClasses`.
*   **SettingsModal.tsx**: Simplified the "Appearance" section. Users now select a single "Theme" (e.g., "Dracula", "Nord", "GitHub Light"), and the entire app updates instantly.
*   **Editor.tsx**: Updated to accept a direct `Extension` for the theme, removing the need for string-based lookups inside the component.

## Removed Legacy Files
The following files were removed as they are now obsolete:
*   `components/AppearanceModal.tsx`: The old, complex theme mixer.
*   `hooks/useThemeBundle.ts`: The old logic for linking editor/preview/ui themes.
*   `utils/themeBundles.ts`: The old bundle definitions.

## Adding New Themes
To add a new theme:
1.  Import the CodeMirror theme extension in `utils/appThemes.ts`.
2.  Add a new `AppTheme` object to the `appThemes` array.
3.  Define the semantic colors for the GUI.
4.  The new theme will automatically appear in settings and work across the app.
