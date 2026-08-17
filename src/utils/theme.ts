import { AppearanceMode } from '../types/index';

/**
 * Resolves the effective theme ('light' | 'dark') based on the given appearance mode.
 * For 'system' mode, checks user device preferences via window.matchMedia.
 *
 * @param mode - The selected appearance mode ('system', 'light', or 'dark').
 * @returns 'light' or 'dark'
 */
export function getEffectiveTheme(mode: AppearanceMode): 'light' | 'dark' {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';

  // System mode
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return 'light';
}

/**
 * Applies the given appearance theme to the document root element.
 * Sets the 'data-theme' attribute on document.documentElement.
 *
 * @param mode - The selected appearance mode ('system', 'light', or 'dark').
 */
export function applyTheme(mode: AppearanceMode): void {
  const theme = getEffectiveTheme(mode);
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

/**
 * Subscribes to system color scheme preference changes.
 *
 * @param callback - Callback invoked when the preferred color scheme changes.
 * @returns A cleanup function to unsubscribe the listener.
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches ? 'dark' : 'light');

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  } else if (typeof (mq as unknown as { addListener: (fn: (e: MediaQueryListEvent) => void) => void }).addListener === 'function') {
    (mq as unknown as { addListener: (fn: (e: MediaQueryListEvent) => void) => void }).addListener(handler);
    return () => {
      (mq as unknown as { removeListener: (fn: (e: MediaQueryListEvent) => void) => void }).removeListener(handler);
    };
  }

  return () => {};
}
