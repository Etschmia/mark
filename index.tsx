
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StorageProvider } from './services/storage';
import './tailwind.css';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <StorageProvider>
      <App />
    </StorageProvider>
  </React.StrictMode>
);
