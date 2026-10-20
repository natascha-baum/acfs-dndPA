import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'
import SheetToolbar from '../components/SheetToolbar.tsx'
import { loadFeatures } from '../features/character/loadFeatures.ts'
import DetailDialog from '../features/detail/DetailDialog.tsx'
import type { LookupRef } from '../features/detail/resolveDetail.ts'
import NpcCard from '../features/npc/NpcCard.tsx'
import NpcEditor from '../features/npc/NpcEditor.tsx'
import AddToSession from '../features/sessions/AddToSession.tsx'
import { api } from '../lib/api/index.ts'
import { characters, SAVE_FAILED_MESSAGE, sessions } from '../lib/storage/index.ts'
import { useAsync } from '../hooks/useAsync.ts'
import type { Character } from '../types/models.ts'
import styles from './CharacterSheet.module.css'

const loadCharacterFeatures = (character: Character | undefined) =>
  character ? loadFeatures(character, api) : Promise.reject(new Error('Character not found'))

export default function CharacterSheet() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [character, setCharacter] = useState(() => characters.get(id))
  const [lookup, setLookup] = useState<LookupRef | null>(null)
  const [editing, setEditing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const features = useAsync(character, loadCharacterFeatures)

  if (!character) {
    return (
      <>
        <PageHeader title="Character not found">This page of the book is blank.</PageHeader>
        <p className={styles.center}>
          <Link to="/characters">Back to My Characters</Link>
        </p>
      </>
    )
  }

  function remove() {
    if (!character || !window.confirm(`Delete ${character.name}? This cannot be undone.`)) return
    characters.remove(character.id)
    navigate('/characters')
  }

  function saveEdit(edited: Character) {
    try {
      characters.save(edited)
    } catch {
      setSaveError(SAVE_FAILED_MESSAGE)
      return
    }
    setSaveError(null)
    setCharacter(edited)
    setEditing(false)
  }

  if (editing) {
    return (
      <NpcEditor
        npc={character}
        error={saveError}
        onSave={saveEdit}
        onCancel={() => {
          setSaveError(null)
          setEditing(false)
        }}
      />
    )
  }

  return (
    <>
      <SheetToolbar back="/characters" onEdit={() => setEditing(true)} onDelete={remove}>
        <AddToSession entry={{ kind: 'npc', ref: character.id, name: character.name }} collection={sessions} />
      </SheetToolbar>

      <p className={styles.hint}>Tip: click a spell, item, skill or feature to read its full description.</p>

      <NpcCard npc={character} onLookup={setLookup} />

      <section className={styles.features} aria-label="Traits and features">
        {features.status === 'loading' && <p className={styles.muted}>Loading traits and features…</p>}
        {features.status === 'error' && (
          <p className={styles.muted}>Traits and features could not be loaded from the archives right now.</p>
        )}
        {features.status === 'ready' && (
          <div className={styles.columns}>
            <div>
              <h3>Racial Traits</h3>
              {features.data.traits.length === 0 && <p className={styles.muted}>None.</p>}
              <ul className={styles.list}>
                {features.data.traits.map((t) => (
                  <li key={t.index}>
                    <button
                      type="button"
                      className={styles.lookup}
                      onClick={() => setLookup({ kind: 'trait', index: t.index, name: t.name })}
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Class Features</h3>
              {features.data.features.length === 0 && <p className={styles.muted}>None.</p>}
              <ul className={styles.list}>
                {features.data.features.map((f) => (
                  <li key={f.index}>
                    <button
                      type="button"
                      className={styles.lookup}
                      onClick={() => setLookup({ kind: 'feature', index: f.index, name: f.name })}
                    >
                      {f.name}
                    </button>{' '}
                    <span className={styles.muted}>Lv {f.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {character.notes && (
          <>
            <h3>Notes</h3>
            <p className={styles.notes}>{character.notes}</p>
          </>
        )}
      </section>

      {lookup && <DetailDialog key={`${lookup.kind}-${lookup.index}`} lookup={lookup} onClose={() => setLookup(null)} />}
    </>
  )
}
