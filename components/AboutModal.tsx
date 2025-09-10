import React, { useState, useEffect } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BuildInfo {
  buildDate: string;
  buildTimestamp: number;
  version: string;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [viteVersion, setViteVersion] = useState<string>('Unknown');

  useEffect(() => {
    if (isOpen) {
      // Load build info
      fetch('/build-info.json')
        .then(response => response.json())
        .then(data => setBuildInfo(data))
        .catch(error => {
          console.warn('Could not load build info:', error);
          setBuildInfo({
            buildDate: 'Unknown',
            buildTimestamp: 0,
            version: '0.0.0'
          });
        });

      // Get Vite version from import.meta
      if (import.meta.env) {
        setViteVersion('7.0.6'); // From package.json
      }
    }
  }, [isOpen]);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatBuildDate = (dateString: string) => {
    if (!dateString || dateString === 'Unknown') return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">About</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-150"
            aria-label="Close about"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* App Info */}
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-2">Markdown Editor Pro</h3>
              <p className="text-slate-300 text-lg">A powerful, privacy-focused Markdown editor</p>
            </div>

            {/* Build Information */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Build Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Version:</span>
                  <span className="text-slate-200 font-mono">{buildInfo?.version || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Build Date:</span>
                  <span className="text-slate-200 font-mono">
                    {buildInfo ? formatBuildDate(buildInfo.buildDate) : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vite Version:</span>
                  <span className="text-slate-200 font-mono">{viteVersion}</span>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Copyright</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Copyright © 2025, Tobias Brendler<br />
                All rights reserved.
              </p>
            </div>

            {/* Links */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Links</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 text-sm block mb-1">Homepage:</span>
                  <a 
                    href="https://github.com/Etschmia/mark" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors duration-150 text-sm break-all"
                  >
                    https://github.com/Etschmia/mark
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 text-sm block mb-1">Support the Developer:</span>
                  <a 
                    href="https://paypal.me/Etschmia" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-150 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.9.9 0 0 0-.89.8l-1.12 7.106a.564.564 0 0 0 .556.65h4.606a.75.75 0 0 0 .741-.66l.69-4.37a.564.564 0 0 1 .556-.49h1.638c3.85 0 6.87-1.567 7.75-6.09.382-1.97.072-3.61-.591-4.86z"/>
                    </svg>
                    paypal.me/Etschmia
                  </a>
                </div>
              </div>
            </div>

            {/* Cache Status */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Cache Status</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                If the build date above doesn't match your expectations, you might be viewing a cached version. 
                Try refreshing the page with <kbd className="px-1 py-0.5 bg-slate-600 rounded text-xs">Ctrl+F5</kbd> or 
                <kbd className="px-1 py-0.5 bg-slate-600 rounded text-xs ml-1">Cmd+Shift+R</kbd> to force reload.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-slate-700 p-4 text-center">
          <p className="text-slate-400 text-sm">
            Press <kbd className="px-1 py-0.5 bg-slate-600 rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};