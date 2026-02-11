import { getStorageService } from '../services/storage';

interface BuildInfo {
    buildDate: string;
    buildTimestamp: number;
    version: string;
    viteVersion?: string;
}

interface UpdateResult {
    status: 'success' | 'fail' | 'unchanged';
    buildInfo?: BuildInfo;
    error?: string;
}

/**
 * Check for and install application updates
 */
export async function checkAndInstallUpdate(): Promise<UpdateResult> {
    const storage = getStorageService();
    try {
        // First, get current build info
        let currentBuildInfo: BuildInfo | null = null;
        try {
            const currentResponse = await fetch('/build-info.json', { 
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            if (currentResponse.ok) {
                currentBuildInfo = await currentResponse.json();
            }
        } catch (e) {
            console.warn('Could not load current build info:', e);
        }

        // Force cache refresh to check for new version
        // Clear browser cache for the app
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                const appCaches = cacheNames.filter(name => 
                    name.includes('markdown-editor') || 
                    name.includes('vite') || 
                    name.includes('app')
                );
                
                await Promise.all(
                    appCaches.map(cacheName => {
                        console.log('[Update] Clearing cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            } catch (e) {
                console.warn('Could not clear caches:', e);
            }
        }

        // Force refresh of service worker
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(
                    registrations.map(registration => {
                        console.log('[Update] Updating service worker');
                        return registration.update();
                    })
                );
            } catch (e) {
                console.warn('Could not update service worker:', e);
            }
        }

        // Wait a moment for caches to clear
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to fetch the latest build info from server
        const serverResponse = await fetch('/build-info.json?' + Date.now(), {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!serverResponse.ok) {
            throw new Error(`Server responded with status: ${serverResponse.status}`);
        }

        const serverBuildInfo: BuildInfo = await serverResponse.json();

        // Compare build timestamps
        const currentTimestamp = currentBuildInfo?.buildTimestamp || 0;
        const serverTimestamp = serverBuildInfo.buildTimestamp || 0;

        console.log('[Update] Current timestamp:', currentTimestamp);
        console.log('[Update] Server timestamp:', serverTimestamp);

        if (serverTimestamp > currentTimestamp) {
            // New version available - force a complete reload
            console.log('[Update] New version detected, reloading application...');
            
            // Clear all browser storage and cache
            try {
                storage.saveUpdatePending(true);
                
                // Force a hard reload to get the new version
                window.location.reload();
                
                // The reload will interrupt execution, but return success anyway
                return {
                    status: 'success',
                    buildInfo: serverBuildInfo
                };
            } catch (e) {
                console.error('[Update] Failed to reload application:', e);
                return {
                    status: 'fail',
                    error: 'Failed to reload application'
                };
            }
        } else {
            // No update available
            console.log('[Update] No update available');
            return {
                status: 'unchanged'
            };
        }

    } catch (error) {
        console.error('[Update] Update check failed:', error);
        return {
            status: 'fail',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Check if an update was just completed (for showing success message after reload)
 */
export function checkUpdateCompletion(): { wasUpdated: boolean; newBuildInfo?: BuildInfo } {
    const storage = getStorageService();
    const updatePending = storage.loadUpdatePending();
    if (updatePending) {
        storage.clearUpdatePending();
        
        // Try to get the new build info
        fetch('/build-info.json')
            .then(response => response.json())
            .then(buildInfo => {
                console.log('[Update] Update completed successfully, new build info:', buildInfo);
            })
            .catch(e => console.warn('Could not load new build info:', e));
        
        return { wasUpdated: true };
    }
    
    return { wasUpdated: false };
}