/**
 * Utility to detect the current environment.
 */

/**
 * Checks if the application is running on Vercel.
 * @returns {boolean} True if running on Vercel, false otherwise.
 */
export const isVercel = (): boolean => {
  return window.location.hostname.includes('vercel.app');
};

/**
 * Checks if the application is running in a self-hosted environment (including localhost).
 * @returns {boolean} True if self-hosted, false otherwise.
 */
export const isSelfHosted = (): boolean => {
  return !isVercel();
};
