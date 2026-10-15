import { describe, expect, it } from 'vitest'
import { memoryStore } from './testing.ts'
import { THEME_KEY, preferredTheme } from './theme.ts'

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
