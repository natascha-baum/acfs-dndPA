import { useState, type FormEvent } from 'react'
import PageHeader from '../components/PageHeader.tsx'
import SavedScenes from '../features/scene/SavedScenes.tsx'
import SceneCard from '../features/scene/SceneCard.tsx'
import SceneEditor from '../features/scene/SceneEditor.tsx'
import AddToSession from '../features/sessions/AddToSession.tsx'
import { generateScene, rollSceneField, type SceneField } from '../features/scene/generateScene.ts'
import { LOCATION_LABELS, LOCATION_TYPES, TIME_LABELS, TIMES_OF_DAY } from '../features/scene/tables.ts'
import { SAVE_FAILED_MESSAGE, scenes, sessions } from '../lib/storage/index.ts'
import type { Scene, SceneOptions } from '../types/models.ts'
import styles from './SceneGenerator.module.css'

const RANDOM = ''

// Newest first.
const loadSaved = () => [...scenes.list()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export default function SceneGenerator() {
  const [lastOptions, setLastOptions] = useState<SceneOptions | null>(null)
  const [scene, setScene] = useState<Scene | null>(null)
  const [saved, setSaved] = useState<Scene[]>(loadSaved)
  const [saveError, setSaveError] = useState(false)
  const [editing, setEditing] = useState(false)

  const isSaved = scene ? saved.some((s) => s.id === scene.id) : false

  function conjure(options: SceneOptions) {
    setLastOptions(options)
    setScene(generateScene(options))
    setEditing(false)
  }

  function reroll(field: SceneField) {
    if (!scene) return
    const value = rollSceneField(field, scene.locationType)
    // A changed scene is a new, unsaved draft; the saved original stays as it was.
    // An own read-aloud text would no longer match the new field, so it is dropped
    // (the tavern details are not part of the read-aloud text).
    const readAloud = field === 'tavern' ? scene.readAloud : undefined
    setScene({ ...scene, id: crypto.randomUUID(), [field]: value, readAloud })
  }

  function save() {
    if (!scene) return
    try {
      scenes.save(scene)
    } catch {
      setSaveError(true)
      return
    }
    setSaveError(false)
    setSaved(loadSaved())
  }

  function saveEdit(edited: Scene) {
    // Edits to a saved scene are saved right away; a new draft stays unsaved.
    if (isSaved) {
      try {
        scenes.save(edited)
      } catch {
        setSaveError(true)
        return
      }
      setSaved(loadSaved())
    }
    setSaveError(false)
    setScene(edited)
    setEditing(false)
  }

  function open(target: Scene) {
    setScene(target)
    setEditing(false)
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

      <SceneOptionsForm onConjure={conjure} />

      {scene && editing && (
        <SceneEditor
          scene={scene}
          error={saveError ? SAVE_FAILED_MESSAGE : null}
          onSave={saveEdit}
          onCancel={() => {
            setSaveError(false)
            setEditing(false)
          }}
        />
      )}

      {scene && !editing && (
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
            <button type="button" className="btn" onClick={() => setEditing(true)}>
              ✎ Edit
            </button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={isSaved}>
              {isSaved ? '✓ Saved' : 'Save scene'}
            </button>
            {isSaved && (
              <AddToSession
                key={scene.id}
                entry={{ kind: 'scene', ref: scene.id, name: scene.title }}
                collection={sessions}
              />
            )}
          </div>
          {saveError && (
            <p className="notice-error" role="alert">
              {SAVE_FAILED_MESSAGE}
            </p>
          )}
          <SceneCard scene={scene} onReroll={reroll} />
        </>
      )}

      <SavedScenes scenes={saved} activeId={scene?.id} onOpen={open} onDelete={remove} />
    </>
  )
}

/** The location and time of day for the next scene; "Random" leaves them to the dice. */
function SceneOptionsForm({ onConjure }: { onConjure: (options: SceneOptions) => void }) {
  const [locationType, setLocationType] = useState(RANDOM)
  const [timeOfDay, setTimeOfDay] = useState(RANDOM)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onConjure({ locationType: locationType || undefined, timeOfDay: timeOfDay || undefined })
  }

  return (
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
  )
}
