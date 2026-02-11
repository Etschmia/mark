/**
 * Utility to detect the current environment.
 */

/**
 * Checks if the application is running on Vercel.
 */
export const isVercel = (): boolean => {
  return window.location.hostname.includes('vercel.app');
};

/**
 * Checks if the application is running inside a Tauri desktop shell.
 */
export const isDesktopApp = (): boolean => {
  return '__TAURI_INTERNALS__' in window;
};

/**
 * Checks if the application is running in a regular browser.
 */
export const isBrowserApp = (): boolean => {
  return !isDesktopApp();
};
