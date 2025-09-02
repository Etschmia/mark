# Gemini Project Overview: Markdown Editor Pro

This document provides a brief overview of the project structure, key components, and important files to help with understanding and navigating the codebase.

## Project Description

This is a web-based Markdown editor built with React and TypeScript, using Vite as the build tool. It features real-time syntax highlighting in the editor, a live preview panel, a formatting toolbar, and file system integration for opening and saving markdown files.

## Core Technologies

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Editor:** CodeMirror 6 (advanced code editor with syntax highlighting)
- **Styling:** Tailwind CSS (inferred from class names like `flex`, `h-screen`, `bg-slate-900`)
- **Markdown Parsing:** `marked.js` (loaded via CDN in `index.html`)
- **HTML Sanitization:** `DOMPurify` (loaded via CDN in `index.html`)
- **Syntax Highlighting:** `highlight.js` (loaded via CDN in `index.html`) for preview pane
- **Language Support:** JavaScript, SQL, Python, PHP, XML for code blocks

## Key Files and Components

### `index.tsx`
The main entry point of the application. It renders the root `App` component into the DOM.

### `App.tsx`
This is the main component that orchestrates the entire application. It holds the primary state and logic for:
- The markdown content (`markdown` state).
- The current file name (`fileName` state).
- Undo/redo history (`history` and `historyIndex` states).
- File operations (new, open, save) using the modern File System Access API with a legacy fallback.
- Applying markdown formatting to the editor's text.
- Managing the resizable layout between the editor and preview panes.
- Theme selection for the preview panel.

### `components/`

- **`Editor.tsx`**: A CodeMirror 6-based editor component that provides real-time Markdown syntax highlighting and advanced text editing features.
  - Uses CodeMirror 6 for enhanced editing experience with syntax highlighting.
  - Supports language-specific highlighting for fenced code blocks (JavaScript, SQL, Python, PHP, XML).
  - Provides a custom interface (`EditorRef`) for text manipulation, selection control, and focus management.
  - Integrates with the dark theme and custom styling for consistent UI appearance.

- **`Preview.tsx`**: This component is responsible for rendering the HTML preview of the markdown content.
  - It uses `marked.js` to parse the markdown into HTML.
  - It uses `DOMPurify` to sanitize the generated HTML, preventing XSS attacks.
  - It integrates `highlight.js` for syntax highlighting within code blocks.
  - It dynamically applies different CSS themes for the preview content.

- **`Toolbar.tsx`**: The main toolbar providing UI buttons for all user actions.
  - **Formatting:** Buttons for bold, italic, headers, lists, code blocks, etc.
  - **File Actions:** Buttons for New, Open, and Save.
  - **Undo:** A button to revert to the previous state.
  - **Theme Selector:** A dropdown to change the preview panel's theme.
  - **File Name Input:** An input field to change the name of the file being edited.

- **`icons/Icons.tsx`**: Contains all the SVG icon components used in the `Toolbar`.

- **`preview-themes.ts`**: A TypeScript file exporting CSS styles as template literals for different preview themes.

### `types.ts`
Defines shared TypeScript types used across the application, such as `FormatType`, which enumerates all possible formatting actions.

## How to Run the Application

1.  Install dependencies: `npm install`
2.  Start the development server: `npm run dev`
3.  Build for production: `npm run build`
