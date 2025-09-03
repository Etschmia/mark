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

### Markdown Processing
**marked@16.2.1** - Fast, standards-compliant Markdown parser
- Custom renderer for code block highlighting
- GitHub Flavored Markdown (GFM) support
- Break support for line breaks
- Asynchronous parsing for performance

**DOMPurify@3.2.6** - XSS protection
- Sanitizes all HTML output
- Configurable allowed tags and attributes
- Prevents XSS vulnerabilities in markdown content

### Syntax Highlighting
**highlight.js@11.11.1** - Code block syntax highlighting
- **Supported Languages:** JavaScript, SQL, Python, PHP, XML, HTML, CSS, JSON, YAML, TypeScript, Bash, Markdown
- **Theme:** Atom One Dark for consistency
- **Integration:** Custom marked renderer for seamless highlighting

### Export Capabilities
**jsPDF@3.0.2** - Client-side PDF generation
- A4 page format with proper margins
- Multi-page document support
- Professional typography and spacing

**html2canvas@1.4.1** - HTML to canvas rendering
- High-quality document rendering
- Styled content preservation
- Font and layout accuracy

## 📁 Component Architecture

### `App.tsx` - Application Container
**Responsibilities:**
- Central state management (markdown content, filename, history)
- File operations coordination (new, open, save, export)
- Format command routing to editor
- Undo/redo history management
- Panel resizing logic
- LocalStorage persistence

**Key State:**
```typescript
const [markdown, setMarkdown] = useState<string>(persistedState.markdown);
const [fileName, setFileName] = useState<string>(persistedState.fileName);
const [history, setHistory] = useState<string[]>([persistedState.markdown]);
const [historyIndex, setHistoryIndex] = useState(0);
const [isResizing, setIsResizing] = useState(false);
```

**File System Integration:**
- Modern File System Access API for supported browsers
- Legacy download/upload fallback for older browsers
- Automatic file handle management for save operations

### `components/Editor.tsx` - CodeMirror Integration
**Implementation Details:**
- CodeMirror 6 with custom configuration
- Real-time Markdown syntax highlighting
- Comprehensive keyboard shortcuts (25+ shortcuts)
- Search and replace functionality
- Custom theme integration

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
- **Tools:** Search, Undo, Export, Help
- **File Operations:** New, Open, Save with modern/legacy support

**Dropdown Systems:**
- Code language selector
- Export format options (HTML, PDF)
- Help system (Full help, Cheat sheet)
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

### `components/CheatSheetModal.tsx` - Quick Reference
**Content Structure:**
- 8 organized categories of Markdown syntax
- Visual examples with syntax and output
- Copy-paste ready examples
- Supported language reference
- Quick tips and advanced techniques

**Categories:**
1. Text Formatting
2. Headers
3. Lists
4. Links & Images
5. Code Blocks
6. Quotes & Lines
7. Tables
8. Special Characters

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
- React.memo for component optimization
- Debounced markdown processing
- Efficient CodeMirror updates

**Memory Management:**
- Proper cleanup in useEffect
- Event listener removal
- CodeMirror instance destruction

### Security Considerations
**XSS Prevention:**
- DOMPurify sanitization of all HTML
- Configurable allowed tags/attributes
- Safe handling of user-generated content

**Content Security:**
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

## 🛠️ Extension Points

### Adding New Formats
1. Add format type to `types.ts`
2. Implement handler in `App.tsx`
3. Add toolbar button in `Toolbar.tsx`
4. Add keyboard shortcut in `Editor.tsx`
5. Update help documentation

### Adding Export Formats
1. Implement export function in `utils/exportUtils.ts`
2. Add option to export dropdown
3. Handle format selection in toolbar

### Theme System Extension
1. Add theme styles to `preview-themes.ts`
2. Update theme selector in toolbar
3. Test with all content types

## 📊 Performance Metrics

**Bundle Size (Production):**
- Main bundle: ~2.6MB (gzipped: ~837KB)
- Includes all CodeMirror languages and highlight.js
- Optimized for modern browsers

**Runtime Performance:**
- Fast startup with Vite
- Responsive editing with CodeMirror
- Efficient markdown processing
- Smooth preview updates

## 🔍 Development Guidelines

### Code Organization
- Components in `components/` directory
- Utilities in `utils/` directory
- Types in `types.ts`
- Clear separation of concerns

### Naming Conventions
- PascalCase for components
- camelCase for functions and variables
- kebab-case for file names (except components)
- Descriptive, self-documenting names

### Error Handling
- Try-catch for all async operations
- Graceful degradation for missing features
- User-friendly error messages
- Console warnings for development

This documentation should be updated whenever significant architectural changes or new features are added to the project.
