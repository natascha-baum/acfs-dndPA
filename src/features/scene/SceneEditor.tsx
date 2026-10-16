import { useState, type FormEvent } from 'react'
import { EditSection, EditorActions, TextField } from '../../components/editor/fields.tsx'
import ed from '../../components/editor/editor.module.css'
import type { Scene, TavernDetails } from '../../types/models.ts'
import { finishSceneEdit } from './editScene.ts'
import { readAloud } from './generateScene.ts'
import { LOCATION_LABELS, LOCATION_TYPES, TIME_LABELS, TIMES_OF_DAY } from './tables.ts'

interface SceneEditorProps {
  scene: Scene
  onSave: (edited: Scene) => void
  onCancel: () => void
  error?: string | null
}

export default function SceneEditor({ scene, onSave, onCancel, error }: SceneEditorProps) {
  const [draft, setDraft] = useState<Scene>({
    ...scene,
    details: [0, 1, 2].map((i) => scene.details[i] ?? ''),
    // Three menu lines to fill in; empty ones are dropped on save.
    ...(scene.tavern && { tavern: { ...scene.tavern, menu: [0, 1, 2].map((i) => scene.tavern?.menu[i] ?? '') } }),
  })
  const set = <K extends keyof Scene>(key: K, value: Scene[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const setDetail = (i: number, value: string) => set('details', draft.details.map((d, j) => (j === i ? value : d)))
  const tavern = draft.tavern
  const setTavern = (patch: Partial<TavernDetails>) => tavern && set('tavern', { ...tavern, ...patch })
  const setMenu = (i: number, value: string) => tavern && setTavern({ menu: tavern.menu.map((m, j) => (j === i ? value : m)) })

  function submit(event: FormEvent) {
    event.preventDefault()
    onSave(finishSceneEdit(draft, scene))
  }

  return (
    <form className={ed.form} onSubmit={submit} aria-label={`Edit ${scene.title}`}>
      <h2 className={ed.heading}>Edit {scene.title}</h2>
      <p className={ed.intro}>Rewrite any part of the scene, then save.</p>

      <EditSection title="Place">
        <TextField label="Name" value={draft.title} onChange={(v) => set('title', v)} required full />
        <div className="field">
          <label htmlFor="scene-edit-type">Location type</label>
          <select id="scene-edit-type" value={draft.locationType} onChange={(e) => set('locationType', e.target.value)}>
            {LOCATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {LOCATION_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="scene-edit-time">Time of day</label>
          <select id="scene-edit-time" value={draft.timeOfDay} onChange={(e) => set('timeOfDay', e.target.value)}>
            {TIMES_OF_DAY.map((t) => (
              <option key={t} value={t}>
                {TIME_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <TextField label="Location" value={draft.location} onChange={(v) => set('location', v)} multiline={2} />
        <TextField label="Weather" value={draft.weather} onChange={(v) => set('weather', v)} full />
        <TextField label="Mood" value={draft.mood} onChange={(v) => set('mood', v)} full />
      </EditSection>

      <EditSection title="Details">
        <TextField label="See" value={draft.details[0]} onChange={(v) => setDetail(0, v)} full />
        <TextField label="Hear" value={draft.details[1]} onChange={(v) => setDetail(1, v)} full />
        <TextField label="Smell" value={draft.details[2]} onChange={(v) => setDetail(2, v)} full />
      </EditSection>

      {tavern && draft.locationType === 'tavern' && (
        <EditSection title="Tavern">
          <TextField label="Innkeeper" value={tavern.innkeeper} onChange={(v) => setTavern({ innkeeper: v })} full />
          {tavern.menu.map((item, i) => (
            <TextField key={i} label={`Menu ${i + 1}`} value={item} onChange={(v) => setMenu(i, v)} full />
          ))}
          <TextField label="Rumor" value={tavern.rumor} onChange={(v) => setTavern({ rumor: v })} multiline={2} />
        </EditSection>
      )}

      <EditSection title="Read aloud">
        <TextField
          label="Own read-aloud text"
          value={draft.readAloud ?? ''}
          onChange={(v) => set('readAloud', v)}
          multiline={5}
          placeholder={readAloud({ ...draft, readAloud: undefined })}
        />
        <p className={`${ed.empty} ${ed.full}`}>Leave it empty to build the text from the fields above.</p>
        <TextField label="Notes" value={draft.notes ?? ''} onChange={(v) => set('notes', v)} multiline={3} />
      </EditSection>

      <EditorActions onCancel={onCancel} error={error} />
    </form>
  )
}
