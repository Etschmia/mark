# GEMINI Technical Documentation: Markdown Editor Pro

This document provides comprehensive technical details about the project architecture, core technologies, component implementations, and architectural decisions for developer reference.

## 🏗️ System Architecture

### Overall Architecture
**Pattern:** Client-side Single Page Application (SPA)  
**Framework:** React 19.1.1 with TypeScript 5.8.2  
**Build System:** Vite 7.0.6  
**State Management:** React hooks (useState, useRef, useCallback, useEffect)  
**Styling:** Tailwind CSS utility classes  

### Architectural Principles
- **Component-Based Architecture** - Modular React components with clear separation of concerns
- **Unidirectional Data Flow** - State flows from App.tsx to child components
- **Client-Side File Handling** - Browser File System Access API with legacy fallback
- **No Backend Dependencies** - Complete client-side operation for privacy
- **Progressive Enhancement** - Modern APIs with graceful degradation

## 🔧 Core Technologies

### Editor Implementation
**CodeMirror 6** - Professional code editor framework
- **Packages Used:**
  - `codemirror@6.0.2` - Core editor
  - `@codemirror/state@6.5.2` - State management
  - `@codemirror/view@6.38.2` - View layer
  - `@codemirror/commands@6.8.1` - Command system
  - `@codemirror/search@6.5.11` - Search/replace functionality
  - `@codemirror/theme-one-dark@6.1.3` - Dark theme
  
- **Language Support:**
  - `@codemirror/lang-markdown@6.3.4` - Markdown syntax highlighting
  - `@codemirror/lang-javascript@6.2.4` - JavaScript support
  - `@codemirror/lang-sql@6.9.1` - SQL support
  - `@codemirror/lang-python@6.2.1` - Python support
  - `@codemirror/lang-php@6.0.2` - PHP support
  - `@codemirror/lang-xml@6.1.0` - XML/HTML support

- **Themes Support:**
  - `@uiw/codemirror-themes-all@4.25.1` - Collection of 30+ editor themes
  - Dynamic theme switching with real-time preview
  - Theme selector in editor status bar

### Markdown Processing
**marked.js** - Fast Markdown parser
- **Version:** 16.2.1
- **Features:** GitHub Flavored Markdown support
- **Security:** DOMPurify sanitization for XSS prevention

### Syntax Highlighting
**highlight.js** - Code syntax highlighting
- **Version:** 11.11.1
- **Languages:** 12+ programming languages
- **Integration:** Preview rendering only (CodeMirror handles editor highlighting)

### Export Functionality
**jsPDF** - Client-side PDF generation
- **Version:** 3.0.2
- **Features:** High-quality PDF output

**html2canvas** - HTML to canvas rendering
- **Version:** 1.4.1
- **Features:** Visual fidelity for HTML exports

### GitHub Integration
**@octokit/rest** - GitHub API client
- **Version:** 22.0.0
- **Features:** Repository browsing, file operations

**@octokit/auth-oauth-device** - OAuth device flow
- **Features:** Secure authentication without server

## 🎯 Core Components

### `components/Editor.tsx` - CodeMirror Integration
**Implementation Details:**
- CodeMirror 6 with custom configuration
- Real-time Markdown syntax highlighting
- Comprehensive keyboard shortcuts (25+ shortcuts)
- Search and replace functionality
- **Theme-aware rendering** (light/dark mode)
- **Configurable font size** from settings
- **Optional line numbers** toggle
- **30+ CodeMirror themes** with dynamic loading
- Custom theme integration

**Theme System:**
- Dynamic theme switching without restart
- Light/dark mode for entire editor
- Theme-aware search panel styling
- Conditional extension loading (oneDark for dark mode)
- Settings-driven configuration
- **30+ themes** from @uiw/codemirror-themes collection

**Key Features:**
```typescript
interface EditorRef {
  focus: () => void;
  getSelection: () => { start: number; end: number };
  setSelection: (start: number, end: number) => void;
  getValue: () => string;
  insertText: (text: string, start?: number, end?: number) => void;
  openSearchPanel: () => void;
}
```

**Keyboard Shortcuts Implementation:**
- Custom keymap for all formatting operations
- Mod key support (Ctrl on Windows/Linux, Cmd on Mac)
- File operation shortcuts integrated
- Search panel shortcuts

### `components/Preview.tsx` - Markdown Rendering
**Implementation Details:**
- Asynchronous markdown parsing with marked.js
- XSS prevention with DOMPurify
- Syntax highlighting with highlight.js
- Multiple preview themes
- Live rendering with debounced updates
- Scroll synchronization with editor

**Processing Pipeline:**
1. Markdown → marked.js → Raw HTML
2. Raw HTML → DOMPurify → Sanitized HTML
3. Sanitized HTML → highlight.js → Highlighted HTML
4. Highlighted HTML → DOM → Rendered Preview

**Performance Optimizations:**
- Asynchronous markdown parsing
- Debounced updates
- Efficient re-rendering with React

**Theme System:**
- Multiple preview themes
- CSS-in-JS theme definitions
- Dynamic theme switching
- Print-optimized styles

### `components/Toolbar.tsx` - User Interface Controls
**Control Categories:**
- **Text Formatting:** Bold, Italic, Strikethrough, Code
- **Headers:** H1, H2, H3 with visual hierarchy
- **Lists:** Unordered, Ordered, Checklists
- **Structure:** Blockquotes, Tables, Links, Images
- **Tools:** Search, Undo, Export, Help, **Settings**
- **File Operations:** New, Open, Save with modern/legacy support

**Dropdown Systems:**
- Code language selector
- Export format options (HTML, PDF)
- Help system (Full help, Cheat sheet, **Settings**)
- Theme selection

### `components/HelpModal.tsx` - Documentation System
**Content Organization:**
- Keyboard shortcuts by category
- Toolbar reference with descriptions
- Visual examples and tips
- Always up-to-date with current features

**Features:**
- Responsive grid layout
- Keyboard navigation (Escape to close)
- Dark theme integration
- Comprehensive shortcut reference

### `components/SettingsModal.tsx` - User Preferences
**Implementation Details:**
- Complete theme switching (light/dark mode for entire UI)
- Font size adjustment (10-24px)
- Debounce time configuration (100-2000ms)
- Auto-save toggle
- Line numbers toggle
- Preview theme selection

**Features:**
```typescript
interface EditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  debounceTime: number;
  previewTheme: string;
  autoSave: boolean;
  showLineNumbers: boolean;
}
```

**Persistence:**
- Settings stored in localStorage
- Immediate application of changes
- Default fallback values
- Error handling for storage failures

### `components/StatusBar.tsx` - Status Information
**Implementation Details:**
- Line/column position display
- Line numbers toggle
- **CodeMirror theme selector**
- Responsive design for all screen sizes

**Features:**
- Real-time cursor position updates
- Theme-aware styling
- **30+ CodeMirror themes** with dropdown selector
- Consistent with overall application theme

### `components/CheatSheetModal.tsx` - Quick Reference
**Content Organization:**
- 8 organized categories of Markdown syntax
- Copy-paste ready examples
- Visual syntax demonstrations
- Supported code languages grid

**Categories:**
- Text Formatting, Headers, Lists, Links & Images
- Code & Syntax, Tables, Quotes, Advanced Features

## 🔧 Technical Implementation Details

### State Management Pattern
**Local State with Hooks:**
- `useState` for component state
- `useRef` for DOM references and mutable values
- `useCallback` for performance optimization
- `useEffect` for side effects and lifecycle management

**Persistence Strategy:**
- LocalStorage for automatic content/filename saving
- File System Access API for explicit file operations
- Graceful fallback handling

### Event Handling Architecture
**Editor Events:**
- Content changes → debounced history updates
- Keyboard shortcuts → format command routing
- Search operations → CodeMirror search integration

**File Operations:**
- Modern API with permission handling
- Legacy fallback with blob downloads
- Error handling and user feedback

### Performance Optimizations
**Rendering:**
- Virtualized lists for tab management
- Memoized components
- Efficient re-rendering
- Code splitting with dynamic imports

**Bundle Size:**
- Vite build optimization
- Manual chunk splitting
- Dynamic imports for heavy dependencies
- Tree shaking

### CodeMirror Themes Implementation
**Dynamic Loading:**
- Individual theme packages for efficient loading
- Vite manualChunks configuration for bundle optimization
- Cache mechanism for loaded themes

**Theme Integration:**
- Extension-based theme system
- Real-time theme switching
- Status bar selector for easy access
- 30+ professionally designed themes

## 🛡️ Security Considerations

### XSS Prevention
- DOMPurify sanitization of all HTML output
- Configurable allowed tags/attributes
- Safe handling of user-generated content

### Content Security
- No external script loading
- Local processing only
- No data transmission

## 🚀 Build and Development

### Vite Configuration
**Development:**
- Hot Module Replacement (HMR)
- TypeScript compilation
- ES module support
- Development server with proxy

**Production Build:**
- Tree shaking for optimal bundle size
- Code splitting
- Asset optimization
- ES2022 target for modern browsers

### TypeScript Configuration
**Compiler Options:**
- Strict mode enabled
- ES2022 target
- ESNext modules
- Path mapping for clean imports

### Dependency Management
**NPM Strategy:**
- All dependencies via package.json
- No CDN dependencies
- Version pinning for stability
- Regular security updates

## 🔄 Data Flow

### Content Updates
1. User types in CodeMirror editor
2. CodeMirror fires update event
3. `Editor.tsx` calls `onChange`
4. `App.tsx` updates markdown state
5. `App.tsx` persists to localStorage
6. `Preview.tsx` re-renders with new content
7. Debounced history update after 500ms

### Format Commands
1. User clicks toolbar button or uses keyboard shortcut
2. `Toolbar.tsx` or `Editor.tsx` calls `onFormat`
3. `App.tsx` routes to appropriate handler
4. Handler manipulates editor content via `EditorRef`
5. Content update flow continues as above

### File Operations
1. User initiates file operation
2. Modern API attempted first
3. Legacy fallback if needed
4. File content loaded/saved
5. State updated with new content/filename
6. LocalStorage synchronized

### Theme Changes
1. User selects theme from status bar dropdown
2. `App.tsx` updates `codemirrorTheme` state
3. `Editor.tsx` receives new theme via props
4. CodeMirror extensions recreated with new theme
5. Editor re-renders with new theme applied