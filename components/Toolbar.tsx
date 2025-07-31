import React from 'react';
import { FormatType } from '../types';
import { BoldIcon, ItalicIcon, H1Icon, H2Icon, H3Icon, ListUlIcon, ListOlIcon, QuoteIcon, CodeIcon, StrikethroughIcon, UndoIcon } from './icons/Icons';

// Die Props-Schnittstelle wird um die Theme-Eigenschaften erweitert
interface ToolbarProps {
  onFormat: (formatType: FormatType) => void;
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
  onThemeChange
}) => {
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
        <ToolButton onClick={() => onFormat('code')} title="Code"><CodeIcon /></ToolButton>
        <div className="w-px h-6 bg-slate-600 mx-2"></div>
        <ToolButton onClick={onUndo} title="Rückgängig" disabled={!canUndo}><UndoIcon /></ToolButton>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {/* HIER IST DAS NEUE THEME-DROPDOWN */}
        <div className="relative">
          <select
            value={selectedTheme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="pl-3 pr-8 py-1.5 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 appearance-none"
            aria-label="Preview Theme"
          >
            {themes.map(theme => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
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
        <div className="flex items-center gap-2">
          <button onClick={onNew} className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
            New
          </button>
          <button onClick={onOpen} className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
            Open
          </button>
          <button onClick={onSave} className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};