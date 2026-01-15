import React from 'react';

interface StatusBarProps {
  items: React.ReactNode[];
}

export const StatusBar: React.FC<StatusBarProps> = ({ items }) => {
  return (
    <div className="flex items-center justify-between px-2 py-1 text-xs border-t rounded-b-lg bg-app-panel text-app-muted border-app-border-main">
      <div className="flex items-center gap-4">
        {items.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      </div>
    </div>
  );
};