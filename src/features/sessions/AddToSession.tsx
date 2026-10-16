import { useEffect, useRef, useState, type FormEvent } from 'react'
import { newId, SAVE_FAILED_MESSAGE, type Collection } from '../../lib/storage/storage.ts'
import type { Session, SessionEntry } from '../../types/models.ts'
import { addEntry, buttonLabel, countSessionsWith, createSession, hasEntry, toggleEntry } from './sessions.ts'
import styles from './AddToSession.module.css'

interface AddToSessionProps {
  /** What to add, e.g. `{ kind: 'npc', ref: npc.id, name: npc.name }`. */
  entry: SessionEntry
  /** Where sessions are stored; the app passes the `sessions` collection. */
  collection: Collection<Session>
}

const newestFirst = (list: Session[]) => [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

/** Button that opens a small dialog to put one item into one or more sessions. */
export default function AddToSession({ entry, collection }: AddToSessionProps) {
  const [list, setList] = useState(() => newestFirst(collection.list()))
  const [open, setOpen] = useState(false)
  const count = countSessionsWith(list, entry.kind, entry.ref)

  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        {buttonLabel(count)}
      </button>
      {open && (
        <SessionPicker
          entry={entry}
          collection={collection}
          sessions={list}
          onChange={() => setList(newestFirst(collection.list()))}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

interface SessionPickerProps extends AddToSessionProps {
  sessions: Session[]
  onChange: () => void
  onClose: () => void
}

function SessionPicker({ entry, collection, sessions, onChange, onClose }: SessionPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  function store(session: Session) {
    try {
      collection.save(session)
    } catch {
      setError(SAVE_FAILED_MESSAGE)
      return
    }
    setError(null)
    onChange()
  }

  function create(e: FormEvent) {
    e.preventDefault()
    const now = new Date()
    store(addEntry(createSession(name, now, newId()), entry, now))
    setName('')
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      // This dialog can open inside another one (the Wiki's detail dialog), which must stay open.
      onClose={(e) => {
        e.stopPropagation()
        onClose()
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (e.target === dialogRef.current) dialogRef.current?.close()
      }}
      aria-labelledby="add-to-session-title"
    >
      <h2 id="add-to-session-title" className={styles.title}>
        Add {entry.name} to…
      </h2>
      {sessions.length === 0 ? (
        <p className={styles.muted}>No sessions yet. Name your first one below.</p>
      ) : (
        <ul className={styles.list}>
          {sessions.map((s) => (
            <li key={s.id}>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={hasEntry(s, entry.kind, entry.ref)}
                  onChange={() => store(toggleEntry(s, entry, new Date()))}
                />
                {s.name}
              </label>
            </li>
          ))}
        </ul>
      )}
      <form className={styles.create} onSubmit={create}>
        <div className="field">
          <label htmlFor="add-to-session-name">New session</label>
          <input
            id="add-to-session-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Session 4"
            autoComplete="off"
          />
        </div>
        <button type="submit" className="btn">
          Create and add
        </button>
      </form>
      {error && <p className="notice-error">{error}</p>}
      <div className={styles.footer}>
        <button type="button" className="btn btn-primary" onClick={() => dialogRef.current?.close()}>
          Done
        </button>
      </div>
    </dialog>
  )
}
