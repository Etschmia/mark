import { Tab, TabManagerState, EditorState, FileSource } from '../types';

/**
 * Generate a unique tab ID
 */
export const generateTabId = (): string => {
  return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a default editor state
 */
export const createDefaultEditorState = (): EditorState => ({
  cursorPosition: 0,
  scrollPosition: 0,
  selection: { start: 0, end: 0 }
});

/**
 * Create a default file source
 */
export const createDefaultFileSource = (): FileSource => ({
  type: 'local'
});

/**
 * Generate a unique filename by checking existing tab names
 */
export const generateUniqueFilename = (baseFilename: string, existingTabs: Tab[]): string => {
  const existingFilenames = existingTabs.map(tab => tab.filename);
  
  // If the base filename doesn't exist, return it as is
  if (!existingFilenames.includes(baseFilename)) {
    return baseFilename;
  }
  
  // Extract the name and extension
  const lastDotIndex = baseFilename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? baseFilename.substring(0, lastDotIndex) : baseFilename;
  const extension = lastDotIndex !== -1 ? baseFilename.substring(lastDotIndex) : '';
  
  // Generate suffixes: a, b, c, ..., z, aa, ab, etc.
  let suffix = '';
  let counter = 0;
  
  while (true) {
    if (counter < 26) {
      // Single letter: a-z
      suffix = String.fromCharCode(97 + counter); // 97 is 'a'
    } else {
      // Multiple letters: aa, ab, ac, ..., ba, bb, etc.
      const firstChar = Math.floor((counter - 26) / 26);
      const secondChar = (counter - 26) % 26;
      suffix = String.fromCharCode(97 + firstChar) + String.fromCharCode(97 + secondChar);
    }
    
    const candidateFilename = `${name}-${suffix}${extension}`;
    
    if (!existingFilenames.includes(candidateFilename)) {
      return candidateFilename;
    }
    
    counter++;
    
    // Safety check to prevent infinite loops (should never happen in practice)
    if (counter > 1000) {
      return `${name}-${Date.now()}${extension}`;
    }
  }
};

/**
 * Create a new tab with default values
 */
export const createDefaultTab = (
  content: string = '# Hello, Markdown!\n\nStart typing here...',
  filename: string = 'untitled.md'
): Tab => {
  const now = Date.now();
  return {
    id: generateTabId(),
    filename,
    content,
    fileHandle: null,
    fileSource: createDefaultFileSource(),
    originalContent: content,
    history: [content],
    historyIndex: 0,
    editorState: createDefaultEditorState(),
    hasUnsavedChanges: false,
    createdAt: now,
    lastModified: now
  };
};

/**
 * Create a new tab from existing content and metadata
 */
export const createTabFromData = (
  content: string,
  filename: string,
  fileHandle: FileSystemFileHandle | null = null,
  fileSource: FileSource = createDefaultFileSource(),
  originalContent?: string
): Tab => {
  const now = Date.now();
  return {
    id: generateTabId(),
    filename,
    content,
    fileHandle,
    fileSource,
    originalContent: originalContent || content,
    history: [content],
    historyIndex: 0,
    editorState: createDefaultEditorState(),
    hasUnsavedChanges: originalContent ? content !== originalContent : false,
    createdAt: now,
    lastModified: now
  };
};

/**
 * Create default tab manager state
 */
export const createDefaultTabManagerState = (): TabManagerState => {
  const defaultTab = createDefaultTab();
  return {
    tabs: [defaultTab],
    activeTabId: defaultTab.id,
    nextTabId: 2
  };
};

/**
 * Update tab's last modified timestamp
 */
export const updateTabTimestamp = (tab: Tab): Tab => ({
  ...tab,
  lastModified: Date.now()
});

/**
 * Check if tab has unsaved changes
 */
export const hasUnsavedChanges = (tab: Tab): boolean => {
  if (tab.fileSource.type === 'github') {
    return tab.content !== tab.originalContent;
  }
  // For local files, check if content differs from original content or if explicitly marked as unsaved
  return tab.content !== tab.originalContent || tab.hasUnsavedChanges;
};

/**
 * Update tab content and mark as modified
 */
export const updateTabContent = (tab: Tab, newContent: string): Tab => {
  const hasChanges = newContent !== tab.originalContent;
  return {
    ...tab,
    content: newContent,
    hasUnsavedChanges: hasChanges,
    lastModified: Date.now()
  };
};

/**
 * Add entry to tab history
 */
export const addToTabHistory = (tab: Tab, content: string): Tab => {
  // When a new entry is added, clear any "future" history from previous undos
  const newHistory = tab.history.slice(0, tab.historyIndex + 1);
  newHistory.push(content);
  
  return {
    ...tab,
    history: newHistory,
    historyIndex: newHistory.length - 1,
    lastModified: Date.now()
  };
};

/**
 * Update tab editor state
 */
export const updateTabEditorState = (tab: Tab, editorState: Partial<EditorState>): Tab => ({
  ...tab,
  editorState: {
    ...tab.editorState,
    ...editorState
  },
  lastModified: Date.now()
});

/**
 * Mark tab as saved (reset unsaved changes flag and update original content)
 */
export const markTabAsSaved = (tab: Tab): Tab => ({
  ...tab,
  hasUnsavedChanges: false,
  originalContent: tab.content,
  lastModified: Date.now()
});

/**
 * Duplicate a tab with new ID and unique "untitled" filename
 */
export const duplicateTab = (tab: Tab, existingTabs: Tab[]): Tab => {
  const now = Date.now();
  const uniqueFilename = generateUniqueFilename('untitled.md', existingTabs);
  
  return {
    ...tab,
    id: generateTabId(),
    filename: uniqueFilename,
    fileHandle: null,
    fileSource: createDefaultFileSource(),
    hasUnsavedChanges: true, // Duplicated tab is always considered unsaved
    createdAt: now,
    lastModified: now
  };
};