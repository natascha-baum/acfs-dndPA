import { useState, type FormEvent } from 'react'
import PageHeader from '../components/PageHeader.tsx'
import SavedScenes from '../features/scene/SavedScenes.tsx'
import SceneCard from '../features/scene/SceneCard.tsx'
import { generateScene, rollSceneField, type SceneField } from '../features/scene/generateScene.ts'
import { LOCATION_LABELS, LOCATION_TYPES, TIME_LABELS, TIMES_OF_DAY } from '../features/scene/tables.ts'
import { scenes } from '../lib/storage/index.ts'
import type { Scene, SceneOptions } from '../types/models.ts'
import styles from './SceneGenerator.module.css'

const RANDOM = ''

// Newest first.
const loadSaved = () => [...scenes.list()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export default function SceneGenerator() {
  const [locationType, setLocationType] = useState(RANDOM)
  const [timeOfDay, setTimeOfDay] = useState(RANDOM)
  const [lastOptions, setLastOptions] = useState<SceneOptions | null>(null)
  const [scene, setScene] = useState<Scene | null>(null)
  const [saved, setSaved] = useState<Scene[]>(loadSaved)

  const isSaved = scene ? saved.some((s) => s.id === scene.id) : false

  function conjure(options: SceneOptions) {
    setLastOptions(options)
    setScene(generateScene(options))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    conjure({ locationType: locationType || undefined, timeOfDay: timeOfDay || undefined })
  }

  function reroll(field: SceneField) {
    if (!scene) return
    const value = rollSceneField(field, scene.locationType)
    // A changed scene is a new, unsaved draft; the saved original stays as it was.
    setScene({ ...scene, id: crypto.randomUUID(), [field]: value })
  }

  function save() {
    if (!scene) return
    scenes.save(scene)
    setSaved(loadSaved())
  }

  function remove(target: Scene) {
    scenes.remove(target.id)
    setSaved(loadSaved())
  }

  return (
    <>
      <PageHeader title="Scene Generator" icon="scene">
        Paint the world your heroes walk into.
      </PageHeader>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <div className="field">
            <label htmlFor="scene-location">Location</label>
            <select id="scene-location" value={locationType} onChange={(e) => setLocationType(e.target.value)}>
              <option value={RANDOM}>Random</option>
              {LOCATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {LOCATION_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="scene-time">Time of day</label>
            <select id="scene-time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}>
              <option value={RANDOM}>Random</option>
              {TIMES_OF_DAY.map((time) => (
                <option key={time} value={time}>
                  {TIME_LABELS[time]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className={`btn btn-primary ${styles.submit}`}>
          Conjure Scene
        </button>
      </form>

      {scene && (
        <>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn"
              disabled={!lastOptions}
              onClick={() => lastOptions && conjure(lastOptions)}
            >
              ↻ Re-roll scene
            </button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={isSaved}>
              {isSaved ? '✓ Saved' : 'Save scene'}
            </button>
          </div>
          <SceneCard scene={scene} onReroll={reroll} />
        </>
      )}

      <SavedScenes scenes={saved} activeId={scene?.id} onOpen={setScene} onDelete={remove} />
    </>
  )
}
