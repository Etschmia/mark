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
    const installButton = this.createInstallButton();
    document.body.appendChild(installButton);
  }

  private hideInstallButton(): void {
    const installButton = document.querySelector('#pwa-install-button');
    if (installButton) {
      installButton.remove();
    }
  }

  private createInstallButton(): HTMLElement {
    // Remove existing button if present
    this.hideInstallButton();
    
    const button = document.createElement('button');
    button.id = 'pwa-install-button';
    button.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      Install App
    `;
    button.className = `
      fixed bottom-4 right-4 z-50 
      flex items-center px-4 py-2 
      bg-cyan-600 hover:bg-cyan-700 
      text-white font-medium text-sm 
      rounded-lg shadow-lg 
      transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
      animate-bounce
    `;
    
    button.addEventListener('click', async () => {
      const installed = await this.installApp();
      if (installed) {
        button.style.display = 'none';
      }
    });

    return button;
  }

  private showUpdateAvailable(): void {
    const updateBanner = this.createUpdateBanner();
    document.body.appendChild(updateBanner);
  }

  private createUpdateBanner(): HTMLElement {
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.className = `
      fixed top-0 left-0 right-0 z-50 
      bg-blue-600 text-white 
      p-3 text-center text-sm
      transform -translate-y-full transition-transform duration-300
    `;
    banner.innerHTML = `
      <span>New version available!</span>
      <button id="pwa-update-button" class="ml-4 px-3 py-1 bg-blue-800 rounded text-xs hover:bg-blue-700">
        Update
      </button>
      <button id="pwa-dismiss-update" class="ml-2 px-3 py-1 bg-blue-800 rounded text-xs hover:bg-blue-700">
        Dismiss
      </button>
    `;

    // Show banner with animation
    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
    }, 100);

    // Handle update button
    banner.querySelector('#pwa-update-button')?.addEventListener('click', () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
    });

    // Handle dismiss button
    banner.querySelector('#pwa-dismiss-update')?.addEventListener('click', () => {
      banner.remove();
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
}

// Create global PWA manager instance
export const pwaManager = new PWAManager();

// Export for use in React components
export default PWAManager;