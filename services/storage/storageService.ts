import { PersistedTabState } from '../../types';
import { EditorSettings } from '../../components/SettingsModal';

/** Persisted state for a single workspace (directory). */
export interface WorkspaceStateData {
  openFiles: string[];
  activeFile: string | null;
  lastAccessed: number;
}

/** Map of rootPath → workspace state. */
export interface WorkspacesMap {
  [rootPath: string]: WorkspaceStateData;
}

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

  // Workspace state (desktop only — browser adapter returns no-op/null)
  saveWorkspaceState(rootPath: string, state: WorkspaceStateData): void;
  loadWorkspaceState(rootPath: string): WorkspaceStateData | null;
  loadAllWorkspaces(): WorkspacesMap;
  clearWorkspaceState(rootPath: string): void;
}
