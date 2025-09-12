import { TabManager } from '../tabManager';
import { Tab, TabManagerState } from '../../types';
import { createDefaultTab, createTabFromData, generateUniqueFilename } from '../tabUtils';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('TabManager', () => {
  let tabManager: TabManager;

  beforeEach(() => {
    localStorageMock.clear();
    tabManager = new TabManager();
  });

  describe('initialization', () => {
    test('creates default state when no persisted state exists', () => {
      const state = tabManager.getState();
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].filename).toBe('untitled.md');
      expect(state.tabs[0].content).toBe('# Hello, Markdown!\n\nStart typing here...');
      expect(state.activeTabId).toBe(state.tabs[0].id);
    });

    test('loads persisted state when available', () => {
      const persistedState = {
        version: '1.0.0',
        tabs: [{
          id: 'test-tab-1',
          filename: 'test.md',
          content: '# Test Content',
          fileSource: { type: 'local' as const },
          originalContent: '# Test Content',
          history: ['# Test Content'],
          historyIndex: 0,
          editorState: { cursorPosition: 0, scrollPosition: 0, selection: { start: 0, end: 0 } },
          hasUnsavedChanges: false,
          createdAt: Date.now(),
          lastModified: Date.now()
        }],
        activeTabId: 'test-tab-1'
      };

      localStorageMock.setItem('markdown-editor-tabs', JSON.stringify(persistedState));
      
      const newTabManager = new TabManager();
      const state = newTabManager.getState();
      
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].filename).toBe('test.md');
      expect(state.tabs[0].content).toBe('# Test Content');
      expect(state.activeTabId).toBe('test-tab-1');
    });
  });

  describe('tab creation', () => {
    test('creates new tab with default content', () => {
      const initialTabCount = tabManager.getState().tabs.length;
      const newTabId = tabManager.createTab();
      
      const state = tabManager.getState();
      expect(state.tabs).toHaveLength(initialTabCount + 1);
      expect(state.activeTabId).toBe(newTabId);
      
      const newTab = tabManager.getTab(newTabId);
      expect(newTab).toBeTruthy();
      expect(newTab!.filename).toBe('untitled-a.md'); // Second tab should be untitled-a.md
      expect(newTab!.content).toBe('# Hello, Markdown!\n\nStart typing here...');
    });

    test('creates multiple tabs with unique untitled filenames', () => {
      // First tab is already 'untitled.md' from initialization
      const tab1Id = tabManager.createTab();
      const tab2Id = tabManager.createTab();
      const tab3Id = tabManager.createTab();
      
      const tab1 = tabManager.getTab(tab1Id);
      const tab2 = tabManager.getTab(tab2Id);
      const tab3 = tabManager.getTab(tab3Id);
      
      expect(tab1!.filename).toBe('untitled-a.md');
      expect(tab2!.filename).toBe('untitled-b.md');
      expect(tab3!.filename).toBe('untitled-c.md');
    });

    test('creates new tab with custom content', () => {
      const customContent = '# Custom Content';
      const customFilename = 'custom.md';
      
      const newTabId = tabManager.createTab(customContent, customFilename);
      const newTab = tabManager.getTab(newTabId);
      
      expect(newTab).toBeTruthy();
      expect(newTab!.filename).toBe(customFilename);
      expect(newTab!.content).toBe(customContent);
    });
  });

  describe('unique filename generation', () => {
    test('returns base filename when no conflicts exist', () => {
      const existingTabs: Tab[] = [];
      const result = generateUniqueFilename('untitled.md', existingTabs);
      expect(result).toBe('untitled.md');
    });

    test('generates -a suffix when base filename exists', () => {
      const existingTabs = [
        createDefaultTab('content', 'untitled.md')
      ];
      const result = generateUniqueFilename('untitled.md', existingTabs);
      expect(result).toBe('untitled-a.md');
    });

    test('generates sequential suffixes for multiple conflicts', () => {
      const existingTabs = [
        createDefaultTab('content', 'untitled.md'),
        createDefaultTab('content', 'untitled-a.md'),
        createDefaultTab('content', 'untitled-b.md')
      ];
      const result = generateUniqueFilename('untitled.md', existingTabs);
      expect(result).toBe('untitled-c.md');
    });

    test('works with files without extensions', () => {
      const existingTabs = [
        createDefaultTab('content', 'untitled'),
        createDefaultTab('content', 'untitled-a')
      ];
      const result = generateUniqueFilename('untitled', existingTabs);
      expect(result).toBe('untitled-b');
    });

    test('handles gaps in sequence', () => {
      const existingTabs = [
        createDefaultTab('content', 'untitled.md'),
        createDefaultTab('content', 'untitled-c.md')
      ];
      const result = generateUniqueFilename('untitled.md', existingTabs);
      expect(result).toBe('untitled-a.md'); // Should use first available
    });
  });

  describe('tab switching', () => {
    test('switches to existing tab', () => {
      const tab1Id = tabManager.createTab('Content 1', 'file1.md');
      const tab2Id = tabManager.createTab('Content 2', 'file2.md');
      
      expect(tabManager.getState().activeTabId).toBe(tab2Id);
      
      const switched = tabManager.switchToTab(tab1Id);
      expect(switched).toBe(true);
      expect(tabManager.getState().activeTabId).toBe(tab1Id);
    });

    test('fails to switch to non-existent tab', () => {
      const switched = tabManager.switchToTab('non-existent-id');
      expect(switched).toBe(false);
    });
  });

  describe('tab closing', () => {
    test('closes tab without unsaved changes', () => {
      const tab1Id = tabManager.createTab('Content 1', 'file1.md');
      const tab2Id = tabManager.createTab('Content 2', 'file2.md');
      
      const initialCount = tabManager.getState().tabs.length;
      const closed = tabManager.forceCloseTab(tab1Id);
      
      expect(closed).toBe(true);
      expect(tabManager.getState().tabs).toHaveLength(initialCount - 1);
      expect(tabManager.getTab(tab1Id)).toBeNull();
    });

    test('creates new default tab when closing last tab', () => {
      const state = tabManager.getState();
      const lastTabId = state.tabs[0].id;
      
      const closed = tabManager.forceCloseTab(lastTabId);
      
      expect(closed).toBe(true);
      expect(tabManager.getState().tabs).toHaveLength(1);
      expect(tabManager.getState().tabs[0].id).not.toBe(lastTabId);
    });

    test('switches to next tab when closing active tab', () => {
      const tab1Id = tabManager.createTab('Content 1', 'file1.md');
      const tab2Id = tabManager.createTab('Content 2', 'file2.md');
      const tab3Id = tabManager.createTab('Content 3', 'file3.md');
      
      // Switch to middle tab
      tabManager.switchToTab(tab2Id);
      expect(tabManager.getState().activeTabId).toBe(tab2Id);
      
      // Close the active tab
      tabManager.forceCloseTab(tab2Id);
      
      // Should switch to next available tab
      const newActiveId = tabManager.getState().activeTabId;
      expect(newActiveId).not.toBe(tab2Id);
      expect([tab1Id, tab3Id]).toContain(newActiveId);
    });
  });

  describe('tab duplication', () => {
    test('duplicates existing tab with unique filename', () => {
      const originalId = tabManager.createTab('Original content', 'original.md');
      const initialCount = tabManager.getState().tabs.length;
      
      const duplicateId = tabManager.duplicateTab(originalId);
      
      expect(duplicateId).toBeTruthy();
      expect(tabManager.getState().tabs).toHaveLength(initialCount + 1);
      
      const original = tabManager.getTab(originalId);
      const duplicate = tabManager.getTab(duplicateId!);
      
      expect(duplicate).toBeTruthy();
      expect(duplicate!.content).toBe(original!.content);
      expect(duplicate!.filename).toBe('untitled-a.md'); // Duplicates get unique untitled filename
      expect(duplicate!.hasUnsavedChanges).toBe(true); // Duplicates are always unsaved
    });

    test('fails to duplicate non-existent tab', () => {
      const duplicateId = tabManager.duplicateTab('non-existent-id');
      expect(duplicateId).toBeNull();
    });
  });

  describe('content updates', () => {
    test('updates tab content', () => {
      const tabId = tabManager.createTab('Original content', 'test.md');
      const newContent = 'Updated content';
      
      const updated = tabManager.updateTabContent(tabId, newContent);
      
      expect(updated).toBe(true);
      const tab = tabManager.getTab(tabId);
      expect(tab!.content).toBe(newContent);
      expect(tab!.hasUnsavedChanges).toBe(true);
    });

    test('adds to tab history', () => {
      const tabId = tabManager.createTab('Original content', 'test.md');
      const newContent = 'Updated content';
      
      const added = tabManager.addToTabHistory(tabId, newContent);
      
      expect(added).toBe(true);
      const tab = tabManager.getTab(tabId);
      expect(tab!.history).toContain(newContent);
      expect(tab!.historyIndex).toBe(tab!.history.length - 1);
    });
  });

  describe('file operations', () => {
    test('updates tab filename', () => {
      const tabId = tabManager.createTab('Content', 'old.md');
      const newFilename = 'new.md';
      
      const updated = tabManager.updateTabFilename(tabId, newFilename);
      
      expect(updated).toBe(true);
      const tab = tabManager.getTab(tabId);
      expect(tab!.filename).toBe(newFilename);
    });

    test('marks tab as saved', () => {
      const tabId = tabManager.createTab('Content', 'test.md');
      
      // Make some changes
      tabManager.updateTabContent(tabId, 'Modified content');
      expect(tabManager.getTab(tabId)!.hasUnsavedChanges).toBe(true);
      
      // Mark as saved
      const marked = tabManager.markTabAsSaved(tabId);
      
      expect(marked).toBe(true);
      const tab = tabManager.getTab(tabId);
      expect(tab!.hasUnsavedChanges).toBe(false);
      expect(tab!.originalContent).toBe(tab!.content);
    });
  });

  describe('tab finding', () => {
    test('finds tab by filename', () => {
      const tabId = tabManager.createTab('Content', 'unique.md');
      
      const found = tabManager.findTabByFilename('unique.md');
      
      expect(found).toBeTruthy();
      expect(found!.id).toBe(tabId);
    });

    test('finds tab by GitHub file source', () => {
      const fileSource = {
        type: 'github' as const,
        repository: {
          full_name: 'user/repo',
          // Add other required properties with minimal values
          id: 1,
          name: 'repo',
          description: null,
          private: false,
          owner: { login: 'user', avatar_url: '' },
          html_url: '',
          clone_url: '',
          ssh_url: '',
          default_branch: 'main',
          updated_at: '',
          pushed_at: '',
          language: null,
          stargazers_count: 0,
          forks_count: 0,
          open_issues_count: 0,
          size: 0,
          archived: false,
          disabled: false,
          visibility: 'public' as const
        },
        path: 'README.md'
      };
      
      const tabId = tabManager.createTab('Content', 'README.md', undefined, fileSource);
      
      const found = tabManager.findTabByFileSource(fileSource);
      
      expect(found).toBeTruthy();
      expect(found!.id).toBe(tabId);
    });
  });

  describe('state subscription', () => {
    test('notifies listeners on state changes', () => {
      const listener = jest.fn();
      const unsubscribe = tabManager.subscribe(listener);
      
      tabManager.createTab('New content', 'new.md');
      
      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
      tabManager.createTab('Another tab', 'another.md');
      
      // Should not be called again after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('legacy migration', () => {
    test('migrates from legacy single-document format', () => {
      localStorageMock.clear();
      localStorageMock.setItem('markdown-editor-content', '# Legacy Content');
      localStorageMock.setItem('markdown-editor-filename', 'legacy.md');
      
      const newTabManager = new TabManager();
      const state = newTabManager.getState();
      
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].content).toBe('# Legacy Content');
      expect(state.tabs[0].filename).toBe('legacy.md');
      
      // Legacy keys should be cleaned up
      expect(localStorageMock.getItem('markdown-editor-content')).toBeNull();
      expect(localStorageMock.getItem('markdown-editor-filename')).toBeNull();
    });
  });

  describe('error handling', () => {
    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.setItem('markdown-editor-tabs', 'invalid json');
      
      const newTabManager = new TabManager();
      const state = newTabManager.getState();
      
      // Should fall back to default state
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].filename).toBe('untitled.md');
    });

    test('handles missing required properties in persisted state', () => {
      const invalidState = {
        version: '1.0.0',
        tabs: [{ id: 'test', filename: 'test.md' }], // Missing required properties
        activeTabId: 'test'
      };
      
      localStorageMock.setItem('markdown-editor-tabs', JSON.stringify(invalidState));
      
      const newTabManager = new TabManager();
      const state = newTabManager.getState();
      
      // Should fall back to default state
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].filename).toBe('untitled.md');
    });
  });
});