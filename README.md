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

## Project Structure

*   `index.html`: The main HTML file.
*   `components/`: Contains the React components.
    *   `Editor.tsx`: The markdown editor component.
    *   `Preview.tsx`: The preview component.
    *   `Toolbar.tsx`: The toolbar with markdown formatting buttons.
    *   `icons/Icons.tsx`: The icons for the toolbar.
*   `App.tsx`: The main application component.
*   `index.tsx`: The entry point of the application.

## About the Project

This project is a browser-based markdown editor with a preview window and icons for all common markdown formatting options. It was developed with the help of AIStudio.

A special feature of this editor is that it does not require any registration or user accounts. It uses the local file system of the user to save and load files.

A version for testing is available here: https://mark-alpha-five.vercel.app/

The project's homepage can be found here: https://github.com/Etschmia/mark
