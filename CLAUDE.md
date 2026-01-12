# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Markdown Editor Pro is a browser-based Markdown editor built with React 19, TypeScript, Vite 7, and Tailwind CSS v4. It features multi-tab editing, live preview, GitHub integration, and PWA support.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server
npm run build        # Production build (includes build-info and SW version update)
npm run build:dev    # Quick build without version scripts
npm run preview      # Preview production build

# Utilities
npm run pwa-validate          # Validate PWA manifest
npm run update-sw-version     # Update service worker cache version
```

## Architecture

### State Management
- **App.tsx** (1100+ lines) is the central orchestrator holding all state
- **TabManager class** (`utils/tabManager.ts`) manages multi-tab state with localStorage persistence
- Custom hooks extract logic from App.tsx: `useTabManager`, `useFormatting`, `useHistoryManager`, `useKeyboardShortcuts`, `useLinter`, `useResizer`, `useScrollSync`, `useSettings`

### Component Structure
```
App.tsx
├── TabBar → Tab, TabContextMenu
├── Editor (CodeMirror 6 wrapper)
├── Preview (marked.js + DOMPurify + highlight.js)
├── Toolbar (formatting, export, settings)
├── StatusBar
├── LinterPanel (optional)
└── Modals (Help, Settings, GitHub, SaveOptions, Frontmatter, etc.)
```

### Data Flow
1. Editor onChange → `setMarkdown` (debounced) → App state
2. App state → marked.js → DOMPurify sanitize → Preview HTML
3. Tab operations sync through TabManager → localStorage persistence
4. File operations use File System Access API (local) or @octokit/rest (GitHub)

### Key Utilities
- `utils/exportUtils.ts` - PDF/DOCX/HTML export with dynamic imports for jsPDF, html2canvas, docx
- `utils/githubService.ts` - GitHub OAuth and file operations via @octokit/rest
- `utils/tabManager.ts` - Class-based tab state management with persistence
- `utils/frontmatterUtils.ts` - YAML frontmatter parsing/generation
- `utils/markdownLinter.ts` - Markdown validation with auto-fix
- `utils/pwaManager.ts` - Service worker registration and PWA lifecycle

### Build Optimization
Vite config splits chunks: `codemirror-all`, `markdown-processing`, `syntax-highlighting`, `export-libs`, `github-integration`, `react-vendor`. Heavy dependencies (jsPDF, @octokit) use dynamic imports.

## Key Types (types.ts)

- **Tab**: id, filename, content, history, historyIndex, editorState, fileSource, fileHandle, unsavedChanges
- **FileSource**: `{type: 'local'|'github', repository?, path?, sha?}`
- **EditorSettings**: theme, fontSize, debounceTime, previewTheme, autoSave, showLineNumbers
- **FormatType**: Union of all formatting operations

## Key APIs

### EditorRef (components/Editor.tsx)
```typescript
interface EditorRef {
  focus: () => void;
  getSelection: () => { start: number; end: number };
  setSelection: (start: number, end: number) => void;
  getValue: () => string;
  setValue: (value: string) => void;
  insertText: (text: string, start?: number, end?: number) => void;
  openSearchPanel: () => void;
}
```

### TabManager API (utils/tabManager.ts)
- `createTab()` - Create new tab
- `closeTab(id)` - Close tab with unsaved changes check
- `switchToTab(id)` - Switch active tab
- `duplicateTab(id)` - Duplicate existing tab
- `updateTabContent(id, content)` - Update tab content
- `getActiveTab()` - Get currently active tab
- `getState()` - Get complete tab manager state

### Frontmatter Utilities (utils/frontmatterUtils.ts)
- `extractFrontmatter(markdown)` - Extract YAML frontmatter
- `hasFrontmatter(markdown)` - Check if markdown has frontmatter
- `removeFrontmatter(markdown)` - Remove frontmatter from markdown
- `combineFrontmatterAndContent(frontmatter, content)` - Combine frontmatter and content

## Processing Pipelines

### Markdown → Preview
```
Markdown → extractFrontmatter → Content without frontmatter
→ marked.js → Raw HTML → DOMPurify.sanitize → Sanitized HTML
→ highlight.js (code blocks) → Final HTML → DOM render
```

### Format Command Flow
```
Toolbar button / Keyboard shortcut → onFormat callback
→ App.tsx handler → EditorRef.insertText/setSelection
→ Content update → localStorage sync → Preview re-render
```

## Technology Stack

- **Editor**: CodeMirror 6 with @uiw/codemirror-themes-all (16 themes)
- **Markdown**: marked 17.x, DOMPurify 3.x, highlight.js 11.x
- **Export**: jsPDF 3.x, html2canvas, docx 9.x
- **GitHub**: @octokit/rest 22.x with OAuth PKCE flow
- **PWA**: Service worker with cache-first strategy, versioned via build scripts

## Important Patterns

- Dynamic imports are used extensively for bundle optimization - export libs and GitHub libs load on-demand
- Each tab maintains independent undo/redo history
- Settings persist to `markdown-editor-settings` localStorage key
- Tabs persist to `markdown-editor-tabs` localStorage key
- Service worker version in `public/sw.js` is updated by build script from `public/build-info.json`
