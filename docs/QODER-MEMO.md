# QODER-MEMO.md - Project Quick Reference

> **Purpose:** Quick orientation for Qoder AI assistant on markdown-editor-pro project state

## 🎯 Project Status (Current)

**Completed Features from IDEEN.md:**
- ✅ #1: CodeMirror 6 integration with syntax highlighting
- ✅ #2: Complete keyboard shortcuts + help system
- ✅ #3: Line numbers toggle in settings (fully implemented)
- ✅ #6: Search and replace functionality
- ✅ #8: Export functions (HTML, PDF)
- ✅ #10: Editor themes (light/dark mode for entire UI)
- ✅ #11: LocalStorage persistence
- ✅ #13: Settings modal (font size, theme, debounce time, line numbers, auto-save)
- ✅ #14: Markdown cheat sheet in help dropdown
- ✅ #16: NPM dependency management
- ✅ **NEW: GitHub Integration** - Complete GitHub connectivity with OAuth, repository browsing, file loading, and enhanced save options
- ✅ **NEW: CodeMirror Themes** - 30+ editor themes with selector in status bar
- ✅ **NEW: Toolbar Restructuring** - Moved GitHub and Install buttons to help dropdown menu

**Architecture:** React 19.1.1 + TypeScript 5.8.2 + Vite 7.0.6 + CodeMirror 6 + GitHub API Integration

## 🏗️ Key Technical Decisions

### Editor Implementation
- **CodeMirror 6** with real-time Markdown syntax highlighting
- **Custom keyboard shortcuts** for all 25+ formatting operations
- **Search/replace** via @codemirror/search
- **Multi-language support** for code blocks
- **30+ CodeMirror Themes** with selector in status bar

### File Management
- **File System Access API** (modern browsers) + legacy fallback
- **LocalStorage persistence** for auto-save
- **Export capabilities**: Markdown, HTML, PDF
- **GitHub Integration**: OAuth authentication, repository browsing, direct file operations

## 🚀 Recent Enhancements

### Toolbar Restructuring
- **Help Button Renamed**: Changed from "?" to "Extras" for better clarity
- **Menu Consolidation**: Moved "Connect with GitHub" and "Install App" buttons into the help dropdown menu
- **Improved Organization**: Buttons now appear between "Update" and "Über diese App" in the dropdown

### CodeMirror Themes Feature
- **30+ Themes**: Added support for popular CodeMirror themes from @uiw/codemirror-themes
- **Theme Selector**: Dropdown in editor status bar for real-time theme switching
- **Bundle Optimization**: Vite manualChunks configuration for efficient code splitting
- **Dynamic Loading**: Themes loaded on-demand to reduce initial bundle size

## 📁 Project Structure

### Core Modules:
- **components/**: UI components including:
  - Editor.tsx (CodeMirror 6 integration with theme support)
  - Preview.tsx (Live markdown preview)
  - Toolbar.tsx (Main toolbar with controls)
  - Modal components (Help, CheatSheet, GitHub integration)
- **utils/**: Utility functions including:
  - exportUtils.ts (HTML/PDF export)
  - githubService.ts (GitHub API integration)
  - pwaManager.ts (Progressive Web App functionality)
  - tabManager.ts (Multi-tab management)
- **public/**: Static assets including:
  - manifest.json (PWA configuration)
  - sw.js (Service worker)
- **scripts/**: Build scripts including:
  - generateBuildInfo.mjs
  - updateServiceWorkerVersion.mjs
- **types.ts**: TypeScript type definitions
- **App.tsx**: Main application component
- **index.tsx**: Application entry point
- **vite.config.ts**: Vite configuration with manualChunks optimization

## 🔧 Dependencies Strategy

**Core Stack:**
- React 19.1.1, TypeScript 5.8.2, Vite 7.0.6
- CodeMirror 6 (multiple packages)
- marked 16.2.1, DOMPurify 3.2.6, highlight.js 11.11.1
- jsPDF + html2canvas for PDF export
- @octokit/rest, @octokit/auth-oauth-device, js-base64 for GitHub integration
- @uiw/codemirror-themes for 30+ editor themes

**Pattern:** All via NPM (no CDN), ES modules, strict versioning

## 🎨 Design Patterns

### State Management
- React hooks (no external state library)
- Central state in App.tsx
- LocalStorage sync
- Debounced history (500ms)

### Component Communication
- Props down, callbacks up
- Ref forwarding for editor control
- Event-driven formatting

### Dropdown Pattern
- Code languages, Export formats, Help options
- Click-outside-to-close
- Consistent styling

## 🚀 Extension Patterns

### Adding New Format
1. Add to `types.ts` FormatType
2. Handler in `App.tsx` handleFormat
3. Button in `Toolbar.tsx`

### Adding New Theme
1. Install theme package from @uiw/codemirror-themes
2. Import in `Editor.tsx`
3. Add to `codemirrorThemes` mapping
4. Add to theme selector in `App.tsx`
5. Update Vite config manualChunks

## 📚 Documentation

### Core Documentation Files:
- **README.md** - Project overview, features, quick start
- **GEMINI.md** - Technical documentation, architecture, implementation details
- **IDEEN.md** - Original feature ideas and implementation status
- **TASK-6-IMPLEMENTATION-SUMMARY.md** - Search and replace implementation
- **DYNAMIC-IMPORTS-IMPLEMENTATION.md** - Bundle optimization strategy
- **BUGFIX-SUMMARY.md** - Key bug fixes and solutions
- **KEYBOARD-SHORTCUTS-DOCUMENTATION-UPDATE.md** - Keyboard shortcuts reference
- **QODER-MEMO.md** - This file - Quick reference for AI assistants

### Help System:
- **HelpModal.tsx** - Complete keyboard shortcuts reference
- **CheatSheetModal.tsx** - Markdown syntax quick reference

## 🧪 Testing

### Unit Tests:
- **components/__tests__/** - Component tests
- **utils/__tests__/** - Utility function tests

### Manual Testing:
- **test-*.html/js/md** - Test files for specific features
- Browser testing across Chrome, Firefox, Safari

## 🎯 Future Development Ideas

### High Priority:
1. Enhanced GitHub integration with branch management
2. Collaborative editing features
3. Plugin system for custom extensions
4. Advanced markdown features (Mermaid diagrams, KaTeX math)

### Medium Priority:
1. Mobile optimization
2. Additional export formats
3. Template system
4. Snippet library

### Low Priority:
1. Custom theme creation
2. Advanced search features
3. Integration with other cloud services