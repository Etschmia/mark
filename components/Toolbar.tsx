import React, { useState, useRef, useEffect } from 'react';
import { FormatType, GitHubState, FileSource } from '../types';
import { BoldIcon, ItalicIcon, H1Icon, H2Icon, H3Icon, ListUlIcon, ListOlIcon, QuoteIcon, CodeIcon, StrikethroughIcon, UndoIcon, TableIcon, ImageIcon, ChecklistIcon, LinkIcon, ExportIcon, SearchIcon, HelpIcon, SettingsIcon, InstallIcon } from './icons/Icons';
import { ExportFormat, exportAsHtml, exportAsPdf } from '../utils/exportUtils';
import { HelpModal } from './HelpModal';
import { CheatSheetModal } from './CheatSheetModal';
import { SettingsModal, EditorSettings } from './SettingsModal';
import { AboutModal } from './AboutModal';
import { UpdateInfoModal } from './UpdateInfoModal';
import { GitHubButton } from './GitHubButton';
import { pwaManager } from '../utils/pwaManager';
import { checkAndInstallUpdate } from '../utils/updateManager';

// Die Props-Schnittstelle wird um die Theme-Eigenschaften erweitert
interface ToolbarProps {
  onFormat: (formatType: FormatType, options?: { language?: string }) => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  fileName: string;
  onFileNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUndo: () => void;
  canUndo: boolean;
  themes: string[];
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  // Export props
  markdown: string;
  // Settings props
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  // Modal control props
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;
  isCheatSheetModalOpen: boolean;
  setIsCheatSheetModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isAboutModalOpen: boolean;
  setIsAboutModalOpen: (open: boolean) => void;
  // Update modal props
  onUpdate: () => void;
  // GitHub integration props
  githubState: GitHubState;
  onGitHubConnect: () => void;
  onGitHubDisconnect: () => void;
  onBrowseRepositories: () => void;
  fileSource: FileSource;
  // Save state props
  hasUnsavedChanges: boolean;
}

const ToolButton: React.FC<{ onClick: () => void; children: React.ReactNode; title: string; disabled?: boolean }> = ({ onClick, children, title, disabled = false }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
  >
    {children}
  </button>
);

const codeLanguages = [
  { name: 'Default Code', key: undefined },
  { name: 'SQL', key: 'sql' },
  { name: 'Python', key: 'python' },
  { name: 'JavaScript', key: 'javascript' },
  { name: 'PHP', key: 'php' },
  { name: 'XML', key: 'xml' },
];

// Die Komponente akzeptiert jetzt die neuen Props für die Themes
export const Toolbar: React.FC<ToolbarProps> = ({ 
  onFormat, 
  onNew, 
  onOpen, 
  onSave, 
  fileName, 
  onFileNameChange, 
  onUndo, 
  canUndo,
  themes,
  selectedTheme,
  onThemeChange,
  markdown,
  settings,
  onSettingsChange,
  isHelpModalOpen,
  setIsHelpModalOpen,
  isCheatSheetModalOpen,
  setIsCheatSheetModalOpen,
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  isAboutModalOpen,
  setIsAboutModalOpen,
  // Update modal props
  onUpdate,
  // GitHub props
  githubState,
  onGitHubConnect,
  onGitHubDisconnect,
  onBrowseRepositories,
  fileSource,
  // Save state props
  hasUnsavedChanges
}) => {
  const [isCodeDropdownOpen, setIsCodeDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const codeDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const helpDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (codeDropdownRef.current && !codeDropdownRef.current.contains(event.target as Node)) {
        setIsCodeDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
      if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target as Node)) {
        setIsHelpDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle PWA install events
  useEffect(() => {
    const handleInstallAvailable = () => {
      setCanInstallPWA(true);
    };
    
    const handleInstallHidden = () => {
      setCanInstallPWA(false);
    };
    
    // Check initial install status
    const status = pwaManager.getInstallationStatus();
    setCanInstallPWA(status.canInstall);
    
    // Listen for PWA events
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-install-hidden', handleInstallHidden);
    
    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-install-hidden', handleInstallHidden);
    };
  }, []);
  
  const handleCodeFormat = (lang?: string) => {
    onFormat('code', lang ? { language: lang } : undefined);
    setIsCodeDropdownOpen(false);
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      const options = {
        filename: fileName,
        content: markdown,
        theme: selectedTheme
      };
      
      if (format === 'html') {
        await exportAsHtml(options);
      } else if (format === 'pdf') {
        await exportAsPdf(options);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setIsExportDropdownOpen(false);
  };

  const handleInstallApp = async () => {
    try {
      const installed = await pwaManager.installApp();
      if (installed) {
        setCanInstallPWA(false);
      }
    } catch (error) {
      console.error('Install failed:', error);
      alert(`Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdate = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setIsHelpDropdownOpen(false);
    
    try {
      await onUpdate();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    // flex-wrap sorgt für besseres Verhalten auf kleinen Bildschirmen
    <div className="flex items-center justify-between p-2 flex-wrap gap-y-2">
      <div className="flex items-center gap-1 flex-wrap">
        <ToolButton onClick={() => onFormat('bold')} title="Fett"><BoldIcon /></ToolButton>
        <ToolButton onClick={() => onFormat('italic')} title="Kursiv"><ItalicIcon /></ToolButton>
        <ToolButton onClick={() => onFormat('strikethrough')} title="Durchgestrichen"><StrikethroughIcon /></ToolButton>
        <div className="w-px h-6 bg-slate-600 mx-2"></div>
        <ToolButton onClick={() => onFormat('h1')} title="Überschrift 1"><H1Icon /></ToolButton>
        <ToolButton onClick={() => onFormat('h2')} title="Überschrift 2"><H2Icon /></ToolButton>
        <ToolButton onClick={() => onFormat('h3')} title="Überschrift 3"><H3Icon /></ToolButton>
        <div className="w-px h-6 bg-slate-600 mx-2"></div>
        <ToolButton onClick={() => onFormat('quote')} title="Zitat"><QuoteIcon /></ToolButton>
        <ToolButton onClick={() => onFormat('ul')} title="Ungeordnete Liste"><ListUlIcon /></ToolButton>
        <ToolButton onClick={() => onFormat('ol')} title="Geordnete Liste"><ListOlIcon /></ToolButton>
        <ToolButton onClick={() => onFormat('checklist')} title="Checkliste"><ChecklistIcon /></ToolButton>
        
        <div className="relative" ref={codeDropdownRef}>
          <ToolButton onClick={() => setIsCodeDropdownOpen(prev => !prev)} title="Code">
            <CodeIcon />
          </ToolButton>
          {isCodeDropdownOpen && (
            <div className="absolute left-0 z-20 mt-2 w-40 origin-top-left rounded-md bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
              {codeLanguages.map(lang => (
                <button
                  key={lang.name}
                  onClick={() => handleCodeFormat(lang.key)}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150"
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <ToolButton onClick={() => onFormat('table')} title="Tabelle einfügen"><TableIcon /></ToolButton>
        <ToolButton onClick={() => onFormat('image')} title="Bild einfügen"><ImageIcon /></ToolButton>
        <ToolButton onClick={() => onFormat('link')} title="Link einfügen"><LinkIcon /></ToolButton>
        <div className="w-px h-6 bg-slate-600 mx-2"></div>
        <ToolButton onClick={() => onFormat('search')} title="Suchen und Ersetzen"><SearchIcon /></ToolButton>
        <ToolButton onClick={onUndo} title="Rückgängig" disabled={!canUndo}><UndoIcon /></ToolButton>
        
        <div className="relative" ref={exportDropdownRef}>
          <ToolButton onClick={() => setIsExportDropdownOpen(prev => !prev)} title="Export">
            <ExportIcon />
          </ToolButton>
          {isExportDropdownOpen && (
            <div className="absolute left-0 z-20 mt-2 w-32 origin-top-left rounded-md bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
              <button
                onClick={() => handleExport('html')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150"
              >
                Export HTML
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150"
              >
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={onNew} className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
            New
          </button>
          <button onClick={onOpen} className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
            Open
          </button>
        </div>
        
        <input
          type="text"
          value={fileName}
          onChange={onFileNameChange}
          className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 w-48 hidden sm:block"
          placeholder="untitled.md"
          aria-label="Filename"
          spellCheck="false"
        />
        
        <button 
          onClick={onSave} 
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            hasUnsavedChanges 
              ? 'text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500' 
              : 'text-slate-300 bg-slate-700 hover:bg-slate-600 focus:ring-cyan-500'
          }`}
        >
          Save
        </button>
                
        {/* Help Dropdown */}
        <div className="relative" ref={helpDropdownRef}>
          <button 
            onClick={() => setIsHelpDropdownOpen(prev => !prev)} 
            title="Hilfe & Referenz"
            className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
          >
            Extras
          </button>
          {isHelpDropdownOpen && (
            <div className="absolute left-0 z-20 mt-2 w-48 origin-top-left rounded-md bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
              <button
                onClick={() => {
                  setIsHelpModalOpen(true);
                  setIsHelpDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150"
              >
                📖 Hilfe & Tastaturkürzel
              </button>
              <button
                onClick={() => {
                  setIsCheatSheetModalOpen(true);
                  setIsHelpDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150"
              >
                📝 Markdown-Spickzettel
              </button>
              <div className="border-t border-slate-600 my-1"></div>
              <button
                onClick={() => {
                  setIsSettingsModalOpen(true);
                  setIsHelpDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150"
              >
                ⚙️ Einstellungen
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? '🔄 Updating...' : '🔄 Update'}
              </button>
              {/* GitHub Button in Dropdown */}
              <button
                onClick={() => {
                  if (githubState.auth.isConnected) {
                    onGitHubDisconnect();
                  } else {
                    onGitHubConnect();
                  }
                  setIsHelpDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150"
              >
                {githubState.auth.isConnected ? '🔌 Disconnect GitHub' : '🔗 Connect with GitHub'}
              </button>
              {/* Install Button in Dropdown */}
              {canInstallPWA && (
                <button
                  onClick={() => {
                    handleInstallApp();
                    setIsHelpDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150"
                >
                  💾 Install App
                </button>
              )}
              <div className="border-t border-slate-600 my-1"></div>
              <button
                onClick={() => {
                  setIsAboutModalOpen(true);
                  setIsHelpDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-150"
              >
                ℹ️ Über diese App
              </button>
            </div>
          )}
        </div>
        
        {/* GitHub Button - Removed from toolbar */}
        {/* <GitHubButton 
          connectionStatus={githubState.auth.isConnected ? 'connected' : 'disconnected'}
          user={githubState.auth.user || undefined}
          onConnect={onGitHubConnect}
          onDisconnect={onGitHubDisconnect}
          onBrowseRepos={onBrowseRepositories}
          isLoading={githubState.isLoadingRepos}
          error={githubState.error || undefined}
        /> */}

        {/* Install Button - Removed from toolbar */}
        {/* {canInstallPWA && (
          <button 
            onClick={handleInstallApp} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500"
            title="Install App"
          >
            <InstallIcon />
            Install App
          </button>
        )} */}
      </div>
    </div>
  );
};