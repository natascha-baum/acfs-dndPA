import type { ReactNode } from 'react'
import { Link } from 'react-router'
import styles from './SheetToolbar.module.css'

interface SheetToolbarProps {
  /** Where "← My Characters" leads. */
  back: string
  onEdit: () => void
  onDelete: () => void
  /** Page-specific buttons shown before Edit, e.g. "Open PDF" or "Add to session". */
  children?: ReactNode
}

/** The row above a character sheet: back link on the left, actions on the right. */
export default function SheetToolbar({ back, onEdit, onDelete, children }: SheetToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <Link to={back} className="btn">
        ← My Characters
      </Link>
      <div className={styles.actions}>
        {children}
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          ✎ Edit
        </button>
        <button type="button" className="btn" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  )
}
