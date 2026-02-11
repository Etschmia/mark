import { PersistedTabState } from '../../types';
import { EditorSettings } from '../../components/SettingsModal';
import { StorageService, WorkspaceStateData, WorkspacesMap } from './storageService';

/**
 * Desktop storage adapter — persists data to the Tauri app-data directory.
 * Uses the @tauri-apps/plugin-fs APIs which are loaded lazily to avoid
 * issues when running in the browser.
 */
export class DesktopStorageAdapter implements StorageService {
  private fsModule: typeof import('@tauri-apps/plugin-fs') | null = null;
  private pathModule: typeof import('@tauri-apps/api/path') | null = null;
  private appDataPath: string | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureInit(): Promise<void> {
    if (this.fsModule && this.pathModule && this.appDataPath) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const [fs, pathMod] = await Promise.all([
        import('@tauri-apps/plugin-fs'),
        import('@tauri-apps/api/path'),
      ]);
      this.fsModule = fs;
      this.pathModule = pathMod;
      this.appDataPath = await pathMod.appDataDir();

      // Ensure the directory exists
      const exists = await fs.exists(this.appDataPath);
      if (!exists) {
        await fs.mkdir(this.appDataPath, { recursive: true });
      }
    })();
    return this.initPromise;
  }

  private async filePath(name: string): Promise<string> {
    await this.ensureInit();
    return `${this.appDataPath}/${name}`;
  }

  private async readJson<T>(name: string): Promise<T | null> {
    try {
      const p = await this.filePath(name);
      const exists = await this.fsModule!.exists(p);
      if (!exists) return null;
      const text = await this.fsModule!.readTextFile(p);
      return JSON.parse(text) as T;
    } catch (error) {
      console.warn(`Failed to read ${name}:`, error);
      return null;
    }
  }

  private async writeJson(name: string, data: unknown): Promise<void> {
    try {
      const p = await this.filePath(name);
      await this.fsModule!.writeTextFile(p, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to write ${name}:`, error);
    }
  }

  private async removeFile(name: string): Promise<void> {
    try {
      const p = await this.filePath(name);
      const exists = await this.fsModule!.exists(p);
      if (exists) {
        await this.fsModule!.remove(p);
      }
    } catch (error) {
      console.warn(`Failed to remove ${name}:`, error);
    }
  }

  // --- Tabs ---
  saveTabs(state: PersistedTabState): void {
    this.writeJson('tabs.json', state);
  }

  loadTabs(): PersistedTabState | null {
    // Sync load not possible with Tauri fs — return null and let the
    // async initializer handle it. TabManager constructor calls this
    // synchronously, so for the desktop adapter we need to pre-load.
    // See initDesktopStorage() below.
    return this._cachedTabs;
  }

  clearTabs(): void {
    this._cachedTabs = null;
    this.removeFile('tabs.json');
  }

  // --- Settings ---
  saveSettings(settings: EditorSettings): void {
    this.writeJson('settings.json', settings);
  }

  loadSettings(): EditorSettings | null {
    return this._cachedSettings;
  }

  // --- GitHub Token ---
  saveGitHubToken(tokenData: unknown): void {
    this.writeJson('github-token.json', tokenData);
  }

  loadGitHubToken(): unknown | null {
    return this._cachedGitHubToken;
  }

  clearGitHubToken(): void {
    this._cachedGitHubToken = null;
    this.removeFile('github-token.json');
  }

  // --- OAuth State ---
  saveOAuthState(state: string): void {
    this.writeJson('oauth-state.json', { state });
  }

  loadOAuthState(): string | null {
    return this._cachedOAuthState;
  }

  clearOAuthState(): void {
    this._cachedOAuthState = null;
    this.removeFile('oauth-state.json');
  }

  // --- Update Flag ---
  saveUpdatePending(pending: boolean): void {
    if (pending) {
      this.writeJson('update-pending.json', { pending: true });
    } else {
      this.removeFile('update-pending.json');
    }
  }

  loadUpdatePending(): boolean {
    return this._cachedUpdatePending;
  }

  clearUpdatePending(): void {
    this._cachedUpdatePending = false;
    this.removeFile('update-pending.json');
  }

  // --- Workspace State ---
  saveWorkspaceState(rootPath: string, state: WorkspaceStateData): void {
    // Update in-memory cache and persist
    this._cachedWorkspaces[rootPath] = state;
    this.writeJson('workspaces.json', this._cachedWorkspaces);
  }

  loadWorkspaceState(rootPath: string): WorkspaceStateData | null {
    return this._cachedWorkspaces[rootPath] ?? null;
  }

  loadAllWorkspaces(): WorkspacesMap {
    return { ...this._cachedWorkspaces };
  }

  clearWorkspaceState(rootPath: string): void {
    delete this._cachedWorkspaces[rootPath];
    this.writeJson('workspaces.json', this._cachedWorkspaces);
  }

  // --- Cached data (populated by init) ---
  private _cachedTabs: PersistedTabState | null = null;
  private _cachedSettings: EditorSettings | null = null;
  private _cachedGitHubToken: unknown | null = null;
  private _cachedOAuthState: string | null = null;
  private _cachedUpdatePending = false;
  private _cachedWorkspaces: WorkspacesMap = {};

  /**
   * Must be called once before the app renders. Loads all persisted data
   * from disk into memory so that synchronous load*() calls work.
   */
  async init(): Promise<void> {
    await this.ensureInit();

    const [tabs, settings, token, oauthState, updatePending, workspaces] = await Promise.all([
      this.readJson<PersistedTabState>('tabs.json'),
      this.readJson<EditorSettings>('settings.json'),
      this.readJson<unknown>('github-token.json'),
      this.readJson<{ state: string }>('oauth-state.json'),
      this.readJson<{ pending: boolean }>('update-pending.json'),
      this.readJson<WorkspacesMap>('workspaces.json'),
    ]);

    this._cachedTabs = tabs;
    this._cachedSettings = settings;
    this._cachedGitHubToken = token;
    this._cachedOAuthState = oauthState?.state ?? null;
    this._cachedUpdatePending = updatePending?.pending ?? false;
    this._cachedWorkspaces = workspaces ?? {};
  }
}
