import { NavLink, Outlet } from 'react-router'
import { modules } from '../modules/registry.ts'
import Icon from './Icon.tsx'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand}>
          <Icon name="d20" className={styles.brandIcon} />
          <span>D&amp;D Personal Assistant</span>
        </NavLink>
        <nav className={styles.nav} aria-label="Main">
          {modules.map((m) => (
            <NavLink
              key={m.id}
              to={m.path}
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              <Icon name={m.icon} className={styles.navIcon} />
              <span className={styles.long}>{m.title}</span>
              <span className={styles.short}>{m.shortTitle}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <Icon name="flourish" className={styles.footerFlourish} />
        <p>
          Game data from the{' '}
          <a href="https://www.dnd5eapi.co" target="_blank" rel="noreferrer">
            D&amp;D 5e API
          </a>
          , based on the System Reference Document 5.1 by Wizards of the Coast, licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
            CC-BY-4.0
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
