import { useCallback } from 'react';
import { TabManager } from '../utils/tabManager';
import { GitHubState, GitHubRepository, GitHubFile, GitHubCommitOptions, FileSource } from '../types';
import { githubService } from '../utils/githubService';

interface UseGitHubServiceHandlersParams {
  githubState: GitHubState;
  setGithubState: React.Dispatch<React.SetStateAction<GitHubState>>;
  isOffline: boolean;
  setIsGitHubModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createNewTab: (content?: string, filename?: string, fileHandle?: any, fileSource?: FileSource) => string;
  switchToTab: (tabId: string) => boolean;
  tabManagerRef: React.RefObject<TabManager>;
  syncStateToActiveTab: () => void;
  setFileSource: React.Dispatch<React.SetStateAction<FileSource>>;
  setOriginalContent: React.Dispatch<React.SetStateAction<string>>;
  setIsSaveOptionsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useGitHubServiceHandlers = ({
  githubState,
  setGithubState,
  isOffline,
  setIsGitHubModalOpen,
  createNewTab,
  switchToTab,
  tabManagerRef,
  syncStateToActiveTab,
  setFileSource,
  setOriginalContent,
  setIsSaveOptionsModalOpen,
}: UseGitHubServiceHandlersParams) => {
  const handleGitHubConnect = useCallback(async () => {
    try {
      // Check network connectivity
      if (isOffline) {
        setGithubState(prev => ({
          ...prev,
          error: 'Cannot connect to GitHub while offline. Please check your internet connection.'
        }));
        return;
      }

      setGithubState(prev => ({
        ...prev,
        auth: { ...prev.auth, isConnected: false },
        error: null
      }));

      // Check if we already have a valid token
      const storedToken = githubService.getStoredToken();
      if (storedToken) {
        try {
          const user = await githubService.initializeWithToken(storedToken);
          setGithubState(prev => ({
            ...prev,
            auth: {
              isConnected: true,
              user,
              accessToken: storedToken,
              tokenExpiry: null
            },
            error: null
          }));
          return;
        } catch (error) {
          // Token is invalid, continue with new authentication
          console.log('Stored token is invalid, requesting new authentication');
        }
      }

      // Check for OAuth callback
      const callbackResult = await githubService.handleOAuthCallback();
      if (callbackResult) {
        setGithubState(prev => ({
          ...prev,
          auth: {
            isConnected: true,
            user: callbackResult.user,
            accessToken: callbackResult.token,
            tokenExpiry: null
          },
          error: null
        }));
        return;
      }

      // Prompt for personal access token
      const token = prompt(
        'Please enter your GitHub Personal Access Token:\n\n' +
        '1. Visit: https://github.com/settings/tokens/new\n' +
        '2. Create a token with "repo" and "public_repo" scopes\n' +
        '3. Copy and paste the token below:'
      );

      if (token && token.trim()) {
        const user = await githubService.authenticateWithToken(token.trim());
        setGithubState(prev => ({
          ...prev,
          auth: {
            isConnected: true,
            user,
            accessToken: token.trim(),
            tokenExpiry: null
          },
          error: null
        }));
      } else {
        setGithubState(prev => ({
          ...prev,
          error: 'GitHub authentication cancelled'
        }));
      }
    } catch (error) {
      console.error('GitHub connection failed:', error);
      let errorMessage = 'Connection failed';

      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Connection timeout. Please check your internet connection and try again.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('unauthorized') || error.message.includes('Invalid GitHub token')) {
          errorMessage = 'Invalid GitHub token. Please check your token and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setGithubState(prev => ({
        ...prev,
        error: errorMessage
      }));
    }
  }, [isOffline, setGithubState]);

  const handleGitHubDisconnect = useCallback(() => {
    githubService.disconnect();
    setGithubState({
      auth: {
        isConnected: false,
        user: null,
        accessToken: null,
        tokenExpiry: null
      },
      repositories: [],
      currentRepository: null,
      currentFile: null,
      currentPath: '',
      files: [],
      isLoadingRepos: false,
      isLoadingFiles: false,
      isLoadingFile: false,
      isCommitting: false,
      error: null,
      lastSync: null
    });
    setFileSource({ type: 'local' });
  }, [setGithubState, setFileSource]);

  const handleBrowseRepositories = useCallback(async () => {
    if (!githubState.auth.isConnected) {
      await handleGitHubConnect();
      return;
    }

    // Check network connectivity
    if (isOffline) {
      setGithubState(prev => ({
        ...prev,
        error: 'Cannot browse repositories while offline. Please check your internet connection.'
      }));
      return;
    }

    try {
      setGithubState(prev => ({ ...prev, isLoadingRepos: true, error: null }));

      const repositories = await githubService.getRepositories({
        sort: 'updated',
        per_page: 50
      });

      setGithubState(prev => ({
        ...prev,
        repositories,
        isLoadingRepos: false
      }));

      setIsGitHubModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      let errorMessage = 'Failed to load repositories';

      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
        } else if (error.message.includes('unauthorized') || error.message.includes('Invalid or expired token')) {
          errorMessage = 'GitHub authentication expired. Please reconnect.';
          // Auto-disconnect on auth errors
          handleGitHubDisconnect();
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }

      setGithubState(prev => ({
        ...prev,
        isLoadingRepos: false,
        error: errorMessage
      }));
    }
  }, [githubState.auth.isConnected, handleGitHubConnect, isOffline, setGithubState, setIsGitHubModalOpen]);

  const handleRepositorySelect = useCallback(async (repository: GitHubRepository) => {
    try {
      setGithubState(prev => ({
        ...prev,
        currentRepository: repository,
        currentPath: '',
        isLoadingFiles: true,
        error: null
      }));

      const files = await githubService.getRepositoryContents(
        repository.owner.login,
        repository.name
      );

      setGithubState(prev => ({
        ...prev,
        files,
        isLoadingFiles: false
      }));
    } catch (error) {
      console.error('Failed to load repository contents:', error);
      setGithubState(prev => ({
        ...prev,
        isLoadingFiles: false,
        error: error instanceof Error ? error.message : 'Failed to load repository contents'
      }));
    }
  }, [setGithubState]);

  const handleFileSelect = useCallback(async (file: GitHubFile) => {
    if (file.type !== 'file' || !file.path.endsWith('.md')) {
      return;
    }

    try {
      setGithubState(prev => ({ ...prev, isLoadingFile: true, error: null }));

      // Sync current state to active tab before loading new file
      syncStateToActiveTab();

      // Check if this GitHub file is already open in another tab
      const fileSource: FileSource = {
        type: 'github',
        repository: githubState.currentRepository!,
        path: file.path,
        sha: file.sha
      };

      const existingTab = tabManagerRef.current?.findTabByFileSource(fileSource);
      if (existingTab) {
        // Switch to existing tab
        switchToTab(existingTab.id);
        setGithubState(prev => ({
          ...prev,
          currentFile: file,
          isLoadingFile: false
        }));
        setIsGitHubModalOpen(false);
        return;
      }

      const content = await githubService.getFileContent(
        githubState.currentRepository!.owner.login,
        githubState.currentRepository!.name,
        file.path
      );

      // Create new tab for the GitHub file
      const newTabId = createNewTab(content, file.name, null, fileSource);

      // Update the new tab's original content for change tracking
      tabManagerRef.current?.updateTabOriginalContent(newTabId, content);

      // Update local state to reflect the new GitHub file
      setFileSource(fileSource);
      setOriginalContent(content);

      setGithubState(prev => ({
        ...prev,
        currentFile: file,
        isLoadingFile: false
      }));

      setIsGitHubModalOpen(false);
    } catch (error) {
      console.error('Failed to load file:', error);
      setGithubState(prev => ({
        ...prev,
        isLoadingFile: false,
        error: error instanceof Error ? error.message : 'Failed to load file'
      }));
    }
  }, [githubState.currentRepository, syncStateToActiveTab, tabManagerRef, switchToTab, createNewTab, setFileSource, setOriginalContent, setGithubState, setIsGitHubModalOpen]);

  const handleGitHubNavigate = useCallback(async (path: string) => {
    if (!githubState.currentRepository) return;

    try {
      setGithubState(prev => ({ ...prev, currentPath: path, isLoadingFiles: true }));

      const files = await githubService.getRepositoryContents(
        githubState.currentRepository.owner.login,
        githubState.currentRepository.name,
        path
      );

      setGithubState(prev => ({
        ...prev,
        files,
        isLoadingFiles: false
      }));
    } catch (error) {
      console.error('Failed to navigate:', error);
      setGithubState(prev => ({
        ...prev,
        isLoadingFiles: false,
        error: error instanceof Error ? error.message : 'Failed to navigate'
      }));
    }
  }, [githubState.currentRepository, setGithubState]);

  const handleGitHubSave = useCallback(async (options: GitHubCommitOptions) => {
    const activeTab = tabManagerRef.current?.getActiveTab();
    if (!githubState.currentRepository || !githubState.currentFile || !activeTab) {
      throw new Error('No GitHub file selected');
    }

    try {
      setGithubState(prev => ({ ...prev, isCommitting: true, error: null }));

      // Sync current state to active tab before saving
      syncStateToActiveTab();

      // Get the updated tab after sync
      const updatedActiveTab = tabManagerRef.current?.getActiveTab();
      if (!updatedActiveTab) {
        throw new Error('Active tab not found after sync');
      }

      const result = await githubService.saveFile(
        githubState.currentRepository.owner.login,
        githubState.currentRepository.name,
        githubState.currentFile.path,
        updatedActiveTab.content,
        {
          ...options,
          sha: updatedActiveTab.fileSource.sha // Include current SHA for updates
        }
      );

      // Update tab's file source with new SHA
      const updatedFileSource: FileSource = {
        ...updatedActiveTab.fileSource,
        sha: result.content.sha
      };

      // Update tab in manager with new file source and original content
      tabManagerRef.current?.updateTabFileSource(updatedActiveTab.id, updatedFileSource);
      tabManagerRef.current?.updateTabOriginalContent(updatedActiveTab.id, updatedActiveTab.content);
      tabManagerRef.current?.markTabAsSaved(updatedActiveTab.id);

      // Update local state to reflect the saved GitHub file
      setFileSource(updatedFileSource);
      setOriginalContent(updatedActiveTab.content);

      setGithubState(prev => ({
        ...prev,
        currentFile: result.content,
        isCommitting: false,
        lastSync: Date.now()
      }));

      setIsSaveOptionsModalOpen(false);
    } catch (error) {
      console.error('Failed to save to GitHub:', error);
      setGithubState(prev => ({
        ...prev,
        isCommitting: false,
        error: error instanceof Error ? error.message : 'Failed to save to GitHub'
      }));
      throw error; // Re-throw so the modal can handle it
    }
  }, [githubState.currentRepository, githubState.currentFile, tabManagerRef, syncStateToActiveTab, setFileSource, setOriginalContent, setGithubState, setIsSaveOptionsModalOpen]);

  return {
    handleGitHubConnect,
    handleGitHubDisconnect,
    handleBrowseRepositories,
    handleRepositorySelect,
    handleFileSelect,
    handleGitHubNavigate,
    handleGitHubSave,
  };
};
