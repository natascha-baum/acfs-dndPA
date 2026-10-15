import type { KeyValueStore } from './storage/storage.ts'

export type Theme = 'dark' | 'light'

// Same key as the inline script in index.html, which applies the theme before
// the first paint so the page does not flash in the wrong colors.
export const THEME_KEY = 'dndpa:theme'

/** The saved choice, or the system preference when nothing is saved. */
export function preferredTheme(store: KeyValueStore, systemPrefersLight: boolean): Theme {
  const saved = store.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return systemPrefersLight ? 'light' : 'dark'
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme: Theme, store: KeyValueStore = window.localStorage): void {
  document.documentElement.dataset.theme = theme
  try {
    store.setItem(THEME_KEY, theme)
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this visit.
  }
}
