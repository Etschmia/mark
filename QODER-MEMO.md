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

**Architecture:** React 19.1.1 + TypeScript 5.8.2 + Vite 7.0.6 + CodeMirror 6 + GitHub API Integration

## 🏗️ Key Technical Decisions

### Editor Implementation
- **CodeMirror 6** with real-time Markdown syntax highlighting
- **Custom keyboard shortcuts** for all 25+ formatting operations
- **Search/replace** via @codemirror/search
- **Multi-language support** for code blocks

### File Management
- **File System Access API** (modern browsers) + legacy fallback
- **LocalStorage persistence** for auto-save
- **Export capabilities**: Markdown, HTML, PDF
- **GitHub Integration**: OAuth authentication, repository browsing, direct file operations

### GitHub Integration Architecture
- **OAuth Device Flow** for secure authentication
- **@octokit/rest** for GitHub API operations
- **Persistent token storage** with validation
- **Enhanced save workflow** with commit message support
- **Repository browsing** with search and filtering
- **Markdown file detection** and loading
- **Branch and path navigation** support

### Help System
- **Dropdown approach**: Help button → 2 options
  - 📖 Complete help with shortcuts
  - 📝 Markdown cheat sheet
- **Always current** with features

### UI/UX Patterns
- **Complete theme system** with light/dark mode for entire application
- **Comprehensive settings modal** with font size (10-24px), debounce time (100-2000ms), theme controls, line numbers toggle, auto-save preferences
- **Persistent settings** via localStorage with automatic restoration
- **Compact layout** with gap-2 spacing
- **Resizable panels** for editor/preview
- **Responsive design** for all screens
- **Modal system** rendered at app level for proper z-index (z-[9999])

## 📁 Critical Files

### Core Components
- `App.tsx` - Central state, file ops, format routing, settings management, GitHub integration
- `components/Editor.tsx` - CodeMirror integration + shortcuts + theme support
- `components/Toolbar.tsx` - All UI controls + dropdowns + GitHub button
- `components/HelpModal.tsx` - Complete help system
- `components/CheatSheetModal.tsx` - Quick reference
- `components/SettingsModal.tsx` - Theme and preference controls
- `components/GitHubButton.tsx` - GitHub connection and status display
- `components/GitHubModal.tsx` - Repository and file browser
- `components/SaveOptionsModal.tsx` - Local vs GitHub save options

### Utilities
- `utils/exportUtils.ts` - HTML/PDF export logic
- `utils/githubService.ts` - GitHub API integration and authentication
- `components/preview-themes.ts` - Preview styling
- `types.ts` - TypeScript definitions including GitHub types

## 🔧 Dependencies Strategy

**Core Stack:**
- React 19.1.1, TypeScript 5.8.2, Vite 7.0.6
- CodeMirror 6 (multiple packages)
- marked 16.2.1, DOMPurify 3.2.6, highlight.js 11.11.1
- jsPDF + html2canvas for PDF export
- @octokit/rest, @octokit/auth-oauth-device, js-base64 for GitHub integration

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
4. Shortcut in `Editor.tsx`
5. Update help docs

### Adding Export Format
1. Function in `exportUtils.ts`
2. Option in toolbar dropdown
3. Handler in toolbar

### Adding Help Content
1. Update `HelpModal.tsx` categories
2. Update `CheatSheetModal.tsx` if syntax-related
3. Auto-syncs with UI

## 🎯 User Preferences (Memorized)

- **Strikethrough icon**: Capital 'A' with line through it
- **Layout spacing**: Compact with gap-2 around separator
- **Help system**: Dropdown approach (not separate buttons)
- **Dependencies**: NPM over CDN always
- **Documentation**: Keep README.md + GEMINI.md current

## 📋 Remaining IDEEN.md Items

**Not yet implemented:**
- #4: Auto-closing characters
- #5: Word/character counter
- #7: Synchronized scrolling (disabled for CodeMirror compatibility)
- #9: Extended Markdown (Mermaid, KaTeX)
- #12: Tab management
- #15: Progressive Web App
- #17: State management library
- #18: Unit testing

## 🔍 Common Tasks

### Development
```bash
npm run dev    # Start dev server
npm run build  # Production build
```

### Debugging
- Check `get_problems` for TypeScript errors
- Use browser dev tools for runtime issues
- File operations may need permission handling

### Testing
- Manual testing with created .md files
- Test keyboard shortcuts thoroughly
- Verify export functions
- Check help system accuracy

## ⚠️ Known Considerations

- **Vite version conflict** in package.json (prod vs dev)
- **Browser compatibility** varies for File System Access API
- **Bundle size** large (~2.6MB) due to CodeMirror + highlight.js
- **Scroll sync** disabled pending CodeMirror integration

## 🎯 Next Likely Requests

Based on pattern, user may want:
- More IDEEN.md implementations
- UI/UX refinements
- Performance optimizations
- Additional export formats
- Mobile experience improvements

---
*Updated: After implementing complete GitHub integration with OAuth authentication, repository browsing, file operations, and enhanced save workflow*