import React from 'react';

interface StatusBarProps {
  items: React.ReactNode[];
  theme?: 'light' | 'dark';
}

export const StatusBar: React.FC<StatusBarProps> = ({ items, theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <div className={`flex items-center justify-between px-2 py-1 text-xs border-t rounded-b-lg ${
      isLight
        ? 'bg-stone-100 text-stone-600 border-stone-300'
        : 'bg-slate-800 text-slate-400 border-slate-700'
    }`}>
      <div className="flex items-center gap-4">
        {items.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      </div>
    </div>
  );
};