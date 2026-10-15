import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Icon from '../components/Icon.tsx'
import PageHeader from '../components/PageHeader.tsx'
import NpcCard, { type RerollField } from '../features/npc/NpcCard.tsx'
import NpcForm from '../features/npc/NpcForm.tsx'
import {
  generateNpc,
  rollAppearance,
  rollHook,
  rollName,
  rollPersonality,
} from '../features/npc/generateNpc.ts'
import type { NpcRole } from '../features/npc/tables.ts'
import { api } from '../lib/api/index.ts'
import { characters } from '../lib/storage/index.ts'
import type { ApiRef, Character, NpcOptions } from '../types/models.ts'
import styles from './CharacterGenerator.module.css'

type ListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; races: ApiRef[]; classes: ApiRef[] }

export default function CharacterGenerator() {
  const [lists, setLists] = useState<ListState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [lastOptions, setLastOptions] = useState<NpcOptions | null>(null)
  const [npc, setNpc] = useState<Character | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.races(), api.classes()])
      .then(([races, classes]) => {
        if (!cancelled) setLists({ status: 'ready', races: races.results, classes: classes.results })
      })
      .catch(() => {
        if (!cancelled) setLists({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  function retryLists() {
    setLists({ status: 'loading' })
    setAttempt((n) => n + 1)
  }

  async function summon(options: NpcOptions) {
    setBusy(true)
    setError(null)
    setLastOptions(options)
    try {
      setNpc(await generateNpc(options, { api }))
      setSavedId(null)
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
    characters.save(stored)
    setNpc(stored)
    setSavedId(stored.id)
  }

  return (
    <>
      <PageHeader title="NPC Generator" icon="npc">
        A stranger steps out of the shadows…
      </PageHeader>

      {lists.status === 'loading' && <p className={styles.status}>Consulting the archives…</p>}
      {lists.status === 'error' && (
        <div className={styles.status}>
          <p>The archives are unreachable right now. Check your connection and try again.</p>
          <button type="button" className="btn" onClick={retryLists}>
            Try again
          </button>
        </div>
      )}
      {lists.status === 'ready' && (
        <NpcForm races={lists.races} classes={lists.classes} busy={busy} onSubmit={summon} />
      )}

      {error && <p className={styles.error} role="alert">{error}</p>}

      {busy && !npc && (
        <div className={styles.summoning} aria-live="polite">
          <Icon name="d20" className={styles.spinner} />
          <p>Summoning…</p>
        </div>
      )}

      {npc && (
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
            {savedId === npc.id ? (
              <Link to={`/characters/${npc.id}`} className="btn">
                ✓ Saved · Open sheet
              </Link>
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
