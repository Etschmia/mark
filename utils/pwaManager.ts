// PWA installation and service worker registration

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private isServiceWorkerRegistered = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Register service worker
    await this.registerServiceWorker();
    
    // Setup install prompt handling
    this.setupInstallPrompt();
    
    // Check if already installed
    this.checkInstallationStatus();
    
    // Setup update handling
    this.setupUpdateHandling();
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('[PWA] Service Worker registered successfully:', registration.scope);
        this.isServiceWorkerRegistered = true;
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });
        
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    } else {
      console.warn('[PWA] Service Worker not supported');
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Before install prompt triggered');
      e.preventDefault(); // Prevent the mini-infobar from appearing
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed');
      this.isInstalled = true;
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  private checkInstallationStatus(): void {
    // Check if app is installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      this.isInstalled = true;
      console.log('[PWA] App is running in standalone mode');
    }
  }

  private setupUpdateHandling(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker activated, reloading...');
        window.location.reload();
      });
      
      // Check for updates more frequently
      setInterval(() => {
        this.checkForUpdates();
      }, 60000); // Check every minute
    }
  }

  private async checkForUpdates(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      } catch (error) {
        console.error('[PWA] Update check failed:', error);
      }
    }
  }

  public async forceUpdate(): Promise<void> {
    console.log('[PWA] Forcing app update...');
    
    if ('serviceWorker' in navigator) {
      try {
        // Send force update message to service worker
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.active) {
          registration.active.postMessage({ type: 'FORCE_UPDATE' });
        }
        
        // Clear browser cache
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => {
              console.log('[PWA] Clearing cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        }
        
        // Unregister service worker and reload
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => {
            console.log('[PWA] Unregistering service worker');
            return registration.unregister();
          })
        );
        
        // Force reload with cache bypass
        window.location.reload();
      } catch (error) {
        console.error('[PWA] Force update failed:', error);
        // Fallback: just reload the page
        window.location.reload();
      }
    } else {
      // No service worker support, just reload
      window.location.reload();
    }
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('[PWA] Install prompt outcome:', outcome);
      
      if (outcome === 'accepted') {
        this.hideInstallButton();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
      return false;
    }
  }

  private showInstallButton(): void {
    // Install button is now integrated into the toolbar
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private hideInstallButton(): void {
    // Install button is now integrated into the toolbar
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('pwa-install-hidden'));
  }

  // This method is no longer used - install button is integrated into toolbar
  private createInstallButton(): HTMLElement {
    throw new Error('Install button is now integrated into the toolbar component');
  }

  private showUpdateAvailable(): void {
    const updateBanner = this.createUpdateBanner();
    document.body.appendChild(updateBanner);
  }

  private createUpdateBanner(): HTMLElement {
    // Remove existing banner if present
    const existingBanner = document.querySelector('#pwa-update-banner');
    if (existingBanner) {
      existingBanner.remove();
    }
    
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.className = `
      fixed top-0 left-0 right-0 z-[9999] 
      bg-blue-600 text-white 
      p-4 text-center text-sm
      transform -translate-y-full transition-transform duration-300
      shadow-lg
    `;
    banner.innerHTML = `
      <div class="flex items-center justify-center gap-4 flex-wrap">
        <span class="font-medium">🚀 Neue Version verfügbar!</span>
        <button id="pwa-update-button" class="px-4 py-2 bg-blue-800 rounded text-sm hover:bg-blue-700 transition-colors font-medium">
          Jetzt aktualisieren
        </button>
        <button id="pwa-force-update-button" class="px-4 py-2 bg-red-600 rounded text-sm hover:bg-red-700 transition-colors font-medium">
          Force Update
        </button>
        <button id="pwa-dismiss-update" class="px-4 py-2 bg-gray-600 rounded text-sm hover:bg-gray-700 transition-colors font-medium">
          Später
        </button>
      </div>
    `;

    // Show banner with animation
    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
    }, 100);

    // Auto-dismiss after 30 seconds instead of immediately
    const autoDismissTimer = setTimeout(() => {
      if (document.body.contains(banner)) {
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => banner.remove(), 300);
      }
    }, 30000); // 30 seconds

    // Handle normal update button
    banner.querySelector('#pwa-update-button')?.addEventListener('click', () => {
      clearTimeout(autoDismissTimer);
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      banner.style.transform = 'translateY(-100%)';
      setTimeout(() => banner.remove(), 300);
    });

    // Handle force update button
    banner.querySelector('#pwa-force-update-button')?.addEventListener('click', async () => {
      clearTimeout(autoDismissTimer);
      banner.style.transform = 'translateY(-100%)';
      setTimeout(() => banner.remove(), 300);
      await this.forceUpdate();
    });

    // Handle dismiss button
    banner.querySelector('#pwa-dismiss-update')?.addEventListener('click', () => {
      clearTimeout(autoDismissTimer);
      banner.style.transform = 'translateY(-100%)';
      setTimeout(() => banner.remove(), 300);
    });

    return banner;
  }

  public getInstallationStatus(): { isInstalled: boolean; canInstall: boolean } {
    return {
      isInstalled: this.isInstalled,
      canInstall: !!this.deferredPrompt && !this.isInstalled
    };
  }

  public isOffline(): boolean {
    return !navigator.onLine;
  }

  public onOfflineStatusChange(callback: (offline: boolean) => void): void {
    window.addEventListener('online', () => callback(false));
    window.addEventListener('offline', () => callback(true));
  }

  // Manual method to show update banner for development/debugging
  public showUpdateBanner(): void {
    this.showUpdateAvailable();
  }
}

// Create global PWA manager instance
export const pwaManager = new PWAManager();

// Export for use in React components
export default PWAManager;