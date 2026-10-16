import { defaultRng, pick, type Rng } from '../../lib/random.ts'
import { rollDistinct, rollTable } from '../../lib/randomTable.ts'
import type { RandomTable, Scene, SceneOptions, TavernDetails } from '../../types/models.ts'
import { rollName } from '../npc/generateNpc.ts'
import { NAMES } from '../npc/tables.ts'
import { INNKEEPER_QUIRKS, MENU, RUMORS } from './tavernTables.ts'
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

export type SceneField = 'title' | 'location' | 'weather' | 'mood' | 'details' | 'tavern'

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

const MENU_SIZE = 3
/** Races that have name lists, e.g. "elf", "half-orc". */
const INNKEEPER_RACES = Object.keys(NAMES)

/** Innkeeper, menu and rumor of a tavern scene. */
export function rollTavern(rng: Rng = defaultRng): TavernDetails {
  const race = pick(INNKEEPER_RACES, rng)
  const name = rollName(race, 'any', rng)
  const article = /^[aeiou]/.test(race) ? 'an' : 'a'
  return {
    innkeeper: `${name}, ${article} ${race} innkeeper who ${rollTable(INNKEEPER_QUIRKS, rng)}`,
    menu: rollDistinct(MENU, MENU_SIZE, rng),
    rumor: rollTable(RUMORS, rng),
  }
}

/** Rolls one part of a scene; used for generation and per-field re-rolls. */
export function rollSceneField(
  field: SceneField,
  locationType: string,
  rng: Rng = defaultRng,
): string | string[] | TavernDetails {
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
    case 'tavern':
      return rollTavern(rng)
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
    ...(locationType === 'tavern' && { tavern: rollTavern(rng) }),
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
