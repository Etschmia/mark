
export type FormatType =
  | 'bold'
  | 'italic'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'checklist'
  | 'quote'
  | 'code'
  | 'strikethrough'
  | 'table'
  | 'image'
  | 'link'
  | 'search'
  | 'new'
  | 'save'
  | 'saveAs'
  | 'open';

// GitHub Integration Types
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  archived: boolean;
  disabled: boolean;
  visibility: 'public' | 'private' | 'internal';
  permissions?: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string; // Base64 encoded content
  encoding?: 'base64';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubCommitOptions {
  message: string;
  content: string;
  sha?: string; // Required for updating existing files
  branch?: string;
  author?: {
    name: string;
    email: string;
  };
  committer?: {
    name: string;
    email: string;
  };
}

export interface GitHubAuthState {
  isConnected: boolean;
  user: GitHubUser | null;
  accessToken: string | null;
  tokenExpiry: number | null;
  deviceCode?: string;
  userCode?: string;
  verificationUri?: string;
  interval?: number;
}

export interface GitHubState {
  auth: GitHubAuthState;
  repositories: GitHubRepository[];
  currentRepository: GitHubRepository | null;
  currentFile: GitHubFile | null;
  currentPath: string;
  files: GitHubFile[];
  isLoadingRepos: boolean;
  isLoadingFiles: boolean;
  isLoadingFile: boolean;
  isCommitting: boolean;
  error: string | null;
  lastSync: number | null;
}

export type GitHubConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: GitHubRepository[];
  selectedRepository: GitHubRepository | null;
  currentPath: string;
  files: GitHubFile[];
  onRepositorySelect: (repo: GitHubRepository) => void;
  onFileSelect: (file: GitHubFile) => void;
  onNavigate: (path: string) => void;
  isLoading: boolean;
  isLoadingFiles: boolean;
  error?: string;
}

export interface SaveOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFile?: GitHubFile;
  hasChanges: boolean;
  onLocalSave: () => void;
  onGitHubSave: (options: GitHubCommitOptions) => void;
  isCommitting: boolean;
  commitError?: string;
  isConnected: boolean;
  canPush: boolean;
}

export interface GitHubButtonProps {
  connectionStatus: GitHubConnectionStatus;
  user?: GitHubUser;
  onConnect: () => void;
  onDisconnect: () => void;
  onBrowseRepos: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export interface FileSource {
  type: 'local' | 'github';
  repository?: GitHubRepository;
  path?: string;
  sha?: string;
}

// File System Access API Types
export interface FileSystemFileHandle {
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableFileStream>;
  name: string;
}

export interface FileSystemWritableFileStream {
  write: (data: BlobPart) => Promise<void>;
  close: () => Promise<void>;
}

// Tab Management Types
export interface EditorState {
  cursorPosition: number;
  scrollPosition: number;
  selection: { start: number; end: number };
}

export interface Tab {
  id: string;
  filename: string;
  content: string;
  fileHandle: FileSystemFileHandle | null;
  fileSource: FileSource;
  originalContent: string; // For GitHub change tracking
  history: string[];
  historyIndex: number;
  editorState: EditorState;
  hasUnsavedChanges: boolean;
  createdAt: number;
  lastModified: number;
}

export interface TabManagerState {
  tabs: Tab[];
  activeTabId: string;
  nextTabId: number;
}

// Tab Component Props
export interface TabProps {
  tab: Tab;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
  theme: 'light' | 'dark';
}

export interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabCreate: () => void;
  onTabContextMenu: (tabId: string, event: React.MouseEvent) => void;
  theme: 'light' | 'dark';
}

export interface TabContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  tabId: string;
  onClose: () => void;
  onCloseTab: (tabId: string) => void;
  onCloseOtherTabs: (tabId: string) => void;
  onCloseAllTabs: () => void;
  onDuplicateTab: (tabId: string) => void;
}

// Persistence Types
export interface PersistedTabState {
  version: string;
  tabs: {
    id: string;
    filename: string;
    content: string;
    fileSource: FileSource;
    originalContent: string;
    history: string[];
    historyIndex: number;
    editorState: EditorState;
    hasUnsavedChanges: boolean;
    createdAt: number;
    lastModified: number;
  }[];
  activeTabId: string;
}