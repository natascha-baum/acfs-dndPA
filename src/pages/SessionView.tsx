import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'
import DetailDialog from '../features/detail/DetailDialog.tsx'
import type { LookupRef } from '../features/detail/resolveDetail.ts'
import SessionDetailsForm from '../features/sessions/SessionDetailsForm.tsx'
import SessionEntryRow from '../features/sessions/SessionEntryRow.tsx'
import {
  editSession,
  groupEntries,
  removeEntry,
  type SessionGroups,
  type SessionLookup,
} from '../features/sessions/sessions.ts'
import { characters, playerSheets, SAVE_FAILED_MESSAGE, scenes, sessions } from '../lib/storage/index.ts'
import type { Session } from '../types/models.ts'
import styles from './SessionView.module.css'

const lookup: SessionLookup = {
  npc: (id) => characters.get(id),
  player: (id) => playerSheets.get(id),
  scene: (id) => scenes.get(id),
}

const GROUPS: { key: keyof SessionGroups; title: string }[] = [
  { key: 'players', title: 'Player Characters' },
  { key: 'enemies', title: 'Enemies' },
  { key: 'npcs', title: 'NPCs' },
  { key: 'scenes', title: 'Scenes' },
]

function EmptySession() {
  return (
    <div className={styles.empty}>
      <p>
        This session is still empty. Use <strong>Add to session</strong> on a saved NPC, a player character, a scene or
        a monster in the Wiki.
      </p>
      <div className={styles.links}>
        <Link to="/characters" className="btn">
          My Characters
        </Link>
        <Link to="/generate/character" className="btn">
          NPC Generator
        </Link>
        <Link to="/generate/scene" className="btn">
          Scene Generator
        </Link>
        <Link to="/wiki/monsters" className="btn">
          Monsters
        </Link>
      </div>
    </div>
  )
}

export default function SessionView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(() => sessions.get(id))
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [monster, setMonster] = useState<LookupRef | null>(null)

  if (!session) {
    return (
      <>
        <PageHeader title="Session not found" icon="sessions">
          This page of the book is blank.
        </PageHeader>
        <p className={styles.center}>
          <Link to="/sessions" className="btn">
            Back to My Sessions
          </Link>
        </p>
      </>
    )
  }

  function store(next: Session) {
    try {
      sessions.save(next)
    } catch {
      setError(SAVE_FAILED_MESSAGE)
      return false
    }
    setError(null)
    setSession(next)
    return true
  }

  function remove() {
    if (!session || !window.confirm(`Delete the session "${session.name}"? The items in it stay saved.`)) return
    sessions.remove(session.id)
    void navigate('/sessions')
  }

  const groups = groupEntries(session, lookup)

  return (
    <>
      <div className={styles.toolbar}>
        <Link to="/sessions" className="btn">
          ← My Sessions
        </Link>
        <div className={styles.actions}>
          <button type="button" className="btn btn-primary" onClick={() => setEditing(true)} disabled={editing}>
            ✎ Edit
          </button>
          <button type="button" className="btn" onClick={remove}>
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <SessionDetailsForm
          session={session}
          onSave={(changes) => store(editSession(session, changes, new Date())) && setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <PageHeader title={session.name} icon="sessions" />
          {session.notes && <p className={styles.notes}>{session.notes}</p>}
        </>
      )}
      {error && <p className="notice notice-error">{error}</p>}

      {session.entries.length === 0 && <EmptySession />}
      {GROUPS.filter((g) => groups[g.key].length > 0).map((g) => (
        <section key={g.key} className={styles.group} aria-labelledby={`group-${g.key}`}>
          <h2 id={`group-${g.key}`} className={styles.heading}>
            {g.title} <span className={styles.count}>{groups[g.key].length}</span>
          </h2>
          <ul className={`${styles.list} ${g.key === 'scenes' ? styles.wide : ''}`}>
            {groups[g.key].map((line) => (
              <SessionEntryRow
                key={`${line.entry.kind}/${line.entry.ref}`}
                line={line}
                onRemove={() => store(removeEntry(session, line.entry.kind, line.entry.ref, new Date()))}
                onOpenMonster={(index, name) => setMonster({ kind: 'monster', index, name })}
              />
            ))}
          </ul>
        </section>
      ))}

      {monster && <DetailDialog key={monster.index} lookup={monster} onClose={() => setMonster(null)} />}
    </>
  )
}
