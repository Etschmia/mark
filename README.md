# Run and deploy markdown editor pro

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    `npm install`

2.  Run the app:
    `npm run dev`

## Technologies Used

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A build tool that aims to provide a faster and leaner development experience for modern web projects.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **CodeMirror 6:** Advanced code editor with syntax highlighting for enhanced Markdown editing experience.
*   **highlight.js:** Syntax highlighting for code blocks in the preview pane.

## Project Structure

*   `index.html`: The main HTML file.
*   `components/`: Contains the React components.
    *   `Editor.tsx`: The CodeMirror-based markdown editor component with syntax highlighting.
    *   `Preview.tsx`: The preview component.
    *   `Toolbar.tsx`: The toolbar with markdown formatting buttons.
    *   `icons/Icons.tsx`: The icons for the toolbar.
*   `App.tsx`: The main application component.
*   `index.tsx`: The entry point of the application.

## About the Project

This project is a browser-based markdown editor with real-time syntax highlighting, a live preview window, and icons for all common markdown formatting options. It was developed with the help of AIStudio.

### Key Features

*   **Real-time Markdown syntax highlighting** in the editor using CodeMirror 6
*   **Live preview** with syntax highlighting for code blocks
*   **No registration required** - uses local file system for saving and loading
*   **Language support** for code blocks (JavaScript, SQL, Python, PHP, XML)
*   **Intuitive toolbar** with formatting buttons for common Markdown syntax
*   **Split-view interface** with resizable panels
*   **Modern dark theme** optimized for extended writing sessions
*   **Privacy-focused** - all data stays on your device

A version for testing is available here: https://mark-alpha-five.vercel.app/

The project's homepage can be found here: https://github.com/Etschmia/mark
