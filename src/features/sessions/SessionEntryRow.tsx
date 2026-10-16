import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ROLE_LABELS, type NpcRole } from '../npc/tables.ts'
import SceneCard from '../scene/SceneCard.tsx'
import { LOCATION_LABELS, TIME_LABELS } from '../scene/tables.ts'
import type { SessionLine } from './sessions.ts'
import styles from './SessionEntryRow.module.css'

interface SessionEntryRowProps {
  line: SessionLine
  onRemove: () => void
  onOpenMonster: (index: string, name: string) => void
}

const label = (labels: Readonly<Record<string, string>>, key: string) =>
  Object.hasOwn(labels, key) ? labels[key] : key
const isNpcRole = (role: string): role is NpcRole => Object.hasOwn(ROLE_LABELS, role)

function Stats({ hp, ac }: { hp: ReactNode; ac: ReactNode }) {
  return (
    <span className={styles.stats}>
      <span>
        HP <strong>{hp || '—'}</strong>
      </span>
      <span>
        AC <strong>{ac || '—'}</strong>
      </span>
    </span>
  )
}

/** The part of a line that opens the full view: a link, the monster dialog or the unfolded scene. */
interface OpenerProps extends Pick<SessionEntryRowProps, 'line' | 'onOpenMonster'> {
  open: boolean
  onToggle: () => void
}

function Opener({ line, open, onToggle, onOpenMonster }: OpenerProps) {
  switch (line.kind) {
    case 'npc': {
      const { npc } = line
      return (
        <Link to={`/characters/${npc.id}`} className={styles.open}>
          <span className={styles.name}>{npc.name}</span>
          <span className={styles.meta}>
            {isNpcRole(npc.role) && `${ROLE_LABELS[npc.role]} · `}
            {npc.subrace?.name ?? npc.race.name} {npc.class.name} · Level {npc.level}
          </span>
          <Stats hp={npc.hitPoints} ac={npc.armorClass} />
        </Link>
      )
    }
    case 'player': {
      const { player } = line
      return (
        <Link to={`/characters/player/${player.id}`} className={styles.open}>
          <span className={styles.name}>{player.name}</span>
          <span className={styles.meta}>
            {[player.race, player.classLevel].filter(Boolean).join(' · ') || 'Player character'}
          </span>
          {player.sheet && <Stats hp={player.sheet.hitPoints} ac={player.sheet.armorClass} />}
        </Link>
      )
    }
    case 'monster':
      return (
        <button type="button" className={styles.open} onClick={() => onOpenMonster(line.entry.ref, line.name)}>
          <span className={styles.name}>{line.name}</span>
          <span className={styles.meta}>Monster · open the stat block</span>
        </button>
      )
    case 'scene': {
      const { scene } = line
      return (
        <button type="button" className={styles.open} onClick={onToggle} aria-expanded={open}>
          <span className={styles.name}>{scene.title}</span>
          <span className={styles.meta}>
            {label(LOCATION_LABELS, scene.locationType)} · {label(TIME_LABELS, scene.timeOfDay)} ·{' '}
            {open ? 'hide' : 'show'} the scene
          </span>
        </button>
      )
    }
    case 'missing':
      return (
        <span className={styles.open}>
          <span className={`${styles.name} ${styles.gone}`}>{line.name}</span>
          <span className={styles.meta}>No longer saved</span>
        </span>
      )
  }
}

/** One line of a session: name and quick facts, a way to open it, and a remove button. */
export default function SessionEntryRow({ line, onRemove, onOpenMonster }: SessionEntryRowProps) {
  const [open, setOpen] = useState(false)
  return (
    <li className={styles.row}>
      <div className={styles.line}>
        <Opener line={line} open={open} onToggle={() => setOpen((v) => !v)} onOpenMonster={onOpenMonster} />
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Remove ${line.name} from this session`}
          title="Remove from session"
        >
          ✕
        </button>
      </div>
      {open && line.kind === 'scene' && (
        <div className={styles.scene}>
          <SceneCard scene={line.scene} />
        </div>
      )}
    </li>
  )
}
