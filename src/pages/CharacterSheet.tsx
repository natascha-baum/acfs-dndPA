import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'
import { loadFeatures, type CharacterFeatures } from '../features/character/loadFeatures.ts'
import DetailDialog from '../features/detail/DetailDialog.tsx'
import type { LookupRef } from '../features/detail/resolveDetail.ts'
import NpcCard from '../features/npc/NpcCard.tsx'
import { api } from '../lib/api/index.ts'
import { characters } from '../lib/storage/index.ts'
import styles from './CharacterSheet.module.css'

type FeatureState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: CharacterFeatures }

export default function CharacterSheet() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [character] = useState(() => characters.get(id))
  const [lookup, setLookup] = useState<LookupRef | null>(null)
  const [features, setFeatures] = useState<FeatureState>({ status: 'loading' })

  useEffect(() => {
    if (!character) return
    let cancelled = false
    loadFeatures(character, api)
      .then((data) => !cancelled && setFeatures({ status: 'ready', data }))
      .catch(() => !cancelled && setFeatures({ status: 'error' }))
    return () => {
      cancelled = true
    }
  }, [character])

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

  return (
    <>
      <div className={styles.toolbar}>
        <Link to="/characters" className="btn">
          ← My Characters
        </Link>
        <button type="button" className="btn" onClick={remove}>
          Delete
        </button>
      </div>

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
