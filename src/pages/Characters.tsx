import { useState } from 'react'
import { Link } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'
import { ROLE_LABELS, type NpcRole } from '../features/npc/tables.ts'
import { characters } from '../lib/storage/index.ts'
import type { Character } from '../types/models.ts'
import styles from './Characters.module.css'

// Most recently changed first.
const loadAll = () => [...characters.list()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

export default function Characters() {
  const [all, setAll] = useState<Character[]>(loadAll)

  function remove(character: Character) {
    if (!window.confirm(`Delete ${character.name}? This cannot be undone.`)) return
    characters.remove(character.id)
    setAll(loadAll())
  }

  return (
    <>
      <PageHeader title="My Characters" icon="characters">
        Every legend is written down somewhere.
      </PageHeader>

      {all.length === 0 ? (
        <div className={styles.empty}>
          <p>Your book of heroes is still empty.</p>
          <Link to="/generate/character" className="btn btn-primary">
            Summon your first NPC
          </Link>
        </div>
      ) : (
        <ul className={styles.grid}>
          {all.map((c) => (
            <li key={c.id} className={styles.card}>
              <Link to={`/characters/${c.id}`} className={styles.open}>
                {c.role !== 'player' && (
                  <span className={`${styles.badge} ${c.role === 'enemy' ? styles.enemy : styles.encounter}`}>
                    {ROLE_LABELS[c.role as NpcRole]}
                  </span>
                )}
                <span className={styles.name}>{c.name}</span>
                <span className={styles.meta}>
                  {c.subrace?.name ?? c.race.name} {c.class.name} · Level {c.level}
                </span>
                <span className={styles.stats}>
                  <span>
                    HP <strong>{c.hitPoints}</strong>
                  </span>
                  <span>
                    AC <strong>{c.armorClass}</strong>
                  </span>
                </span>
              </Link>
              <button
                type="button"
                className={styles.delete}
                onClick={() => remove(c)}
                aria-label={`Delete ${c.name}`}
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
