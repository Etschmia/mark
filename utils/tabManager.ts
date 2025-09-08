import { Tab, TabManagerState, PersistedTabState, FileSource } from '../types';
import { 
  createDefaultTabManagerState, 
  createDefaultTab, 
  createTabFromData,
  duplicateTab as duplicateTabUtil,
  updateTabContent,
  addToTabHistory,
  updateTabEditorState,
  markTabAsSaved,
  hasUnsavedChanges
} from './tabUtils';

const STORAGE_KEY = 'markdown-editor-tabs';
const STORAGE_VERSION = '1.0.0';

// Legacy storage keys for migration
const LEGACY_CONTENT_KEY = 'markdown-editor-content';
const LEGACY_FILENAME_KEY = 'markdown-editor-filename';
const LEGACY_SETTINGS_KEY = 'markdown-editor-settings';

export class TabManager {
  private state: TabManagerState;
  private listeners: Array<(state: TabManagerState) => void> = [];

  constructor(initialState?: TabManagerState) {
    this.state = initialState || this.loadPersistedState();
  }

  /**
   * Get current tab manager state
   */
  getState(): TabManagerState {
    return { ...this.state };
  }

  /**
   * Get active tab
   */
  getActiveTab(): Tab | null {
    return this.state.tabs.find(tab => tab.id === this.state.activeTabId) || null;
  }

  /**
   * Get tab by ID
   */
  getTab(tabId: string): Tab | null {
    return this.state.tabs.find(tab => tab.id === tabId) || null;
  }

  /**
   * Get all tabs
   */
  getTabs(): Tab[] {
    return [...this.state.tabs];
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: TabManagerState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  /**
   * Update state and notify listeners
   */
  private updateState(newState: TabManagerState): void {
    this.state = newState;
    this.persistState();
    this.notifyListeners();
  }

  /**
   * Create a new tab
   */
  createTab(content?: string, filename?: string, fileHandle?: FileSystemFileHandle, fileSource?: FileSource): string {
    const newTab = content || filename || fileHandle || fileSource 
      ? createTabFromData(
          content || '# Hello, Markdown!\n\nStart typing here...',
          filename || 'untitled.md',
          fileHandle || null,
          fileSource || { type: 'local' }
        )
      : createDefaultTab();

    const newState: TabManagerState = {
      ...this.state,
      tabs: [...this.state.tabs, newTab],
      activeTabId: newTab.id,
      nextTabId: this.state.nextTabId + 1
    };

    this.updateState(newState);
    return newTab.id;
  }

  /**
   * Close a tab
   */
  closeTab(tabId: string): boolean {
    const tabIndex = this.state.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return false;

    const tab = this.state.tabs[tabIndex];
    
    // Check for unsaved changes - this should be handled by the UI layer
    // but we'll return false to indicate the operation should be confirmed
    if (hasUnsavedChanges(tab)) {
      return false;
    }

    let newTabs = this.state.tabs.filter(t => t.id !== tabId);
    let newActiveTabId = this.state.activeTabId;

    // If we're closing the last tab, create a new default tab
    if (newTabs.length === 0) {
      const defaultTab = createDefaultTab();
      newTabs = [defaultTab];
      newActiveTabId = defaultTab.id;
    } else if (tabId === this.state.activeTabId) {
      // If closing the active tab, switch to the next available tab
      const nextIndex = tabIndex < newTabs.length ? tabIndex : newTabs.length - 1;
      newActiveTabId = newTabs[nextIndex].id;
    }

    const newState: TabManagerState = {
      ...this.state,
      tabs: newTabs,
      activeTabId: newActiveTabId
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Force close a tab (ignoring unsaved changes)
   */
  forceCloseTab(tabId: string): boolean {
    const tabIndex = this.state.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return false;

    let newTabs = this.state.tabs.filter(t => t.id !== tabId);
    let newActiveTabId = this.state.activeTabId;

    // If we're closing the last tab, create a new default tab
    if (newTabs.length === 0) {
      const defaultTab = createDefaultTab();
      newTabs = [defaultTab];
      newActiveTabId = defaultTab.id;
    } else if (tabId === this.state.activeTabId) {
      // If closing the active tab, switch to the next available tab
      const nextIndex = tabIndex < newTabs.length ? tabIndex : newTabs.length - 1;
      newActiveTabId = newTabs[nextIndex].id;
    }

    const newState: TabManagerState = {
      ...this.state,
      tabs: newTabs,
      activeTabId: newActiveTabId
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Switch to a tab
   */
  switchToTab(tabId: string): boolean {
    const tab = this.state.tabs.find(t => t.id === tabId);
    if (!tab) return false;

    const newState: TabManagerState = {
      ...this.state,
      activeTabId: tabId
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Duplicate a tab
   */
  duplicateTab(tabId: string): string | null {
    const tab = this.state.tabs.find(t => t.id === tabId);
    if (!tab) return null;

    const duplicatedTab = duplicateTabUtil(tab);
    
    const newState: TabManagerState = {
      ...this.state,
      tabs: [...this.state.tabs, duplicatedTab],
      activeTabId: duplicatedTab.id,
      nextTabId: this.state.nextTabId + 1
    };

    this.updateState(newState);
    return duplicatedTab.id;
  }

  /**
   * Close all tabs except the specified one
   */
  closeOtherTabs(keepTabId: string): boolean {
    const keepTab = this.state.tabs.find(t => t.id === keepTabId);
    if (!keepTab) return false;

    // Check if any other tabs have unsaved changes
    const otherTabs = this.state.tabs.filter(t => t.id !== keepTabId);
    const hasUnsavedOtherTabs = otherTabs.some(tab => hasUnsavedChanges(tab));
    
    if (hasUnsavedOtherTabs) {
      return false; // Should be confirmed by UI layer
    }

    const newState: TabManagerState = {
      ...this.state,
      tabs: [keepTab],
      activeTabId: keepTabId
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Force close all tabs except the specified one
   */
  forceCloseOtherTabs(keepTabId: string): boolean {
    const keepTab = this.state.tabs.find(t => t.id === keepTabId);
    if (!keepTab) return false;

    const newState: TabManagerState = {
      ...this.state,
      tabs: [keepTab],
      activeTabId: keepTabId
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Close all tabs
   */
  closeAllTabs(): boolean {
    // Check if any tabs have unsaved changes
    const hasUnsavedTabs = this.state.tabs.some(tab => hasUnsavedChanges(tab));
    
    if (hasUnsavedTabs) {
      return false; // Should be confirmed by UI layer
    }

    const defaultTab = createDefaultTab();
    const newState: TabManagerState = {
      tabs: [defaultTab],
      activeTabId: defaultTab.id,
      nextTabId: 2
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Force close all tabs
   */
  forceCloseAllTabs(): boolean {
    const defaultTab = createDefaultTab();
    const newState: TabManagerState = {
      tabs: [defaultTab],
      activeTabId: defaultTab.id,
      nextTabId: 2
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Update tab content
   */
  updateTabContent(tabId: string, content: string): boolean {
    const tabIndex = this.state.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return false;

    const updatedTab = updateTabContent(this.state.tabs[tabIndex], content);
    const newTabs = [...this.state.tabs];
    newTabs[tabIndex] = updatedTab;

    const newState: TabManagerState = {
      ...this.state,
      tabs: newTabs
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Add entry to tab history
   */
  addToTabHistory(tabId: string, content: string): boolean {
    const tabIndex = this.state.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return false;

    const updatedTab = addToTabHistory(this.state.tabs[tabIndex], content);
    const newTabs = [...this.state.tabs];
    newTabs[tabIndex] = updatedTab;

    const newState: TabManagerState = {
      ...this.state,
      tabs: newTabs
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Update tab editor state
   */
  updateTabEditorState(tabId: string, editorState: Partial<import('../types').EditorState>): boolean {
    const tabIndex = this.state.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return false;

    const updatedTab = updateTabEditorState(this.state.tabs[tabIndex], editorState);
    const newTabs = [...this.state.tabs];
    newTabs[tabIndex] = updatedTab;

    const newState: TabManagerState = {
      ...this.state,
      tabs: newTabs
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Update tab filename
   */
  updateTabFilename(tabId: string, filename: string): boolean {
    const tabIndex = this.state.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return false;

    const updatedTab = {
      ...this.state.tabs[tabIndex],
      filename,
      lastModified: Date.now()
    };

    const newTabs = [...this.state.tabs];
    newTabs[tabIndex] = updatedTab;

    const newState: TabManagerState = {
      ...this.state,
      tabs: newTabs
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Update tab file handle
   */
  updateTabFileHandle(tabId: string, fileHandle: FileSystemFileHandle | null): boolean {
    const tabIndex = this.state.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return false;

    const updatedTab = {
      ...this.state.tabs[tabIndex],
      fileHandle,
      lastModified: Date.now()
    };

    const newTabs = [...this.state.tabs];
    newTabs[tabIndex] = updatedTab;

    const newState: TabManagerState = {
      ...this.state,
      tabs: newTabs
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Mark tab as saved
   */
  markTabAsSaved(tabId: string): boolean {
    const tabIndex = this.state.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return false;

    const updatedTab = markTabAsSaved(this.state.tabs[tabIndex]);
    const newTabs = [...this.state.tabs];
    newTabs[tabIndex] = updatedTab;

    const newState: TabManagerState = {
      ...this.state,
      tabs: newTabs
    };

    this.updateState(newState);
    return true;
  }

  /**
   * Find tab by filename (for duplicate detection)
   */
  findTabByFilename(filename: string): Tab | null {
    return this.state.tabs.find(tab => tab.filename === filename) || null;
  }

  /**
   * Find tab by file source (for GitHub file duplicate detection)
   */
  findTabByFileSource(fileSource: FileSource): Tab | null {
    if (fileSource.type === 'github' && fileSource.repository && fileSource.path) {
      return this.state.tabs.find(tab => 
        tab.fileSource.type === 'github' &&
        tab.fileSource.repository?.full_name === fileSource.repository?.full_name &&
        tab.fileSource.path === fileSource.path
      ) || null;
    }
    return null;
  }

  /**
   * Persist state to localStorage
   */
  private persistState(): void {
    try {
      const persistedState: PersistedTabState = {
        version: STORAGE_VERSION,
        tabs: this.state.tabs.map(tab => ({
          id: tab.id,
          filename: tab.filename,
          content: tab.content,
          fileSource: tab.fileSource,
          originalContent: tab.originalContent,
          history: tab.history,
          historyIndex: tab.historyIndex,
          editorState: tab.editorState,
          hasUnsavedChanges: tab.hasUnsavedChanges,
          createdAt: tab.createdAt,
          lastModified: tab.lastModified
        })),
        activeTabId: this.state.activeTabId
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    } catch (error) {
      console.warn('Failed to persist tab state to localStorage:', error);
    }
  }

  /**
   * Load persisted state from localStorage
   */
  private loadPersistedState(): TabManagerState {
    try {
      // First, try to load new tab format
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const persistedState: PersistedTabState = JSON.parse(stored);
        
        // Validate the persisted state
        if (this.isValidPersistedState(persistedState)) {
          return this.convertPersistedStateToTabManagerState(persistedState);
        }
      }

      // If no new format found, try to migrate from legacy format
      return this.migrateLegacyState();
    } catch (error) {
      console.warn('Failed to load persisted tab state, using default:', error);
      return createDefaultTabManagerState();
    }
  }

  /**
   * Validate persisted state structure
   */
  private isValidPersistedState(state: any): state is PersistedTabState {
    return (
      state &&
      typeof state === 'object' &&
      typeof state.version === 'string' &&
      Array.isArray(state.tabs) &&
      typeof state.activeTabId === 'string' &&
      state.tabs.length > 0
    );
  }

  /**
   * Convert persisted state to tab manager state
   */
  private convertPersistedStateToTabManagerState(persistedState: PersistedTabState): TabManagerState {
    const tabs: Tab[] = persistedState.tabs
      .filter(this.isValidPersistedTab)
      .map(tabData => ({
        id: tabData.id,
        filename: tabData.filename,
        content: tabData.content,
        fileHandle: null, // File handles cannot be persisted
        fileSource: tabData.fileSource,
        originalContent: tabData.originalContent,
        history: tabData.history,
        historyIndex: tabData.historyIndex,
        editorState: tabData.editorState,
        hasUnsavedChanges: tabData.hasUnsavedChanges,
        createdAt: tabData.createdAt,
        lastModified: tabData.lastModified
      }));

    // Ensure we have at least one tab
    if (tabs.length === 0) {
      return createDefaultTabManagerState();
    }

    // Ensure active tab exists
    const activeTabExists = tabs.some(tab => tab.id === persistedState.activeTabId);
    const activeTabId = activeTabExists ? persistedState.activeTabId : tabs[0].id;

    return {
      tabs,
      activeTabId,
      nextTabId: Math.max(...tabs.map(t => parseInt(t.id.split('-')[1]) || 0)) + 1
    };
  }

  /**
   * Validate persisted tab structure
   */
  private isValidPersistedTab(tab: any): boolean {
    return (
      tab &&
      typeof tab.id === 'string' &&
      typeof tab.filename === 'string' &&
      typeof tab.content === 'string' &&
      typeof tab.fileSource === 'object' &&
      typeof tab.originalContent === 'string' &&
      Array.isArray(tab.history) &&
      typeof tab.historyIndex === 'number' &&
      typeof tab.editorState === 'object' &&
      typeof tab.hasUnsavedChanges === 'boolean' &&
      typeof tab.createdAt === 'number' &&
      typeof tab.lastModified === 'number'
    );
  }

  /**
   * Migrate from legacy single-document format
   */
  private migrateLegacyState(): TabManagerState {
    try {
      const legacyContent = localStorage.getItem(LEGACY_CONTENT_KEY);
      const legacyFilename = localStorage.getItem(LEGACY_FILENAME_KEY);

      if (legacyContent !== null || legacyFilename !== null) {
        console.log('Migrating from legacy single-document format to tab format');
        
        const tab = createTabFromData(
          legacyContent || '# Hello, Markdown!\n\nStart typing here...',
          legacyFilename || 'untitled.md'
        );

        // Clean up legacy storage
        localStorage.removeItem(LEGACY_CONTENT_KEY);
        localStorage.removeItem(LEGACY_FILENAME_KEY);

        return {
          tabs: [tab],
          activeTabId: tab.id,
          nextTabId: 2
        };
      }
    } catch (error) {
      console.warn('Failed to migrate legacy state:', error);
    }

    return createDefaultTabManagerState();
  }

  /**
   * Clear all persisted state (for testing/debugging)
   */
  clearPersistedState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_CONTENT_KEY);
      localStorage.removeItem(LEGACY_FILENAME_KEY);
    } catch (error) {
      console.warn('Failed to clear persisted state:', error);
    }
  }
}