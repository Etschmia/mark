import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tauri expects a fixed port, fail if that port is not available
const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined;

export default defineConfig({
  // Prevent vite from obscuring Rust errors in tauri dev
  clearScreen: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  plugins: [
    tailwindcss(),
  ],
  // Tauri env variables start with TAURI_
  envPrefix: ['VITE_', 'TAURI_'],
  server: {
    // Tauri expects a fixed port; fail if not available
    strictPort: isTauri,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) erfordert manualChunks als Funktion
        manualChunks(id) {
          // All CodeMirror packages in one chunk to avoid multiple instances
          if (id.includes('@codemirror/') || id.includes('@uiw/codemirror')) {
            return 'codemirror-all';
          }
          // Markdown processing
          if (id.includes('/marked/') || id.includes('/dompurify/') || id.includes('DOMPurify')) {
            return 'markdown-processing';
          }
          // Syntax highlighting
          if (id.includes('highlight.js')) {
            return 'syntax-highlighting';
          }
          // Export functionality (heavy libraries)
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'export-libs';
          }
          // GitHub integration
          if (id.includes('@octokit/') || id.includes('js-base64')) {
            return 'github-integration';
          }
          // React vendor
          if (id.includes('react-dom') || id.includes('react/')) {
            return 'react-vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  preview: {
    allowedHosts: [
      'mark.martuni.de',
      'editmd.vercel.app'
    ]
  }
});
