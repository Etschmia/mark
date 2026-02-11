import React, { useState, useEffect } from 'react';
import { isBrowserApp } from '../utils/environment';

const DISMISSED_KEY = 'desktop-banner-dismissed';
const RELEASES_URL = 'https://github.com/Etschmia/mark/releases/latest';

function isMobile(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|mobile|tablet/.test(ua);
}

function detectOS(): 'linux' | 'macos' | 'windows' | 'unknown' {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

const osLabels: Record<string, string> = {
  linux: 'Linux',
  macos: 'macOS',
  windows: 'Windows',
  unknown: '',
};

/**
 * A subtle banner shown in the browser version that links to the desktop app download.
 * Only visible in browser mode; auto-hides in desktop app. Can be permanently dismissed.
 */
export const DesktopDownloadBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isBrowserApp() || isMobile()) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const os = detectOS();
  const label = osLabels[os];

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-1.5 bg-cyan-900/40 text-cyan-200 text-xs border-b border-cyan-800/50">
      <span>
        Mark gibt es jetzt als Desktop-App{label ? ` für ${label}` : ''} —
        schneller, mit nativen Menüs & Dateisystem-Integration.
      </span>
      <a
        href={RELEASES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
      >
        Download
      </a>
      <button
        onClick={dismiss}
        className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
        title="Ausblenden"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
