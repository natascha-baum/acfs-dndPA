import type { Scene } from '../../types/models.ts'
import { LOCATION_LABELS, TIME_LABELS, type LocationType, type TimeOfDay } from './tables.ts'
import styles from './SavedScenes.module.css'

interface SavedScenesProps {
  scenes: Scene[]
  activeId?: string
  onOpen: (scene: Scene) => void
  onDelete: (scene: Scene) => void
}

export default function SavedScenes({ scenes, activeId, onOpen, onDelete }: SavedScenesProps) {
  return (
    <section className={styles.section} aria-labelledby="saved-scenes">
      <h2 id="saved-scenes" className={styles.heading}>
        Saved Scenes <span className={styles.count}>{scenes.length}</span>
      </h2>
      {scenes.length === 0 ? (
        <p className={styles.empty}>No scenes saved yet. Conjure one and keep it for your next session.</p>
      ) : (
        <ul className={styles.list}>
          {scenes.map((scene) => (
            <li key={scene.id} className={scene.id === activeId ? styles.active : undefined}>
              <button type="button" className={styles.open} onClick={() => onOpen(scene)}>
                <span className={styles.title}>{scene.title}</span>
                <span className={styles.meta}>
                  {LOCATION_LABELS[scene.locationType as LocationType] ?? scene.locationType} ·{' '}
                  {TIME_LABELS[scene.timeOfDay as TimeOfDay] ?? scene.timeOfDay} · {scene.weather}
                </span>
              </button>
              <button
                type="button"
                className={styles.delete}
                onClick={() => onDelete(scene)}
                aria-label={`Delete ${scene.title}`}
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
