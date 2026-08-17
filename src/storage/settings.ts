import { Settings, AppData } from '../types/index';

/**
 * Default application settings.
 */
export const DEFAULT_SETTINGS: Settings = {
  threshold: 0.75,
  appearance: 'system',
  devMode: false,
};

const SETTINGS_STORAGE_KEY = 'bunkwise_settings';
const CACHE_STORAGE_KEY = 'bunkwise_cached_data';

/**
 * Checks whether the Chrome storage API is available in the current environment.
 */
function isChromeStorageAvailable(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    Boolean(chrome?.storage?.local)
  );
}

/**
 * Reads a value from localStorage with error handling.
 */
function getFromLocalStorage<T>(key: string): T | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.warn(`Failed to read "${key}" from localStorage:`, error);
    return null;
  }
}

/**
 * Writes a value to localStorage with error handling.
 */
function setToLocalStorage<T>(key: string, value: T): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write "${key}" to localStorage:`, error);
  }
}

/**
 * Retrieves the stored settings.
 * If chrome.storage is unavailable, falls back to localStorage.
 * Merges stored settings with DEFAULT_SETTINGS to ensure all keys are present.
 *
 * @returns A Promise resolving to the current Settings.
 */
export async function getSettings(): Promise<Settings> {
  if (isChromeStorageAvailable()) {
    try {
      const stored = await new Promise<{ [key: string]: unknown }>((resolve) => {
        chrome.storage.local.get([SETTINGS_STORAGE_KEY], (items) => {
          if (chrome.runtime?.lastError) {
            console.warn('Chrome storage getSettings error:', chrome.runtime.lastError);
            resolve({});
          } else {
            resolve(items || {});
          }
        });
      });

      const savedSettings = stored[SETTINGS_STORAGE_KEY] as Partial<Settings> | undefined;
      if (savedSettings && typeof savedSettings === 'object') {
        return {
          ...DEFAULT_SETTINGS,
          ...savedSettings,
        };
      }
    } catch (error) {
      console.warn('Error reading settings from chrome.storage.local:', error);
    }
  }

  // Fallback to localStorage
  const localSaved = getFromLocalStorage<Partial<Settings>>(SETTINGS_STORAGE_KEY);
  if (localSaved && typeof localSaved === 'object') {
    return {
      ...DEFAULT_SETTINGS,
      ...localSaved,
    };
  }

  return { ...DEFAULT_SETTINGS };
}

/**
 * Saves settings to storage (chrome.storage.local or localStorage fallback).
 *
 * @param settings - The settings object to save.
 */
export async function saveSettings(settings: Settings): Promise<void> {
  const mergedSettings: Settings = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  if (isChromeStorageAvailable()) {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: mergedSettings }, () => {
          if (chrome.runtime?.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.warn('Error saving settings to chrome.storage.local, writing to localStorage fallback:', error);
      setToLocalStorage(SETTINGS_STORAGE_KEY, mergedSettings);
    }
    return;
  }

  setToLocalStorage(SETTINGS_STORAGE_KEY, mergedSettings);
}

/**
 * Retrieves cached attendance and schedule data.
 *
 * @returns A Promise resolving to the cached AppData or null if not found.
 */
export async function getCachedData(): Promise<AppData | null> {
  if (isChromeStorageAvailable()) {
    try {
      const stored = await new Promise<{ [key: string]: unknown }>((resolve) => {
        chrome.storage.local.get([CACHE_STORAGE_KEY], (items) => {
          if (chrome.runtime?.lastError) {
            console.warn('Chrome storage getCachedData error:', chrome.runtime.lastError);
            resolve({});
          } else {
            resolve(items || {});
          }
        });
      });

      const cached = stored[CACHE_STORAGE_KEY] as AppData | undefined;
      if (cached && Array.isArray(cached.attendance) && Array.isArray(cached.schedule)) {
        return cached;
      }
    } catch (error) {
      console.warn('Error reading cache from chrome.storage.local:', error);
    }
  }

  // Fallback to localStorage
  const localCached = getFromLocalStorage<AppData>(CACHE_STORAGE_KEY);
  if (localCached && Array.isArray(localCached.attendance) && Array.isArray(localCached.schedule)) {
    return localCached;
  }

  return null;
}

/**
 * Caches attendance and schedule data along with an updated timestamp.
 *
 * @param data - The AppData object containing attendance, schedule, and timestamp.
 */
export async function saveCachedData(data: AppData): Promise<void> {
  const dataToSave: AppData = {
    attendance: data.attendance || [],
    schedule: data.schedule || [],
    lastUpdated: data.lastUpdated ?? new Date().toISOString(),
  };

  if (isChromeStorageAvailable()) {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ [CACHE_STORAGE_KEY]: dataToSave }, () => {
          if (chrome.runtime?.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.warn('Error saving cache to chrome.storage.local, writing to localStorage fallback:', error);
      setToLocalStorage(CACHE_STORAGE_KEY, dataToSave);
    }
    return;
  }

  setToLocalStorage(CACHE_STORAGE_KEY, dataToSave);
}

/**
 * Clears all stored settings and cached data from chrome.storage.local and localStorage.
 */
export async function clearAllData(): Promise<void> {
  if (isChromeStorageAvailable()) {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.clear(() => {
          if (chrome.runtime?.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.warn('Error clearing chrome.storage.local:', error);
    }
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.removeItem(CACHE_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Error clearing localStorage:', error);
  }
}
