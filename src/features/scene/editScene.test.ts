import { describe, expect, it } from 'vitest'
import type { Scene } from '../../types/models.ts'
import { readAloud } from './generateScene.ts'
import { finishSceneEdit } from './editScene.ts'

const scene: Scene = {
  id: 's1',
  title: 'The Whispering Hollow',
  locationType: 'forest',
  location: 'a clearing ringed by old oaks',
  timeOfDay: 'dusk',
  weather: 'a light drizzle',
  mood: 'watchful',
  details: ['a broken cart', 'distant howling', 'wet moss'],
  createdAt: '2026-10-15T00:00:00.000Z',
}

describe('finishSceneEdit', () => {
  it('trims fields and keeps the title when it was emptied', () => {
    const done = finishSceneEdit({ ...scene, title: ' ', mood: ' tense ', notes: '  ' }, scene)
    expect(done.title).toBe(scene.title)
    expect(done.mood).toBe('tense')
    expect(done).not.toHaveProperty('notes')
  })

  it('keeps an own read-aloud text but drops one equal to the generated text', () => {
    expect(finishSceneEdit({ ...scene, readAloud: ' My own words. ' }, scene).readAloud).toBe('My own words.')
    expect(finishSceneEdit({ ...scene, readAloud: readAloud(scene) }, scene)).not.toHaveProperty('readAloud')
  })
})
