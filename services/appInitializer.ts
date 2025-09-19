import { useEffect } from 'react';
import { pwaManager } from '../utils/pwaManager';
import { githubService } from '../utils/githubService';
import { checkUpdateCompletion } from '../utils/updateManager';
import { GitHubState } from '../types';

interface UseAppInitializerParams {
  addHistoryEntry: (newMarkdown: string) => void;
  createNewTab: (content?: string, filename?: string, fileHandle?: any, fileSource?: any) => string;
  setIsHelpModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateInfoStatus: React.Dispatch<React.SetStateAction<'success' | 'fail' | 'unchanged'>>;
  setUpdateBuildInfo: React.Dispatch<React.SetStateAction<any>>;
  setIsUpdateInfoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOffline: React.Dispatch<React.SetStateAction<boolean>>;
  githubState: GitHubState;
  setGithubState: React.Dispatch<React.SetStateAction<GitHubState>>;
  initializeGitHubAuth: () => Promise<void>;
}

export const useAppInitializer = ({
  addHistoryEntry,
  createNewTab,
  setIsHelpModalOpen,
  setUpdateInfoStatus,
  setUpdateBuildInfo,
  setIsUpdateInfoModalOpen,
  setIsOffline,
  githubState,
  setGithubState,
  initializeGitHubAuth,
}: UseAppInitializerParams) => {
  useEffect(() => {
    // Check for completed updates
    const updateCheck = checkUpdateCompletion();
    if (updateCheck.wasUpdated) {
      // Show success modal after a brief delay to ensure app is fully loaded
      setTimeout(() => {
        setUpdateInfoStatus('success');
        // Try to get fresh build info
        fetch('/build-info.json')
          .then(response => response.json())
          .then(buildInfo => setUpdateBuildInfo(buildInfo))
          .catch(() => setUpdateBuildInfo(null))
          .finally(() => setIsUpdateInfoModalOpen(true));
      }, 1000);
    }

    // Handle offline status changes
    pwaManager.onOfflineStatusChange((offline) => {
      setIsOffline(offline);
      if (offline) {
        console.log('[PWA] App is now offline');
      } else {
        console.log('[PWA] App is back online');
      }
    });

    // Handle URL shortcuts from PWA
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'new') {
      // Handle new file action
      createNewTab('', 'untitled.md', null, { type: 'local' });
    } else if (action === 'help') {
      setIsHelpModalOpen(true);
    }

    // Initialize GitHub authentication if token exists
    const initGitHub = async () => {
      try {
        // Check for OAuth callback first
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

        // If no callback, try stored token
        await initializeGitHubAuth();
      } catch (error) {
        console.error('Failed to initialize GitHub:', error);
        // Continue without GitHub auth
      }
    };

    initGitHub();

    // Add global force update function for debugging
    (window as any).forceAppUpdate = async () => {
      console.log('🔄 Forcing app update via global function...');
      await pwaManager.forceUpdate();
    };

    // Add global function to show update banner for debugging
    (window as any).showUpdateBanner = () => {
      console.log('🔄 Showing update banner...');
      pwaManager.showUpdateBanner();
    };

    // Add cache info function for debugging
    (window as any).getCacheInfo = async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('📦 Active caches:', cacheNames);
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          console.log(`Cache ${cacheName}:`, keys.map(req => req.url));
        }
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('🔧 Service worker registrations:', registrations);
      }
    };
  }, [addHistoryEntry, createNewTab, setIsHelpModalOpen, setUpdateInfoStatus, setUpdateBuildInfo, setIsUpdateInfoModalOpen, setIsOffline, githubState, setGithubState, initializeGitHubAuth]);
};
