import React from 'react';
import { UIColorPreset, darkModeClasses } from './AppearanceModal';

interface StatusBarProps {
  items: React.ReactNode[];
  theme?: 'light' | 'dark';
  colorPreset?: UIColorPreset;
}

export const StatusBar: React.FC<StatusBarProps> = ({ items, theme = 'dark', colorPreset }) => {
  const isLight = theme === 'light';

  // Use preset classes if available, otherwise fall back to defaults
  const getClasses = () => {
    if (isLight && colorPreset) {
      return `${colorPreset.tailwindClasses.statusBarBg} ${colorPreset.tailwindClasses.statusBarText} ${colorPreset.tailwindClasses.statusBarBorder}`;
    } else if (isLight) {
      return 'bg-stone-100 text-stone-600 border-stone-300';
    } else {
      return `${darkModeClasses.statusBarBg} ${darkModeClasses.statusBarText} ${darkModeClasses.statusBarBorder}`;
    }
  };

  return (
    <div className={`flex items-center justify-between px-2 py-1 text-xs border-t rounded-b-lg ${getClasses()}`}>
      <div className="flex items-center gap-4">
        {items.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      </div>
    </div>
  );
};