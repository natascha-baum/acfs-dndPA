import type { ReactNode } from 'react'
import type { ModuleIcon } from '../modules/registry.ts'
import Icon from './Icon.tsx'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  icon?: ModuleIcon
  children?: ReactNode
}

/** Shared page title with an icon and an ornamental divider. */
export default function PageHeader({ title, icon, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {icon && <Icon name={icon} className={styles.icon} />}
      <h1 className={styles.title}>{title}</h1>
      {children && <p className={styles.subtitle}>{children}</p>}
      <Icon name="flourish" className={styles.flourish} />
    </header>
  )
}
