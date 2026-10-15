import type { Scene } from '../../types/models.ts'
import { readAloud, type SceneField } from './generateScene.ts'
import { LOCATION_LABELS, TIME_LABELS, type LocationType, type TimeOfDay } from './tables.ts'
import styles from './SceneCard.module.css'

interface SceneCardProps {
  scene: Scene
  onReroll?: (field: SceneField) => void
}

function RerollButton({ label, onClick }: { label: string; onClick?: () => void }) {
  if (!onClick) return null
  return (
    <button
      type="button"
      className={styles.reroll}
      onClick={onClick}
      aria-label={`Re-roll ${label}`}
      title={`Re-roll ${label}`}
    >
      ↻
    </button>
  )
}

export default function SceneCard({ scene, onReroll }: SceneCardProps) {
  const reroll = (field: SceneField) => (onReroll ? () => onReroll(field) : undefined)
  const [sight, sound, smell] = scene.details

  return (
    <article className={styles.card} aria-label={`Scene ${scene.title}`}>
      <header className={styles.header}>
        <p className={styles.tags}>
          <span>{LOCATION_LABELS[scene.locationType as LocationType] ?? scene.locationType}</span>
          <span aria-hidden="true">◆</span>
          <span>{TIME_LABELS[scene.timeOfDay as TimeOfDay] ?? scene.timeOfDay}</span>
        </p>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{scene.title}</h2>
          <RerollButton label="name" onClick={reroll('title')} />
        </div>
      </header>

      <blockquote className={styles.readAloud}>
        <span className={styles.readAloudLabel}>Read aloud</span>
        <p>{readAloud(scene)}</p>
      </blockquote>

      <dl className={styles.fields}>
        <div>
          <dt>
            Location <RerollButton label="location" onClick={reroll('location')} />
          </dt>
          <dd>{scene.location}</dd>
        </div>
        <div>
          <dt>
            Weather <RerollButton label="weather" onClick={reroll('weather')} />
          </dt>
          <dd>{scene.weather}</dd>
        </div>
        <div>
          <dt>
            Mood <RerollButton label="mood" onClick={reroll('mood')} />
          </dt>
          <dd>{scene.mood}</dd>
        </div>
        <div>
          <dt>
            Details <RerollButton label="details" onClick={reroll('details')} />
          </dt>
          <dd>
            <ul className={styles.senses}>
              {sight && (
                <li>
                  <span>See</span> {sight}
                </li>
              )}
              {sound && (
                <li>
                  <span>Hear</span> {sound}
                </li>
              )}
              {smell && (
                <li>
                  <span>Smell</span> {smell}
                </li>
              )}
            </ul>
          </dd>
        </div>
      </dl>
    </article>
  )
}
