import { useState } from 'react'
import { applyTheme, currentTheme, type Theme } from '../lib/theme.ts'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  function toggle() {
    applyTheme(next)
    setTheme(next)
  }

  const label = next === 'light' ? 'Switch to light mode' : 'Switch to dark mode'
  return (
    <button type="button" className={styles.toggle} onClick={toggle} aria-label={label} title={label}>
      {theme === 'dark' ? (
        // Moon: it is night in the tavern
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
      )}
    </button>
  )
}
