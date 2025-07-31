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
}> = ({ children, fontWeight = 'normal', fontStyle = 'normal', fontSize = 14 }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontStyle={fontStyle}
            fontFamily="system-ui, sans-serif"
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


// --- Path-based Icons ---
export const StrikethroughIcon: React.FC = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M5 4.5S7 2 12 2s7 2.5 7 2.5M5 19.5S7 22 12 22s7-2.5 7-2.5" /></IconWrapper>;
export const ListUlIcon: React.FC = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></IconWrapper>;
export const ListOlIcon: React.FC = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16M2 6h.01M2 12h.01M2 18h.01" /></IconWrapper>;
export const CodeIcon: React.FC = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l-4 4-4-4" /></IconWrapper>;
