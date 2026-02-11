import { PersistedTabState } from '../../types';
import { EditorSettings } from '../../components/SettingsModal';

/**
 * Abstract storage interface for persistence.
 * Browser version uses localStorage, Desktop version uses the filesystem.
 */
export interface StorageService {
  // Tab persistence
  saveTabs(state: PersistedTabState): void;
  loadTabs(): PersistedTabState | null;
  clearTabs(): void;

  // Editor settings
  saveSettings(settings: EditorSettings): void;
  loadSettings(): EditorSettings | null;

  // GitHub auth
  saveGitHubToken(tokenData: unknown): void;
  loadGitHubToken(): unknown | null;
  clearGitHubToken(): void;

  // GitHub OAuth state (temporary CSRF token)
  saveOAuthState(state: string): void;
  loadOAuthState(): string | null;
  clearOAuthState(): void;

  // Update flag
  saveUpdatePending(pending: boolean): void;
  loadUpdatePending(): boolean;
  clearUpdatePending(): void;
}
