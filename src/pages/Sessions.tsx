import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'
import { createSession } from '../features/sessions/sessions.ts'
import { newId, SAVE_FAILED_MESSAGE, sessions } from '../lib/storage/index.ts'
import type { Session } from '../types/models.ts'
import styles from './Sessions.module.css'

const loadSessions = () => [...sessions.list()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

const entryCount = (session: Session) =>
  session.entries.length === 1 ? '1 entry' : `${session.entries.length} entries`

export default function Sessions() {
  const navigate = useNavigate()
  const [list, setList] = useState<Session[]>(loadSessions)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function create(e: FormEvent) {
    e.preventDefault()
    const session = createSession(name, new Date(), newId())
    try {
      sessions.save(session)
    } catch {
      setError(SAVE_FAILED_MESSAGE)
      return
    }
    void navigate(`/sessions/${session.id}`)
  }

  function remove(session: Session) {
    const question = `Delete the session "${session.name}"? The NPCs, characters and scenes in it stay saved.`
    if (!window.confirm(question)) return
    sessions.remove(session.id)
    setList(loadSessions())
  }

  return (
    <>
      <PageHeader title="My Sessions" icon="sessions">
        Everything for tonight’s table, in one place.
      </PageHeader>

      <form className={styles.create} onSubmit={create}>
        <div className="field">
          <label htmlFor="session-name">New session</label>
          <input
            id="session-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Curse of the Mill, session 4"
            autoComplete="off"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Create session
        </button>
      </form>
      {error && <p className="notice notice-error">{error}</p>}

      {list.length === 0 ? (
        <p className={styles.empty}>
          No sessions yet. Create one, then use <strong>Add to session</strong> on an NPC, a player character, a scene
          or a monster in the Wiki.
        </p>
      ) : (
        <ul className={styles.list}>
          {list.map((s) => (
            <li key={s.id} className={styles.item}>
              <Link to={`/sessions/${s.id}`} className={styles.open}>
                <span className={styles.name}>{s.name}</span>
                <span className={styles.meta}>
                  {entryCount(s)} · changed {new Date(s.updatedAt).toLocaleDateString()}
                </span>
              </Link>
              <button
                type="button"
                className={styles.delete}
                onClick={() => remove(s)}
                aria-label={`Delete ${s.name}`}
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
