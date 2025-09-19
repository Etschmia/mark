import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // All CodeMirror packages in one chunk to avoid multiple instances
          'codemirror-all': [
            '@codemirror/view',
            '@codemirror/state',
            '@codemirror/commands',
            '@codemirror/autocomplete',
            '@codemirror/search',
            '@codemirror/lang-markdown',
            '@codemirror/lang-javascript',
            '@codemirror/lang-sql',
            '@codemirror/lang-python',
            '@codemirror/lang-php',
            '@codemirror/lang-xml',
            '@codemirror/theme-one-dark',
            '@uiw/codemirror-themes-all'
          ],
          // Markdown processing
          'markdown-processing': [
            'marked',
            'dompurify'
          ],
          // Syntax highlighting
          'syntax-highlighting': [
            'highlight.js'
          ],
          // Export functionality (heavy libraries)
          'export-libs': [
            'jspdf',
            'html2canvas'
          ],
          // GitHub integration
          'github-integration': [
            '@octokit/rest',
            'js-base64'
          ],
          // React vendor
          'react-vendor': [
            'react',
            'react-dom'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
