import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // CodeMirror core
          'codemirror-core': [
            '@codemirror/view',
            '@codemirror/state',
            '@codemirror/commands',
            '@codemirror/autocomplete',
            '@codemirror/search'
          ],
          // CodeMirror languages (loaded on demand)
          'codemirror-languages': [
            '@codemirror/lang-markdown',
            '@codemirror/lang-javascript',
            '@codemirror/lang-sql',
            '@codemirror/lang-python',
            '@codemirror/lang-php',
            '@codemirror/lang-xml'
          ],
          // CodeMirror themes
          'codemirror-themes': [
            '@codemirror/theme-one-dark',
            '@uiw/codemirror-theme-abcdef',
            '@uiw/codemirror-theme-abyss',
            '@uiw/codemirror-theme-androidstudio',
            '@uiw/codemirror-theme-atomone',
            '@uiw/codemirror-theme-aura',
            '@uiw/codemirror-theme-basic',
            '@uiw/codemirror-theme-bbedit',
            '@uiw/codemirror-theme-dracula',
            '@uiw/codemirror-theme-duotone',
            '@uiw/codemirror-theme-eclipse',
            '@uiw/codemirror-theme-github',
            '@uiw/codemirror-theme-gruvbox-dark',
            '@uiw/codemirror-theme-kimbie',
            '@uiw/codemirror-theme-material',
            '@uiw/codemirror-theme-monokai',
            '@uiw/codemirror-theme-monokai-dimmed',
            '@uiw/codemirror-theme-noctis-lilac',
            '@uiw/codemirror-theme-nord',
            '@uiw/codemirror-theme-okaidia',
            '@uiw/codemirror-theme-quietlight',
            '@uiw/codemirror-theme-red',
            '@uiw/codemirror-theme-solarized',
            '@uiw/codemirror-theme-sublime',
            '@uiw/codemirror-theme-tokyo-night',
            '@uiw/codemirror-theme-tokyo-night-day',
            '@uiw/codemirror-theme-tokyo-night-storm',
            '@uiw/codemirror-theme-tomorrow-night-blue',
            '@uiw/codemirror-theme-vscode',
            '@uiw/codemirror-theme-white',
            '@uiw/codemirror-theme-xcode'
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