import { describe, expect, it } from 'vitest'
import { seededRng } from '../../lib/random.ts'
import { generateScene, readAloud, rollSceneField, rollTavern } from './generateScene.ts'
import { MENU, RUMORS } from './tavernTables.ts'
import { INDOOR, LOCATION_TYPES, OUTDOOR_WEATHER, SCENE_TABLES, TIMES_OF_DAY } from './tables.ts'

describe('generateScene', () => {
  it('uses the chosen location type and time of day', () => {
    const scene = generateScene(
      { locationType: 'tavern', timeOfDay: 'night' },
      { rng: seededRng(1), id: 's1', now: new Date(0) },
    )
    expect(scene).toMatchObject({ id: 's1', locationType: 'tavern', timeOfDay: 'night' })
    expect(scene.title).toMatch(/^The \S+ \S+$/)
    expect(SCENE_TABLES.tavern.location.entries.map((e) => e.text)).toContain(scene.location)
    expect(SCENE_TABLES.tavern.weather!.entries.map((e) => e.text)).toContain(scene.weather)
    expect(scene.details).toHaveLength(3)
  })

  it('picks random options when none are given', () => {
    const scene = generateScene({}, { rng: seededRng(2) })
    expect(LOCATION_TYPES).toContain(scene.locationType)
    expect(TIMES_OF_DAY).toContain(scene.timeOfDay)
  })

  it('gives indoor places their own weather and outdoor places the shared table', () => {
    for (const type of LOCATION_TYPES) {
      const weathers = new Set(
        Array.from({ length: 200 }, (_, i) => rollSceneField('weather', type, seededRng(i)) as string),
      )
      const outdoor = OUTDOOR_WEATHER.entries.map((e) => e.text)
      const usesOutdoor = [...weathers].some((w) => outdoor.includes(w))
      expect(usesOutdoor).toBe(!INDOOR.has(type))
    }
  })

  it('every table has entries', () => {
    for (const tables of Object.values(SCENE_TABLES)) {
      for (const t of Object.values(tables)) expect(t.entries.length).toBeGreaterThan(0)
    }
  })

  it('writes a read-aloud paragraph from the scene', () => {
    const text = readAloud({
      id: 'x',
      title: 'The Silent Glade',
      locationType: 'forest',
      location: 'a quiet glade',
      timeOfDay: 'dusk',
      weather: 'a thin, drifting fog',
      mood: 'eerie and too quiet',
      details: ['a broken arrow', 'distant howling', 'damp earth'],
      createdAt: '',
    })
    expect(text).toBe(
      'As dusk settles in, you arrive at a quiet glade. A thin, drifting fog. You notice a broken arrow. ' +
        'You hear distant howling. The air carries the smell of damp earth. The place feels eerie and too quiet.',
    )
  })
})

describe('tavern details', () => {
  const tavernScene = (seed: number) => generateScene({ locationType: 'tavern' }, { rng: seededRng(seed) })

  it('gives a tavern scene an innkeeper, three different menu entries and a rumor', () => {
    const { tavern } = tavernScene(3)
    expect(tavern?.innkeeper).toMatch(/^\S+ \S+, an? [a-z-]+ innkeeper who .+/)
    expect(tavern?.menu).toHaveLength(3)
    expect(new Set(tavern?.menu).size).toBe(3)
    expect(tavern?.menu.every((m) => MENU.entries.some((e) => e.text === m))).toBe(true)
    expect(RUMORS.entries.map((e) => e.text)).toContain(tavern?.rumor)
  })

  it('leaves other places without tavern details', () => {
    expect(generateScene({ locationType: 'forest' }, { rng: seededRng(3) }).tavern).toBeUndefined()
  })

  it('is reproducible with the same seed', () => {
    expect(tavernScene(9).tavern).toEqual(tavernScene(9).tavern)
  })

  it('uses "an" before a vowel and "a" before a consonant', () => {
    const innkeepers = Array.from({ length: 200 }, (_, i) => rollTavern(seededRng(i)).innkeeper)
    expect(innkeepers.some((text) => text.includes(', an elf innkeeper'))).toBe(true)
    expect(innkeepers.some((text) => text.includes(', a dwarf innkeeper'))).toBe(true)
    expect(innkeepers.some((text) => /, a [aeiou]/.test(text))).toBe(false)
    expect(innkeepers.some((text) => /, an [^aeiou]/.test(text))).toBe(false)
  })

  it('re-rolls the whole block as one field', () => {
    const block = rollSceneField('tavern', 'tavern', seededRng(4))
    expect(block).toEqual(rollTavern(seededRng(4)))
  })
})
