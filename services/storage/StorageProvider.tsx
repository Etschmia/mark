import React, { createContext, useContext } from 'react';
import { StorageService } from './storageService';
import { BrowserStorageAdapter } from './browserStorageAdapter';

const defaultStorage = new BrowserStorageAdapter();

const StorageContext = createContext<StorageService>(defaultStorage);

/**
 * Hook to access the current StorageService adapter.
 * In Browser mode this returns BrowserStorageAdapter (localStorage).
 * In Desktop mode (Phase 2) it will return DesktopStorageAdapter.
 */
export const useStorage = (): StorageService => useContext(StorageContext);

/**
 * Provides the StorageService to the component tree.
 * Currently always provides BrowserStorageAdapter.
 * In Phase 2 the provider will check isDesktopApp() and supply the
 * correct adapter accordingly.
 */
export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Phase 2 will extend this:
  // const storage = isDesktopApp() ? desktopStorage : defaultStorage;
  return (
    <StorageContext.Provider value={defaultStorage}>
      {children}
    </StorageContext.Provider>
  );
};

/**
 * Direct access to the storage instance for non-React code (TabManager, githubService etc.).
 * Phase 2 will switch this based on isDesktopApp().
 */
export const getStorageService = (): StorageService => defaultStorage;
