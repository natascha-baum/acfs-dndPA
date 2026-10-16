import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'
import { ROLE_LABELS, type NpcRole } from '../features/npc/tables.ts'
import BackupPanel from '../features/backup/BackupPanel.tsx'
import SheetUpload from '../features/player/SheetUpload.tsx'
import { formatBytes } from '../features/player/format.ts'
import { characters, playerSheetFiles, playerSheets } from '../lib/storage/index.ts'
import type { Character, PlayerSheet } from '../types/models.ts'
import styles from './Characters.module.css'

type Tab = 'npcs' | 'players'

// Most recently changed first.
const newestFirst = <T extends { updatedAt: string }>(items: T[]) =>
  [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
const loadNpcs = () => newestFirst(characters.list())
const loadPlayers = () => newestFirst(playerSheets.list())

export default function Characters() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'players' ? 'players' : 'npcs'
  const [npcs, setNpcs] = useState<Character[]>(loadNpcs)
  const [players, setPlayers] = useState<PlayerSheet[]>(loadPlayers)

  function removeNpc(character: Character) {
    if (!window.confirm(`Delete ${character.name}? This cannot be undone.`)) return
    characters.remove(character.id)
    setNpcs(loadNpcs())
  }

  function removePlayer(sheet: PlayerSheet) {
    if (!window.confirm(`Delete ${sheet.name} and the uploaded sheet? This cannot be undone.`)) return
    playerSheets.remove(sheet.id)
    void playerSheetFiles.remove(sheet.id)
    setPlayers(loadPlayers())
  }

  const tabs: { id: Tab; label: string; short: string; count: number }[] = [
    { id: 'npcs', label: 'NPCs & Enemies', short: 'NPCs & Enemies', count: npcs.length },
    { id: 'players', label: 'Player Characters', short: 'Players', count: players.length },
  ]

  return (
    <>
      <PageHeader title="My Characters" icon="characters">
        Every legend is written down somewhere.
      </PageHeader>

      <div className={styles.tabs} role="tablist" aria-label="Character type">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className={styles.tab}
            onClick={() => setParams(t.id === 'npcs' ? {} : { tab: t.id }, { replace: true })}
          >
            <span className={styles.long}>{t.label}</span>
            <span className={styles.short}>{t.short}</span> <span className={styles.count}>{t.count}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'npcs' ? (
          npcs.length === 0 ? (
            <div className={styles.empty}>
              <p>Your book of heroes is still empty.</p>
              <Link to="/generate/character" className="btn btn-primary">
                Summon your first NPC
              </Link>
            </div>
          ) : (
            <ul className={styles.grid}>
              {npcs.map((c) => (
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
                    onClick={() => removeNpc(c)}
                    aria-label={`Delete ${c.name}`}
                    title="Delete"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <>
            <SheetUpload onSaved={() => setPlayers(loadPlayers())} />
            {players.length === 0 ? (
              <p className={styles.emptyLine}>No player characters yet. Upload your sheet to keep it at hand.</p>
            ) : (
              <ul className={`${styles.grid} ${styles.below}`}>
                {players.map((s) => (
                  <li key={s.id} className={styles.card}>
                    <Link to={`/characters/player/${s.id}`} className={styles.open}>
                      <span className={`${styles.badge} ${styles.player}`}>Player</span>
                      <span className={styles.name}>{s.name}</span>
                      <span className={styles.meta}>
                        {[s.race, s.classLevel].filter(Boolean).join(' · ') || 'Character sheet'}
                      </span>
                      <span className={styles.stats}>
                        {s.sheet?.hitPoints || s.sheet?.armorClass ? (
                          <>
                            <span>
                              HP <strong>{s.sheet.hitPoints || '—'}</strong>
                            </span>
                            <span>
                              AC <strong>{s.sheet.armorClass || '—'}</strong>
                            </span>
                          </>
                        ) : (
                          <span>
                            PDF <strong>{formatBytes(s.fileSize)}</strong>
                          </span>
                        )}
                      </span>
                    </Link>
                    <button
                      type="button"
                      className={styles.delete}
                      onClick={() => removePlayer(s)}
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
        )}
      </div>

      <BackupPanel
        onImported={() => {
          setNpcs(loadNpcs())
          setPlayers(loadPlayers())
        }}
      />
    </>
  )
}
