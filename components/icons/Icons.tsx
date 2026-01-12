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


// Strikethrough Icon with crossed-out S
export const StrikethroughIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize={16}
      fontWeight="normal"
      fontFamily="system-ui, sans-serif"
      dy=".1em"
    >
      S
    </text>
    <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// --- Path-based Icons ---

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
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <text
      x="25%"
      y="35%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize={14}
      fontWeight="bold"
      fontFamily="system-ui, sans-serif"
    >
      ✓
    </text>
    <text
      x="25%"
      y="65%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize={14}
      fontWeight="bold"
      fontFamily="system-ui, sans-serif"
    >
      ✓
    </text>
    <text
      x="70%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize={16}
      fontWeight="normal"
      fontFamily="system-ui, sans-serif"
      dy=".1em"
    >
      =
    </text>
  </svg>
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

export const ExportIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </IconWrapper>
);

export const SearchIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </IconWrapper>
);

export const HelpIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c0-1.037.852-1.879 1.903-1.879s1.903.842 1.903 1.879c0 .636-.293 1.206-.768 1.588l-.863.691c-.542.433-.85 1.092-.85 1.779v.638M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-2.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
  </IconWrapper>
);

export const SettingsIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </IconWrapper>
);

export const InstallIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </IconWrapper>
);

export const UpdateIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.006h-4.992v4.992h4.992Z" />
  </IconWrapper>
);

export const MarkdownIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0V6.375c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v3.375m-16.5 0c.375 3.375 2.25 6 4.125 6s3.75-2.625 4.125-6m-8.25 0h8.25m6.375 6l-4.125-6m4.125 6l-4.125-6M12 21v-6.375" />
  </IconWrapper>
);

export const InfoIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </IconWrapper>
);

export const LinterIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </IconWrapper>
);

export const FrontmatterIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    {/* Upper row: 4 squares */}
    <rect x="3" y="7" width="3" height="3" rx="0.5" />
    <rect x="7.5" y="7" width="3" height="3" rx="0.5" />
    <rect x="12" y="7" width="3" height="3" rx="0.5" />
    <rect x="16.5" y="7" width="3" height="3" rx="0.5" />
    {/* Lower row: 4 squares */}
    <rect x="3" y="14" width="3" height="3" rx="0.5" />
    <rect x="7.5" y="14" width="3" height="3" rx="0.5" />
    <rect x="12" y="14" width="3" height="3" rx="0.5" />
    <rect x="16.5" y="14" width="3" height="3" rx="0.5" />
  </svg>
);

export const PaletteIcon: React.FC = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
  </IconWrapper>
);