import React from 'react';

interface StatusBarProps {
  items: React.ReactNode[];
}

export const StatusBar: React.FC<StatusBarProps> = ({ items }) => {
  return (
    <div className="flex items-center justify-between px-2 py-1 text-xs bg-slate-800 text-slate-400 border-t border-slate-700 rounded-b-lg">
      <div className="flex items-center gap-4">
        {items.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      </div>
    </div>
  );
};