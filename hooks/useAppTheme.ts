
import { useState, useEffect, useCallback } from 'react';
import { AppTheme, appThemes, getAppThemeById, defaultThemeId } from '../utils/appThemes';

interface UseAppThemeReturn {
    currentTheme: AppTheme;
    setThemeId: (id: string) => void;
    availableThemes: AppTheme[];
}

export const useAppTheme = (initialThemeId?: string): UseAppThemeReturn => {
    const [activeThemeId, setActiveThemeId] = useState<string>(initialThemeId || defaultThemeId);
    const [currentTheme, setCurrentTheme] = useState<AppTheme>(getAppThemeById(activeThemeId));

    const applyThemeVariables = useCallback((theme: AppTheme) => {
        const root = document.documentElement;
        const { colors } = theme;

        // Backgrounds
        root.style.setProperty('--app-bg-main', colors.bg.main);
        root.style.setProperty('--app-bg-sidebar', colors.bg.sidebar);
        root.style.setProperty('--app-bg-activity-bar', colors.bg.activityBar);
        root.style.setProperty('--app-bg-panel', colors.bg.panel);
        root.style.setProperty('--app-bg-hover', colors.bg.hover);
        root.style.setProperty('--app-bg-active', colors.bg.active);
        root.style.setProperty('--app-bg-input', colors.bg.input);

        // Foregrounds
        root.style.setProperty('--app-fg-main', colors.fg.main);
        root.style.setProperty('--app-fg-secondary', colors.fg.secondary);
        root.style.setProperty('--app-fg-muted', colors.fg.muted);
        root.style.setProperty('--app-fg-accent', colors.fg.accent);

        // Borders
        root.style.setProperty('--app-border-main', colors.border.main);
        root.style.setProperty('--app-border-muted', colors.border.muted);

        // Accents
        root.style.setProperty('--app-accent-main', colors.accent.main);
        root.style.setProperty('--app-accent-hover', colors.accent.hover);
        root.style.setProperty('--app-accent-text', colors.accent.text);

        // Status
        root.style.setProperty('--app-status-info', colors.status.info);
        root.style.setProperty('--app-status-warning', colors.status.warning);
        root.style.setProperty('--app-status-error', colors.status.error);
        root.style.setProperty('--app-status-success', colors.status.success);

        // Meta-theme for browser UI
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', colors.bg.main);
        }
    }, []);

    const setThemeId = useCallback((id: string) => {
        const newTheme = getAppThemeById(id);
        setActiveThemeId(id);
        setCurrentTheme(newTheme);
        applyThemeVariables(newTheme);

        // Persist ID to local storage (optional, usually handled by parent settings state)
    }, [applyThemeVariables]);

    // Initial application on mount or id change
    useEffect(() => {
        const theme = getAppThemeById(activeThemeId);
        if (theme.id !== currentTheme.id) {
            setCurrentTheme(theme);
        }
        applyThemeVariables(theme);
    }, [activeThemeId, applyThemeVariables]);

    return {
        currentTheme,
        setThemeId,
        availableThemes: appThemes,
    };
};
