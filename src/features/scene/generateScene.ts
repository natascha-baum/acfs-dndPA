import { defaultRng, pick, type Rng } from '../../lib/random.ts'
import { rollTable } from '../../lib/randomTable.ts'
import type { RandomTable, Scene, SceneOptions } from '../../types/models.ts'
import {
  INDOOR,
  LOCATION_TYPES,
  OUTDOOR_WEATHER,
  SCENE_TABLES,
  TIMES_OF_DAY,
  TIME_OPENINGS,
  type LocationType,
  type TimeOfDay,
} from './tables.ts'

export type SceneField = 'title' | 'location' | 'weather' | 'mood' | 'details'

interface Deps {
  rng?: Rng
  id?: string
  now?: Date
}

const isLocationType = (value: string): value is LocationType =>
  (LOCATION_TYPES as readonly string[]).includes(value)

function weatherTable(type: LocationType): RandomTable {
  const local = SCENE_TABLES[type].weather
  if (INDOOR.has(type) && local) return local
  // Outdoors: the shared weather, plus anything typical for this place.
  return local
    ? { ...OUTDOOR_WEATHER, entries: [...OUTDOOR_WEATHER.entries, ...local.entries] }
    : OUTDOOR_WEATHER
}

/** Rolls one part of a scene; used for generation and per-field re-rolls. */
export function rollSceneField(
  field: SceneField,
  locationType: string,
  rng: Rng = defaultRng,
): string | string[] {
  const type = isLocationType(locationType) ? locationType : 'forest'
  const tables = SCENE_TABLES[type]
  switch (field) {
    case 'title':
      return `The ${rollTable(tables.adjective, rng)} ${rollTable(tables.noun, rng)}`
    case 'location':
      return rollTable(tables.location, rng)
    case 'weather':
      return rollTable(weatherTable(type), rng)
    case 'mood':
      return rollTable(tables.mood, rng)
    case 'details':
      return [rollTable(tables.sight, rng), rollTable(tables.sound, rng), rollTable(tables.smell, rng)]
  }
}

export function generateScene(options: SceneOptions, deps: Deps = {}): Scene {
  const rng = deps.rng ?? defaultRng
  const locationType =
    options.locationType && isLocationType(options.locationType)
      ? options.locationType
      : pick(LOCATION_TYPES, rng)
  const timeOfDay = options.timeOfDay ?? pick(TIMES_OF_DAY, rng)
  const roll = (field: SceneField) => rollSceneField(field, locationType, rng)

  return {
    id: deps.id ?? crypto.randomUUID(),
    title: roll('title') as string,
    locationType,
    location: roll('location') as string,
    timeOfDay,
    weather: roll('weather') as string,
    mood: roll('mood') as string,
    details: roll('details') as string[],
    createdAt: (deps.now ?? new Date()).toISOString(),
  }
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** A short paragraph the DM can read aloud to the table. */
export function readAloud(scene: Scene): string {
  const opening = TIME_OPENINGS[scene.timeOfDay as TimeOfDay] ?? 'Before you'
  const [sight, sound, smell] = scene.details
  const sentences = [
    `${opening}, you arrive at ${scene.location}.`,
    `${capitalize(scene.weather)}.`,
    sight && `You notice ${sight}.`,
    sound && `You hear ${sound}.`,
    smell && `The air carries the smell of ${smell}.`,
    `The place feels ${scene.mood}.`,
  ]
  return sentences.filter(Boolean).join(' ')
}
