import { PersistedTabState } from '../../types';
import { EditorSettings } from '../../components/SettingsModal';
import { StorageService } from './storageService';

const TABS_KEY = 'markdown-editor-tabs';
const SETTINGS_KEY = 'markdown-editor-settings';
const GITHUB_TOKEN_KEY = 'github_token';
const OAUTH_STATE_KEY = 'github_oauth_state';
const UPDATE_PENDING_KEY = 'app-update-pending';

/**
 * Browser storage adapter — wraps localStorage.
 * This preserves the exact same behavior the app had before the abstraction.
 */
export class BrowserStorageAdapter implements StorageService {
  // --- Tabs ---
  saveTabs(state: PersistedTabState): void {
    try {
      localStorage.setItem(TABS_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist tab state to localStorage:', error);
    }
  }

  loadTabs(): PersistedTabState | null {
    try {
      const stored = localStorage.getItem(TABS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load tab state from localStorage:', error);
      return null;
    }
  }

  clearTabs(): void {
    try {
      localStorage.removeItem(TABS_KEY);
    } catch (error) {
      console.warn('Failed to clear tab state:', error);
    }
  }

  // --- Settings ---
  saveSettings(settings: EditorSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to persist settings to localStorage:', error);
    }
  }

  loadSettings(): EditorSettings | null {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      return null;
    }
  }

  // --- GitHub Token ---
  saveGitHubToken(tokenData: unknown): void {
    try {
      localStorage.setItem(GITHUB_TOKEN_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.warn('Failed to persist GitHub token:', error);
    }
  }

  loadGitHubToken(): unknown | null {
    try {
      const stored = localStorage.getItem(GITHUB_TOKEN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load GitHub token:', error);
      return null;
    }
  }

  clearGitHubToken(): void {
    try {
      localStorage.removeItem(GITHUB_TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to clear GitHub token:', error);
    }
  }

  // --- OAuth State ---
  saveOAuthState(state: string): void {
    try {
      localStorage.setItem(OAUTH_STATE_KEY, state);
    } catch (error) {
      console.warn('Failed to persist OAuth state:', error);
    }
  }

  loadOAuthState(): string | null {
    try {
      return localStorage.getItem(OAUTH_STATE_KEY);
    } catch (error) {
      console.warn('Failed to load OAuth state:', error);
      return null;
    }
  }

  clearOAuthState(): void {
    try {
      localStorage.removeItem(OAUTH_STATE_KEY);
    } catch (error) {
      console.warn('Failed to clear OAuth state:', error);
    }
  }

  // --- Update Flag ---
  saveUpdatePending(pending: boolean): void {
    try {
      if (pending) {
        localStorage.setItem(UPDATE_PENDING_KEY, 'true');
      } else {
        localStorage.removeItem(UPDATE_PENDING_KEY);
      }
    } catch (error) {
      console.warn('Failed to persist update flag:', error);
    }
  }

  loadUpdatePending(): boolean {
    try {
      return localStorage.getItem(UPDATE_PENDING_KEY) === 'true';
    } catch (error) {
      console.warn('Failed to load update flag:', error);
      return false;
    }
  }

  clearUpdatePending(): void {
    try {
      localStorage.removeItem(UPDATE_PENDING_KEY);
    } catch (error) {
      console.warn('Failed to clear update flag:', error);
    }
  }
}
