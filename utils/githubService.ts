// Dynamic imports for GitHub dependencies
let Octokit: any = null;
let base64Decode: any = null;
let base64Encode: any = null;

// Cache for loaded modules
const moduleCache = {
  octokit: null as any,
  base64Decode: null as any,
  base64Encode: null as any
};

// Dynamic loader for GitHub dependencies
const loadGitHubDependencies = async () => {
  if (moduleCache.octokit && moduleCache.base64Decode && moduleCache.base64Encode) {
    return {
      Octokit: moduleCache.octokit,
      base64Decode: moduleCache.base64Decode,
      base64Encode: moduleCache.base64Encode
    };
  }

  try {
    const [octokitModule, base64Module] = await Promise.all([
      import('@octokit/rest'),
      import('js-base64')
    ]);

    moduleCache.octokit = octokitModule.Octokit;
    moduleCache.base64Decode = base64Module.decode;
    moduleCache.base64Encode = base64Module.encode;

    return {
      Octokit: moduleCache.octokit,
      base64Decode: moduleCache.base64Decode,
      base64Encode: moduleCache.base64Encode
    };
  } catch (error) {
    console.error('Failed to load GitHub dependencies:', error);
    throw error;
  }
};

import { getStorageService } from '../services/storage';
import type { StorageService } from '../services/storage';
import type {
  GitHubUser,
  GitHubRepository,
  GitHubFile,
  GitHubCommitOptions
} from '../types';

class GitHubService {
  private octokit: any | null = null;
  private storage: StorageService;

  constructor() {
    this.storage = getStorageService();
  }

  /**
   * Handle OAuth callback and prompt for token
   * Since this is a client-side app without backend, we'll guide users to create a personal access token
   */
  async handleOAuthCallback(): Promise<{ token: string; user: GitHubUser } | null> {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      // Check for OAuth errors
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      // If we have a code, show instructions for manual token creation
      if (code && state) {
        // Verify state parameter (CSRF protection)
        const storedState = this.storage.loadOAuthState();
        if (!storedState || state !== storedState) {
          throw new Error('Invalid state parameter');
        }

        // Clean up OAuth parameters
        this.storage.clearOAuthState();
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Show instructions for creating a personal access token
        this.showTokenInstructions();
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('GitHub OAuth callback failed:', error);
      
      // Clean up OAuth parameters on error
      this.storage.clearOAuthState();
      
      throw error;
    }
  }
  
  /**
   * Show instructions for creating a personal access token
   */
  private showTokenInstructions(): void {
    const instructions = `
To complete GitHub integration:

1. Visit: https://github.com/settings/tokens/new
2. Create a new token with 'repo' and 'public_repo' scopes
3. Copy the generated token
4. Click 'Connect with GitHub' again and paste the token when prompted

Note: This is required because this app runs entirely in your browser for security.`;
    
    alert(instructions);
  }
  
  /**
   * Authenticate with a personal access token
   */
  async authenticateWithToken(token: string): Promise<GitHubUser> {
    try {
      const { Octokit } = await loadGitHubDependencies();
      
      // Initialize Octokit with the token
      this.octokit = new Octokit({
        auth: token
      });

      // Get user information to validate token
      const { data: user } = await this.octokit.rest.users.getAuthenticated();

      // Store token securely
      this.storeToken(token);

      return {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        html_url: user.html_url
      };
    } catch (error) {
      console.error('Token authentication failed:', error);
      throw new Error('Invalid GitHub token');
    }
  }

  /**
   * Initialize service with stored token
   */
  async initializeWithToken(token: string): Promise<GitHubUser> {
    try {
      const { Octokit } = await loadGitHubDependencies();
      
      this.octokit = new Octokit({
        auth: token
      });

      const { data: user } = await this.octokit.rest.users.getAuthenticated();

      return {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        html_url: user.html_url
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      // Clear invalid token
      this.clearToken();
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user's repositories
   */
  async getRepositories(options: {
    type?: 'all' | 'owner' | 'public' | 'private' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}): Promise<GitHubRepository[]> {
    if (!this.octokit) {
      throw new Error('GitHub not authenticated');
    }

    try {
      const { data: repos } = await this.octokit.rest.repos.listForAuthenticatedUser({
        type: options.type || 'all',
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      });

      return repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url
        },
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at || repo.updated_at,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        size: repo.size,
        archived: repo.archived,
        disabled: repo.disabled,
        visibility: repo.visibility as 'public' | 'private' | 'internal',
        permissions: repo.permissions ? {
          admin: repo.permissions.admin,
          maintain: repo.permissions.maintain || false,
          push: repo.permissions.push,
          triage: repo.permissions.triage || false,
          pull: repo.permissions.pull
        } : undefined
      }));
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      throw new Error('Failed to fetch repositories');
    }
  }

  /**
   * Get repository contents at a specific path
   */
  async getRepositoryContents(
    owner: string,
    repo: string,
    path: string = ''
  ): Promise<GitHubFile[]> {
    if (!this.octokit) {
      throw new Error('GitHub not authenticated');
    }

    try {
      const { data: contents } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });

      // Handle both single files and directory contents
      const items = Array.isArray(contents) ? contents : [contents];

      return items.map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size || 0,
        url: item.url,
        html_url: item.html_url,
        git_url: item.git_url,
        download_url: item.download_url,
        type: item.type as 'file' | 'dir',
        content: 'content' in item ? item.content : undefined,
        encoding: 'encoding' in item ? item.encoding as 'base64' : undefined,
        _links: {
          self: item._links.self,
          git: item._links.git,
          html: item._links.html
        }
      }));
    } catch (error) {
      console.error('Failed to fetch repository contents:', error);
      throw new Error('Failed to fetch repository contents');
    }
  }

  /**
   * Get a specific file's content
   */
  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    if (!this.octokit) {
      throw new Error('GitHub not authenticated');
    }

    try {
      const { data: file } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });

      if (Array.isArray(file) || file.type !== 'file') {
        throw new Error('Path does not point to a file');
      }

      if (!file.content) {
        throw new Error('File content not available');
      }

      // Decode base64 content
      const { base64Decode } = await loadGitHubDependencies();
      return base64Decode(file.content);
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      throw new Error('Failed to fetch file content');
    }
  }

  /**
   * Create or update a file in the repository
   */
  async saveFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    options: GitHubCommitOptions
  ): Promise<{ commit: any; content: GitHubFile }> {
    if (!this.octokit) {
      throw new Error('GitHub not authenticated');
    }

    try {
      // Encode content to base64
      const { base64Encode } = await loadGitHubDependencies();
      const encodedContent = base64Encode(content);

      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: options.message,
        content: encodedContent,
        sha: options.sha, // Required for updates, omit for new files
        branch: options.branch,
        author: options.author,
        committer: options.committer
      });

      return {
        commit: data.commit,
        content: {
          name: data.content.name,
          path: data.content.path,
          sha: data.content.sha,
          size: data.content.size,
          url: data.content.url,
          html_url: data.content.html_url,
          git_url: data.content.git_url,
          download_url: data.content.download_url,
          type: 'file',
          _links: {
            self: data.content._links.self,
            git: data.content._links.git,
            html: data.content._links.html
          }
        }
      };
    } catch (error) {
      console.error('Failed to save file:', error);
      throw new Error('Failed to save file to GitHub');
    }
  }

  /**
   * Disconnect from GitHub
   */
  disconnect(): void {
    this.octokit = null;
    this.clearToken();
  }

  /**
   * Store token via StorageService
   */
  private storeToken(token: string): void {
    try {
      const tokenData = {
        token,
        timestamp: Date.now()
      };
      this.storage.saveGitHubToken(tokenData);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  /**
   * Retrieve stored token
   */
  getStoredToken(): string | null {
    try {
      const tokenData = this.storage.loadGitHubToken() as { token: string; timestamp: number } | null;
      if (!tokenData) return null;

      // Check if token is older than 1 year (GitHub tokens don't expire but we want to refresh)
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      if (Date.now() - tokenData.timestamp > oneYear) {
        this.clearToken();
        return null;
      }

      return tokenData.token;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    try {
      this.storage.clearGitHubToken();
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService();
export default GitHubService;
