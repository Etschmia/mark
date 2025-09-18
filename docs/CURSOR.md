# CURSOR.md - AI Assistant Quick Reference

> **Purpose:** Quick orientation for AI assistants working on this markdown-editor-pro project

## 🎯 Project Overview

**Markdown Editor Pro** - Ein browser-basierter Markdown-Editor mit CodeMirror 6, GitHub-Integration und PWA-Funktionalität.

**Tech Stack:** React 19.1.1 + TypeScript 5.8.2 + Vite 7.0.6 + CodeMirror 6

## 🏗️ Core Architecture

### Main Components
- **App.tsx** - Hauptkomponente mit State Management
- **components/Editor.tsx** - CodeMirror 6 Integration mit Theme-Support
- **components/Preview.tsx** - Live Markdown Rendering
- **components/Toolbar.tsx** - UI Controls
- **components/SettingsModal.tsx** - Benutzereinstellungen
- **components/StatusBar.tsx** - Status Info + CodeMirror Theme Selector

### Key Features
- ✅ CodeMirror 6 mit 30+ Themes
- ✅ GitHub Integration (OAuth, Repository Browse, File Operations)
- ✅ Multi-Tab Interface
- ✅ Export (HTML, PDF)
- ✅ PWA mit Offline-Support
- ✅ Keyboard Shortcuts (30+)
- ✅ Search & Replace
- ✅ Settings Modal (Theme, Font Size, Line Numbers, etc.)

## 🐛 Known Issues & Recent Fixes

### Current Bug (Theme Switch)
**Problem:** Screen wird blank beim Theme-Wechsel
**Error:** `Unrecognized extension value in extension set` - CodeMirror Extension Conflict
**Location:** Theme switching in Editor.tsx
**Status:** 🔴 Active Bug

### Recent Fixes
- ✅ Tab Isolation Bug (BUGFIX-TAB-ISOLATION.md)
- ✅ Cache Update Solution (CACHE-UPDATE-SOLUTION.md)
- ✅ About Modal Implementation (ABOUT-MODAL-IMPLEMENTATION.md)

## 🔧 Development Patterns

### Adding Features
1. **New Format:** Add to `types.ts` → Handler in `App.tsx` → Button in `Toolbar.tsx`
2. **New Theme:** Install package → Import in `Editor.tsx` → Add to mapping → Update Vite config
3. **New Modal:** Create component → Add to App.tsx state → Add trigger button

### State Management
- React hooks only (no external state library)
- Central state in App.tsx
- LocalStorage sync for persistence
- Debounced history (500ms)

### File Operations
- File System Access API (modern) + legacy fallback
- GitHub integration via @octokit/rest
- Export via jsPDF + html2canvas

## 📁 Key Files to Know

### Core Files
- `App.tsx` - Main application logic
- `components/Editor.tsx` - CodeMirror integration
- `types.ts` - TypeScript definitions
- `vite.config.ts` - Build configuration with manualChunks

### Documentation
- `README.md` - Project overview
- `GEMINI.md` - Technical documentation
- `QODER-MEMO.md` - Development reference
- `IDEEN.md` - Feature ideas and status

### Test Files
- `components/__tests__/` - Component tests
- `utils/__tests__/` - Utility tests
- `test-*.html/js/md` - Manual test files

## 🚀 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test
```

## 🎯 Current Focus

**Active Bug:** Theme Switch causing blank screen with CodeMirror extension conflict
**Next Steps:** Analyze Editor.tsx theme switching logic and fix extension handling

## 📝 Notes for AI Assistants

- Always respond in German (user rule)
- Use semantic search to understand codebase
- Check existing documentation before implementing
- Follow established patterns for consistency
- Test changes thoroughly before marking complete
