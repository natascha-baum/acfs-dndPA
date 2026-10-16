import { useState, type FormEvent } from 'react'
import type { Session } from '../../types/models.ts'
import styles from './SessionDetailsForm.module.css'

interface SessionDetailsFormProps {
  session: Session
  onSave: (changes: { name: string; notes: string }) => void
  onCancel: () => void
}

/** Edits the name and notes of a session in place. */
export default function SessionDetailsForm({ session, onSave, onCancel }: SessionDetailsFormProps) {
  const [name, setName] = useState(session.name)
  const [notes, setNotes] = useState(session.notes)

  function submit(e: FormEvent) {
    e.preventDefault()
    onSave({ name, notes })
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className="field">
        <label htmlFor="session-edit-name">Name</label>
        <input id="session-edit-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="session-edit-notes">Notes</label>
        <textarea
          id="session-edit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Where the party stands, what happens tonight…"
        />
      </div>
      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
