# Markdown Editor Pro

A powerful, lightweight, browser-based Markdown editor designed for simplicity, privacy, and productivity. Features real-time syntax highlighting, live preview, comprehensive keyboard shortcuts, advanced export capabilities, and seamless GitHub integration.

## ✨ Key Features

### 🎯 **Core Editing**
- **CodeMirror 6 Integration** - Professional-grade editor with real-time Markdown syntax highlighting
- **Live Preview** - Instant HTML rendering with synchronized scrolling
- **Split-View Interface** - Resizable panels for optimal workflow
- **Dark Theme** - Eye-friendly design for extended writing sessions

### 🐙 **GitHub Integration** (NEW!)
- **Seamless GitHub Connection** - Connect with GitHub via secure OAuth Device Flow
- **Repository Browser** - Browse all your repositories with search and filtering
- **Direct File Loading** - Load Markdown files directly from GitHub repositories
- **Enhanced Save Options** - Save locally or commit directly to GitHub with custom commit messages
- **Branch Support** - Work with files across different branches
- **Persistent Authentication** - Stay connected across browser sessions
- **Offline Awareness** - Clear indicators when GitHub features are unavailable

### 🗏️ **Productivity Features**
- **Complete Keyboard Shortcuts** - Full shortcut support for all formatting options (25+ shortcuts)
- **Search and Replace** - Powerful find/replace with regex support and highlighting
- **Undo/Redo System** - Comprehensive history management with configurable debounce time
- **Auto-Save to LocalStorage** - Never lose your work with persistent content and settings
- **Line Numbers** - Optional display with toggle in settings

### 📤 **Export Capabilities**
- **Multiple Export Formats** - Save as Markdown, HTML, or PDF
- **Styled HTML Export** - Complete standalone HTML documents
- **PDF Generation** - Professional PDF output with proper formatting

### 🛠️ **Advanced Tools**
- **Complete Theme System** - Light/dark mode for entire interface with immediate switching
- **Comprehensive Settings Modal** - Customize font size (10-24px), theme, debounce time (100-2000ms), line numbers, and auto-save
- **Progressive Web App (PWA)** - Install as native app with offline functionality and custom icons
- **Interactive Help System** - Keyboard shortcuts reference and Markdown cheat sheet in dropdown
- **Code Syntax Highlighting** - Support for 12+ programming languages in preview
- **File System Integration** - Modern File System Access API with legacy fallback
- **Persistent Storage** - All settings, content, and filename automatically saved to localStorage
- **Offline Support** - Continue working without internet connection with automatic sync

### 🎨 **User Experience**
- **Complete Theme System** - Full light/dark mode for entire interface with persistent settings
- **Progressive Web App** - Install as native app, works offline, with app shortcuts and notifications
- **Comprehensive Settings Modal** - Font size, debounce time, line numbers, auto-save preferences
- **No Registration Required** - Complete privacy, no cloud dependencies
- **Responsive Design** - Works perfectly on desktop and mobile
- **Intuitive Toolbar** - Visual buttons for all formatting options
- **Multiple Preview Themes** - Customizable preview styling with persistent selection
- **Offline Indicator** - Clear status when working without internet connection

## 🚀 Quick Start

**Prerequisites:** Node.js (v16 or higher)

```bash
# Clone and install
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Keyboard Shortcuts

### Text Formatting
- `Ctrl/Cmd + B` - **Bold**
- `Ctrl/Cmd + I` - *Italic*
- `Ctrl/Cmd + D` - ~~Strikethrough~~
- `Ctrl/Cmd + E` - `Code`

### Headers
- `Ctrl/Cmd + 1` - # Header 1
- `Ctrl/Cmd + 2` - ## Header 2
- `Ctrl/Cmd + 3` - ### Header 3

### Lists & Structure
- `Ctrl/Cmd + U` - Unordered list
- `Ctrl/Cmd + O` - Ordered list
- `Ctrl/Cmd + Shift + C` - Checklist
- `Ctrl/Cmd + Q` - Blockquote
- `Ctrl/Cmd + T` - Table

### Editor Functions
- `Ctrl/Cmd + F` - Search and replace
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + K` - Insert link
- `Ctrl/Cmd + M` - Insert image

### File Operations
- `Ctrl/Cmd + N` - New document
- `Ctrl/Cmd + S` - Save
- `Ctrl/Cmd + Shift + S` - Save as
- `Ctrl/Cmd + Shift + O` - Open file

## 🏗️ Technology Stack

### Core Technologies
- **React 19.1.1** - Modern UI framework with latest features
- **TypeScript 5.8.2** - Type-safe development
- **Vite 7.0.6** - Lightning-fast build tool and dev server

### GitHub Integration
- **@octokit/rest** - Official GitHub REST API client
- **@octokit/auth-oauth-device** - Secure OAuth Device Flow authentication
- **js-base64** - Base64 encoding for GitHub file operations

### Editor & Parsing
- **CodeMirror 6** - Professional code editor with syntax highlighting
- **@codemirror/search** - Advanced search and replace functionality
- **marked 16.2.1** - Fast, standards-compliant Markdown parser
- **DOMPurify 3.2.6** - XSS protection for HTML sanitization

### Syntax Highlighting
- **highlight.js 11.11.1** - Syntax highlighting for code blocks
- **Languages supported**: JavaScript, Python, SQL, PHP, XML, HTML, CSS, JSON, YAML, TypeScript, Bash, Markdown

### Export & Utilities
- **jsPDF** - Client-side PDF generation
- **html2canvas** - HTML to canvas rendering for PDF export
- **File System Access API** - Modern file operations (with legacy fallback)

## 📁 Project Structure

```
markdown-editor-pro/
├── components/
│   ├── icons/
│   │   └── Icons.tsx           # SVG icon components
│   ├── Editor.tsx              # CodeMirror-based editor
│   ├── Preview.tsx             # Live markdown preview
│   ├── Toolbar.tsx             # Main toolbar with all controls
│   ├── HelpModal.tsx           # Comprehensive help system
│   ├── CheatSheetModal.tsx     # Markdown syntax reference
│   ├── GitHubButton.tsx        # GitHub connection button
│   ├── GitHubModal.tsx         # Repository and file browser
│   ├── SaveOptionsModal.tsx    # Local vs GitHub save options
│   └── preview-themes.ts       # Preview styling themes
├── utils/
│   ├── exportUtils.ts          # HTML/PDF export functionality
│   └── githubService.ts        # GitHub API integration
├── App.tsx                     # Main application component
├── index.tsx                   # Application entry point
├── types.ts                    # TypeScript type definitions
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies and scripts
```

## 🎯 Core Components

### `Editor.tsx`
- CodeMirror 6 integration with Markdown syntax highlighting
- Custom keyboard shortcuts for all formatting operations
- Search and replace functionality
- Real-time content synchronization

### `Preview.tsx`
- Live HTML rendering with marked.js
- Syntax highlighting for code blocks
- Multiple theme support
- Sanitized output with DOMPurify

### `Toolbar.tsx`
- Complete formatting controls
- File operations (New, Open, Save, Export)
- GitHub integration button
- Help system dropdown
- Theme selection

### `GitHubButton.tsx`
- GitHub connection status display
- OAuth authentication management
- Repository browsing trigger
- User profile information

### `GitHubModal.tsx`
- Repository search and filtering
- File system navigation
- Markdown file selection
- Branch and path management

### `SaveOptionsModal.tsx`
- Local vs GitHub save choice
- Commit message composition
- Change detection display
- Permission validation

### `HelpModal.tsx`
- Complete keyboard shortcuts reference
- Toolbar functionality explanations
- GitHub integration guide
- Organized by categories
- Always up-to-date with current features

### `CheatSheetModal.tsx`
- Quick Markdown syntax reference
- Copy-paste ready examples
- 8 organized categories
- Visual syntax examples

## 🔧 Development

### Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Dependencies Management
All external libraries are managed via NPM (not CDN) for better version control and offline development.

### Browser Support
- **Modern browsers** with File System Access API support
- **Legacy fallback** for older browsers using download/upload patterns
- **Responsive design** works on desktop and mobile

## 🌐 Demo & Deployment

**Live Demo:** [https://mark-alpha-five.vercel.app/](https://mark-alpha-five.vercel.app/)

**GitHub Repository:** [https://github.com/Etschmia/mark](https://github.com/Etschmia/mark)

### Deployment Options
- **Vercel** (current)
- **Netlify**
- **GitHub Pages**
- Any static hosting service

## 🔐 Privacy & Security

- **No registration required** - Complete privacy
- **Local storage only** - Data never leaves your browser
- **No cloud dependencies** - Works completely offline
- **XSS protection** - All HTML output sanitized
- **Modern security practices** - Content Security Policy compliant

## 📄 License

This project emphasizes privacy and accessibility by eliminating the need for user registration or cloud storage, making it ideal for users who value data privacy and offline functionality.

---

*Built with ❤️ for writers, developers, and documentation enthusiasts.*
