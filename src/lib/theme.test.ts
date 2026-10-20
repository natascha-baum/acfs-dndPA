import { afterEach, describe, expect, it, vi } from 'vitest'
import { memoryStore } from './testing.ts'
import { THEME_KEY, applyTheme, currentTheme, preferredTheme } from './theme.ts'

describe('preferredTheme', () => {
  it('follows the system preference when nothing is saved', () => {
    expect(preferredTheme(memoryStore(), true)).toBe('light')
    expect(preferredTheme(memoryStore(), false)).toBe('dark')
  })

  it('prefers the saved choice', () => {
    const store = memoryStore()
    store.setItem(THEME_KEY, 'dark')
    expect(preferredTheme(store, true)).toBe('dark')
  })

  it('ignores unknown saved values', () => {
    const store = memoryStore()
    store.setItem(THEME_KEY, 'sepia')
    expect(preferredTheme(store, true)).toBe('light')
  })
})

// The tests run without a browser, so the page's <html> element is a stand-in.
function stubDocument(theme?: string) {
  const dataset: Record<string, string> = theme ? { theme } : {}
  const documentElement = { dataset }
  vi.stubGlobal('document', { documentElement })
  return documentElement
}

describe('applyTheme and currentTheme', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads the theme from the page, dark unless it says light', () => {
    stubDocument('light')
    expect(currentTheme()).toBe('light')
    stubDocument()
    expect(currentTheme()).toBe('dark')
  })

  it('sets the theme on the page and saves the choice', () => {
    const html = stubDocument()
    const store = memoryStore()
    applyTheme('light', store)
    expect(html.dataset.theme).toBe('light')
    expect(store.getItem(THEME_KEY)).toBe('light')
    expect(currentTheme()).toBe('light')
  })

  it('still applies the theme when saving is blocked', () => {
    const html = stubDocument()
    const blocked = {
      ...memoryStore(),
      setItem: () => {
        throw new Error('blocked')
      },
    }
    applyTheme('dark', blocked)
    expect(html.dataset.theme).toBe('dark')
  })
})
