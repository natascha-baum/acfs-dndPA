import { useState } from 'react'
import { Link } from 'react-router'
import Icon from '../components/Icon.tsx'
import PageHeader from '../components/PageHeader.tsx'
import NpcCard, { type RerollField } from '../features/npc/NpcCard.tsx'
import NpcEditor from '../features/npc/NpcEditor.tsx'
import NpcForm from '../features/npc/NpcForm.tsx'
import {
  generateNpc,
  rollAppearance,
  rollHook,
  rollName,
  rollPersonality,
} from '../features/npc/generateNpc.ts'
import type { NpcRole } from '../features/npc/tables.ts'
import AddToSession from '../features/sessions/AddToSession.tsx'
import { api } from '../lib/api/index.ts'
import { characters, SAVE_FAILED_MESSAGE, sessions } from '../lib/storage/index.ts'
import { useAsync } from '../hooks/useAsync.ts'
import type { ApiRef, Character, NpcOptions } from '../types/models.ts'
import styles from './CharacterGenerator.module.css'

interface Lists {
  races: ApiRef[]
  classes: ApiRef[]
}

async function loadLists(): Promise<Lists> {
  const [races, classes] = await Promise.all([api.races(), api.classes()])
  return { races: races.results, classes: classes.results }
}

export default function CharacterGenerator() {
  const lists = useAsync(undefined, loadLists)
  const [lastOptions, setLastOptions] = useState<NpcOptions | null>(null)
  const [npc, setNpc] = useState<Character | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  async function summon(options: NpcOptions) {
    setBusy(true)
    setError(null)
    setLastOptions(options)
    try {
      setNpc(await generateNpc(options, { api }))
      setSavedId(null)
      setEditing(false)
    } catch {
      setError('The summoning failed. The archives could not be reached, please try again.')
    } finally {
      setBusy(false)
    }
  }

  function reroll(field: RerollField) {
    if (!npc) return
    const next = { ...npc }
    if (field === 'name') next.name = rollName(npc.race.index, npc.gender)
    if (field === 'appearance') next.appearance = rollAppearance()
    if (field === 'personality') next.personality = rollPersonality()
    if (field === 'hook') next.hook = rollHook(npc.role as NpcRole)
    setNpc(next)
    setSavedId(null)
  }

  function save() {
    if (!npc) return
    const now = new Date().toISOString()
    const stored = { ...npc, updatedAt: now }
    try {
      characters.save(stored)
    } catch {
      setError(SAVE_FAILED_MESSAGE)
      return
    }
    setError(null)
    setNpc(stored)
    setSavedId(stored.id)
  }

  return (
    <>
      <PageHeader title="NPC Generator" icon="npc">
        A stranger steps out of the shadows…
      </PageHeader>

      {lists.status === 'loading' && <p className="notice">Consulting the archives…</p>}
      {lists.status === 'error' && (
        <div className="notice">
          <p>The archives are unreachable right now. Check your connection and try again.</p>
          <button type="button" className="btn" onClick={lists.retry}>
            Try again
          </button>
        </div>
      )}
      {lists.status === 'ready' && (
        <NpcForm races={lists.data.races} classes={lists.data.classes} busy={busy} onSubmit={summon} />
      )}

      {error && <p className="notice-error" role="alert">{error}</p>}

      {busy && !npc && (
        <div className={styles.summoning} aria-live="polite">
          <Icon name="d20" className={styles.spinner} />
          <p>Summoning…</p>
        </div>
      )}

      {npc && editing && (
        <NpcEditor
          npc={npc}
          saveLabel="Apply changes"
          onSave={(edited) => {
            setNpc(edited)
            setSavedId(null)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      {npc && !editing && (
        <div className={busy ? styles.fading : undefined}>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn"
              disabled={busy || !lastOptions}
              onClick={() => lastOptions && summon(lastOptions)}
            >
              ↻ Re-roll NPC
            </button>
            <button type="button" className="btn" disabled={busy} onClick={() => setEditing(true)}>
              ✎ Customize
            </button>
            {savedId === npc.id ? (
              <>
                <Link to={`/characters/${npc.id}`} className="btn">
                  ✓ Saved · Open sheet
                </Link>
                <AddToSession entry={{ kind: 'npc', ref: npc.id, name: npc.name }} collection={sessions} />
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
                Save to My Characters
              </button>
            )}
          </div>
          <NpcCard npc={npc} onReroll={reroll} />
        </div>
      )}
    </>
  )
}
