import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from './storageService';
import { BrowserStorageAdapter } from './browserStorageAdapter';
import { DesktopStorageAdapter } from './desktopStorageAdapter';
import { isDesktopApp } from '../../utils/environment';

const browserStorage = new BrowserStorageAdapter();
let desktopStorage: DesktopStorageAdapter | null = null;

// Resolved storage instance (set after async init in desktop mode)
let resolvedStorage: StorageService = browserStorage;

const StorageContext = createContext<StorageService>(browserStorage);

/**
 * Hook to access the current StorageService adapter.
 */
export const useStorage = (): StorageService => useContext(StorageContext);

/**
 * Direct access to the storage instance for non-React code.
 */
export const getStorageService = (): StorageService => resolvedStorage;

/**
 * Provides the StorageService to the component tree.
 * In Desktop mode, shows nothing until the async init completes.
 */
export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storage, setStorage] = useState<StorageService | null>(
    isDesktopApp() ? null : browserStorage
  );

  useEffect(() => {
    if (!isDesktopApp()) return;

    const adapter = new DesktopStorageAdapter();
    desktopStorage = adapter;

    adapter.init().then(() => {
      resolvedStorage = adapter;
      setStorage(adapter);
    });
  }, []);

  // While the desktop adapter is initialising, render nothing
  if (!storage) return null;

  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
};
