import type { Scene } from '../../types/models.ts'
import { readAloud } from './generateScene.ts'

/** Cleans up an edited scene: trims text and keeps the old title if it was emptied. */
export function finishSceneEdit(edited: Scene, original: Scene): Scene {
  const details = edited.details.map((d) => d.trim())
  const result: Scene = {
    ...edited,
    title: edited.title.trim() || original.title,
    location: edited.location.trim(),
    weather: edited.weather.trim(),
    mood: edited.mood.trim(),
    details,
  }
  const custom = edited.readAloud?.trim()
  // Text equal to the generated paragraph is not really custom: keep it in sync with the fields.
  if (custom && custom !== readAloud({ ...result, readAloud: undefined })) result.readAloud = custom
  else delete result.readAloud
  const notes = edited.notes?.trim()
  if (notes) result.notes = notes
  else delete result.notes
  return result
}
