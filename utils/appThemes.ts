
import { Extension } from '@codemirror/state';
import {
    vscodeDark,
    githubDark,
    nord,
    dracula,
    bbedit,
    githubLight,
    solarizedLight,
    materialLight,
} from '@uiw/codemirror-themes-all';
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { themes as previewThemes } from '../components/preview-themes';

// Custom Claude Light theme for CodeMirror
const claudeLightTheme = createTheme({
    theme: 'light',
    settings: {
        background: '#FDFDF7',
        foreground: '#171714',
        caret: '#D4A27F',
        selection: '#D4A27F33',
        selectionMatch: '#D4A27F22',
        lineHighlight: '#F5F5F0',
        gutterBackground: '#FDFDF7',
        gutterForeground: '#9E9E98',
        gutterBorder: 'transparent',
    },
    styles: [
        { tag: [t.keyword, t.operatorKeyword], color: '#9E6E42' },
        { tag: [t.string, t.special(t.string)], color: '#5A7D3A' },
        { tag: [t.number, t.bool, t.null], color: '#7A5B9E' },
        { tag: [t.comment, t.lineComment, t.blockComment], color: '#8E8E88', fontStyle: 'italic' },
        { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#4A7A9E' },
        { tag: [t.variableName, t.propertyName], color: '#171714' },
        { tag: [t.operator, t.punctuation], color: '#6E5C42' },
        { tag: [t.typeName, t.className, t.namespace], color: '#7A5B9E' },
        { tag: [t.definition(t.variableName), t.definition(t.propertyName)], color: '#4A7A9E' },
        { tag: [t.tagName], color: '#9E6E42' },
        { tag: [t.attributeName], color: '#4A7A9E' },
        { tag: [t.attributeValue], color: '#5A7D3A' },
        { tag: [t.heading], color: '#171714', fontWeight: 'bold' },
        { tag: [t.emphasis], fontStyle: 'italic' },
        { tag: [t.strong], fontWeight: 'bold' },
        { tag: [t.link], color: '#C27B4F', textDecoration: 'underline' },
        { tag: [t.url], color: '#C27B4F' },
    ],
});

// Custom Claude Dark theme for CodeMirror
const claudeDarkTheme = createTheme({
    theme: 'dark',
    settings: {
        background: '#1A1918',
        foreground: '#FAF9F6',
        caret: '#D4A27F',
        selection: '#D4A27F44',
        selectionMatch: '#D4A27F33',
        lineHighlight: '#252523',
        gutterBackground: '#1A1918',
        gutterForeground: '#666663',
        gutterBorder: 'transparent',
    },
    styles: [
        { tag: [t.keyword, t.operatorKeyword], color: '#D4A27F' },
        { tag: [t.string, t.special(t.string)], color: '#A8C47A' },
        { tag: [t.number, t.bool, t.null], color: '#B39CD0' },
        { tag: [t.comment, t.lineComment, t.blockComment], color: '#666663', fontStyle: 'italic' },
        { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#7DB4D4' },
        { tag: [t.variableName, t.propertyName], color: '#FAF9F6' },
        { tag: [t.operator, t.punctuation], color: '#C9A882' },
        { tag: [t.typeName, t.className, t.namespace], color: '#B39CD0' },
        { tag: [t.definition(t.variableName), t.definition(t.propertyName)], color: '#7DB4D4' },
        { tag: [t.tagName], color: '#D4A27F' },
        { tag: [t.attributeName], color: '#7DB4D4' },
        { tag: [t.attributeValue], color: '#A8C47A' },
        { tag: [t.heading], color: '#FAF9F6', fontWeight: 'bold' },
        { tag: [t.emphasis], fontStyle: 'italic' },
        { tag: [t.strong], fontWeight: 'bold' },
        { tag: [t.link], color: '#D4A27F', textDecoration: 'underline' },
        { tag: [t.url], color: '#D4A27F' },
    ],
});

export interface AppTheme {
    id: string;
    name: string;
    type: 'dark' | 'light';
    description: string;
    colors: {
        bg: {
            main: string;      // Main app background
            sidebar: string;   // Sidebar/Panel background
            activityBar: string; // Leftmost activity bar
            panel: string;     // Modals, dropdowns
            hover: string;     // Hover state background
            active: string;    // Active/Selected state background
            input: string;     // Input field background
        };
        fg: {
            main: string;      // Main text color
            secondary: string; // Muted/Secondary text
            muted: string;     // Very muted/disabled text
            accent: string;    // Accent text color (e.g. links)
        };
        border: {
            main: string;      // Main border color
            muted: string;     // Subtle border
        };
        accent: {
            main: string;      // Primary accent color (buttons, active tabs)
            hover: string;     // Hover state for accent
            text: string;      // Text color on accent background
        };
        status: {
            info: string;
            warning: string;
            error: string;
            success: string;
        };
    };
    codeMirrorTheme: Extension;
    previewTheme: string; // CSS string
}

export const appThemes: AppTheme[] = [
    // Claude Themes
    {
        id: 'claude-dark',
        name: 'Claude Dark',
        description: 'Warm dark theme inspired by Claude documentation',
        type: 'dark',
        colors: {
            bg: {
                main: '#1A1918',
                sidebar: '#252523',
                activityBar: '#1A1918',
                panel: '#252523',
                hover: '#2D2D2A',
                active: '#3D3D39',
                input: '#2D2D2A',
            },
            fg: {
                main: '#FAF9F6',
                secondary: '#B8B8B3',
                muted: '#757571',
                accent: '#D4A27F',
            },
            border: {
                main: '#3D3D39',
                muted: '#252523',
            },
            accent: {
                main: '#D4A27F',
                hover: '#E5B899',
                text: '#1A1918',
            },
            status: {
                info: '#7DB4D4',
                warning: '#D4A27F',
                error: '#C27B4F',
                success: '#A8C47A',
            },
        },
        codeMirrorTheme: claudeDarkTheme,
        previewTheme: previewThemes['Claude Dark'],
    },
    {
        id: 'claude-light',
        name: 'Claude Light',
        description: 'Warm light theme inspired by Claude documentation',
        type: 'light',
        colors: {
            bg: {
                main: '#FDFDF7',
                sidebar: '#F8F8F3',
                activityBar: '#F5F5F0',
                panel: '#FDFDF7',
                hover: '#F5F5F0',
                active: '#E5E5DC',
                input: '#F5F5F0',
            },
            fg: {
                main: '#171714',
                secondary: '#52524E',
                muted: '#6E6E6A',
                accent: '#C27B4F',
            },
            border: {
                main: '#E5E5DC',
                muted: '#F5F5F0',
            },
            accent: {
                main: '#D4A27F',
                hover: '#C08A66',
                text: '#FDFDF7',
            },
            status: {
                info: '#4A7A9E',
                warning: '#9E6E42',
                error: '#C27B4F',
                success: '#5A7D3A',
            },
        },
        codeMirrorTheme: claudeLightTheme,
        previewTheme: previewThemes['Claude Light'],
    },

    // Dark Themes
    {
        id: 'midnight-pro',
        name: 'Midnight Pro',
        description: 'Professional dark theme matching VS Code',
        type: 'dark',
        colors: {
            bg: {
                main: '#1e1e1e',
                sidebar: '#252526',
                activityBar: '#333333',
                panel: '#252526',
                hover: '#2a2d2e',
                active: '#37373d',
                input: '#3c3c3c',
            },
            fg: {
                main: '#cccccc',
                secondary: '#969696',
                muted: '#6e6e6e',
                accent: '#4ec9b0',
            },
            border: {
                main: '#3e3e42',
                muted: '#2b2b2b',
            },
            accent: {
                main: '#007acc',
                hover: '#0062a3',
                text: '#ffffff',
            },
            status: {
                info: '#75beff',
                warning: '#cca700',
                error: '#f48771',
                success: '#89d185',
            },
        },
        codeMirrorTheme: vscodeDark,
        previewTheme: previewThemes['Midnight Pro'],
    },
    {
        id: 'github-dark',
        name: 'GitHub Dark',
        description: 'GitHub-inspired dark theme',
        type: 'dark',
        colors: {
            bg: {
                main: '#0d1117',
                sidebar: '#161b22',
                activityBar: '#0d1117',
                panel: '#161b22',
                hover: '#21262d',
                active: '#30363d',
                input: '#0d1117',
            },
            fg: {
                main: '#c9d1d9',
                secondary: '#8b949e',
                muted: '#6e7681',
                accent: '#58a6ff',
            },
            border: {
                main: '#30363d',
                muted: '#21262d',
            },
            accent: {
                main: '#1f6feb',
                hover: '#388bfd',
                text: '#ffffff',
            },
            status: {
                info: '#58a6ff',
                warning: '#d29922',
                error: '#f85149',
                success: '#3fb950',
            },
        },
        codeMirrorTheme: githubDark,
        previewTheme: previewThemes['GitHub Dark'],
    },
    {
        id: 'nord',
        name: 'Nord',
        description: 'Arctic blue-gray calm theme',
        type: 'dark',
        colors: {
            bg: {
                main: '#2e3440',
                sidebar: '#3b4252',
                activityBar: '#2e3440',
                panel: '#3b4252',
                hover: '#434c5e',
                active: '#4c566a',
                input: '#4c566a',
            },
            fg: {
                main: '#d8dee9',
                secondary: '#e5e9f0',
                muted: '#4c566a',
                accent: '#88c0d0',
            },
            border: {
                main: '#4c566a',
                muted: '#434c5e',
            },
            accent: {
                main: '#88c0d0',
                hover: '#81a1c1',
                text: '#2e3440',
            },
            status: {
                info: '#81a1c1',
                warning: '#ebcb8b',
                error: '#bf616a',
                success: '#a3be8c',
            },
        },
        codeMirrorTheme: nord,
        previewTheme: previewThemes['Nord'],
    },
    {
        id: 'dracula',
        name: 'Dracula',
        description: 'Universal dark theme with high contrast',
        type: 'dark',
        colors: {
            bg: {
                main: '#282a36',
                sidebar: '#21222c',
                activityBar: '#191a21',
                panel: '#282a36',
                hover: '#44475a',
                active: '#44475a',
                input: '#44475a',
            },
            fg: {
                main: '#f8f8f2',
                secondary: '#6272a4',
                muted: '#6272a4',
                accent: '#8be9fd',
            },
            border: {
                main: '#44475a',
                muted: '#282a36',
            },
            accent: {
                main: '#bd93f9',
                hover: '#ff79c6',
                text: '#282a36',
            },
            status: {
                info: '#8be9fd',
                warning: '#f1fa8c',
                error: '#ff5555',
                success: '#50fa7b',
            },
        },
        codeMirrorTheme: dracula,
        previewTheme: previewThemes['Dracula'],
    },

    // Light Themes
    {
        id: 'classic-paper',
        name: 'Classic Paper',
        description: 'Clean, distraction-free writing environment',
        type: 'light',
        colors: {
            bg: {
                main: '#ffffff',
                sidebar: '#f5f5f5',
                activityBar: '#ebebeb',
                panel: '#ffffff',
                hover: '#f0f0f0',
                active: '#e0e0e0',
                input: '#f0f0f0',
            },
            fg: {
                main: '#333333',
                secondary: '#666666',
                muted: '#999999',
                accent: '#0066cc',
            },
            border: {
                main: '#e0e0e0',
                muted: '#f0f0f0',
            },
            accent: {
                main: '#0066cc',
                hover: '#0052a3',
                text: '#ffffff',
            },
            status: {
                info: '#0066cc',
                warning: '#e6a700',
                error: '#e60000',
                success: '#009900',
            },
        },
        codeMirrorTheme: bbedit,
        previewTheme: previewThemes['Classic Paper'],
    },
    {
        id: 'github-light',
        name: 'GitHub Light',
        description: 'Modern, flat light theme',
        type: 'light',
        colors: {
            bg: {
                main: '#ffffff',
                sidebar: '#f6f8fa',
                activityBar: '#f6f8fa',
                panel: '#ffffff',
                hover: '#f3f4f6',
                active: '#ebecf0',
                input: '#f6f8fa',
            },
            fg: {
                main: '#24292f',
                secondary: '#57606a',
                muted: '#6e7781',
                accent: '#0969da',
            },
            border: {
                main: '#d0d7de',
                muted: '#ebecf0',
            },
            accent: {
                main: '#0969da',
                hover: '#0550ae',
                text: '#ffffff',
            },
            status: {
                info: '#0969da',
                warning: '#bf8700',
                error: '#cf222e',
                success: '#1a7f37',
            },
        },
        codeMirrorTheme: githubLight,
        previewTheme: previewThemes['GitHub Light'],
    },
    {
        id: 'solarized-light',
        name: 'Solarized Light',
        description: 'Precision colors for machines and people',
        type: 'light',
        colors: {
            bg: {
                main: '#fdf6e3',
                sidebar: '#eee8d5',
                activityBar: '#eee8d5',
                panel: '#fdf6e3',
                hover: '#e8dfc4',
                active: '#daccab',
                input: '#eee8d5',
            },
            fg: {
                main: '#657b83',
                secondary: '#586e75',
                muted: '#93a1a1',
                accent: '#268bd2',
            },
            border: {
                main: '#daccab',
                muted: '#eee8d5',
            },
            accent: {
                main: '#268bd2',
                hover: '#1a6091',
                text: '#fdf6e3',
            },
            status: {
                info: '#268bd2',
                warning: '#b58900',
                error: '#dc322f',
                success: '#859900',
            },
        },
        codeMirrorTheme: solarizedLight,
        previewTheme: previewThemes['Solarized'],
    },
    {
        id: 'ocean-breeze',
        name: 'Ocean Breeze',
        description: 'Material design inspired light theme',
        type: 'light',
        colors: {
            bg: {
                main: '#fafafa',
                sidebar: '#eceff1',
                activityBar: '#eceff1',
                panel: '#fafafa',
                hover: '#e0e0e0',
                active: '#cfd8dc',
                input: '#f5f5f5',
            },
            fg: {
                main: '#37474f',
                secondary: '#546e7a',
                muted: '#90a4ae',
                accent: '#0288d1',
            },
            border: {
                main: '#cfd8dc',
                muted: '#eceff1',
            },
            accent: {
                main: '#0288d1',
                hover: '#0277bd',
                text: '#ffffff',
            },
            status: {
                info: '#0288d1',
                warning: '#fbc02d',
                error: '#d32f2f',
                success: '#388e3c',
            },
        },
        codeMirrorTheme: materialLight,
        previewTheme: previewThemes['Ocean Breeze'],
    },
];

export const getAppThemeById = (id: string): AppTheme => {
    return appThemes.find((t) => t.id === id) || appThemes[0];
};

export interface ScrollbarColors {
    track: string;
    thumb: string;
    thumbHover: string;
}

export const getScrollbarColors = (theme: AppTheme): ScrollbarColors => ({
    track: theme.colors.bg.panel,
    thumb: theme.colors.fg.muted,
    thumbHover: theme.colors.fg.secondary,
});

export const defaultThemeId = 'claude-dark';
