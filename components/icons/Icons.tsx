import React from 'react';

// Wrapper for path-based icons that are not changing
const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {children}
  </svg>
);

// Generic component for creating text-based icons
const TextIcon: React.FC<{
  children: React.ReactNode;
  fontWeight?: string;
  fontStyle?: string;
  fontSize?: number;
  fontFamily?: string;
}> = ({ children, fontWeight = 'normal', fontStyle = 'normal', fontSize = 14, fontFamily = "system-ui, sans-serif" }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontStyle={fontStyle}
            fontFamily={fontFamily}
            dy=".1em" // small vertical adjustment for better centering
        >
            {children}
        </text>
    </svg>
);

// --- Text-based & Clearer Icons ---
export const BoldIcon: React.FC = () => <TextIcon fontWeight="bold" fontSize={16}>B</TextIcon>;
export const ItalicIcon: React.FC = () => <TextIcon fontStyle="italic" fontSize={16}>I</TextIcon>;
export const H1Icon: React.FC = () => <TextIcon fontWeight="bold" fontSize={12}>H1</TextIcon>;
export const H2Icon: React.FC = () => <TextIcon fontWeight="bold" fontSize={12}>H2</TextIcon>;
export const H3Icon: React.FC = () => <TextIcon fontWeight="bold" fontSize={12}>H3</TextIcon>;
export const QuoteIcon: React.FC = () => <TextIcon fontSize={24}>"</TextIcon>;
export const CodeIcon: React.FC = () => <TextIcon fontSize={18} fontFamily="'Fira Code', monospace">{'< >'}</TextIcon>;


// --- Path-based Icons ---
export const StrikethroughIcon: React.FC = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M5 4.5S7 2 12 2s7 2.5 7 2.5M5 19.5S7 22 12 22s7-2.5 7-2.5" /></IconWrapper>;

export const ListUlIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM3.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM3.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
);

export const ListOlIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <text x="0" y="8" fontSize="8px" fontWeight="bold" fontFamily="system-ui, sans-serif">1.</text>
        <text x="0" y="15" fontSize="8px" fontWeight="bold" fontFamily="system-ui, sans-serif">2.</text>
        <text x="0" y="22" fontSize="8px" fontWeight="bold" fontFamily="system-ui, sans-serif">3.</text>
        <rect x="10" y="6" width="14" height="2" rx="1" />
        <rect x="10" y="13" width="14" height="2" rx="1" />
        <rect x="10" y="20" width="14" height="2" rx="1" />
    </svg>
);

export const ChecklistIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-3m-4 4l2 2 4-4" />
  </IconWrapper>
);

export const TableIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3zM3 9h18M3 15h18M9 3v18M15 3v18" />
  </IconWrapper>
);

export const ImageIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </IconWrapper>
);

export const LinkIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </IconWrapper>
);

export const UndoIcon: React.FC = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></IconWrapper>;