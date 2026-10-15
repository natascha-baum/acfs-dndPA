import type { ApiRef, Character } from '../../types/models.ts'

export interface FeaturesApi {
  get<T>(path: string): Promise<T>
}

export interface CharacterFeatures {
  traits: ApiRef[]
  features: (ApiRef & { level: number })[]
}

/** Racial traits and the class features gained up to the character's level. */
export async function loadFeatures(character: Character, api: FeaturesApi): Promise<CharacterFeatures> {
  const levels = Array.from({ length: character.level }, (_, i) => i + 1)
  const [race, subrace, classLevels] = await Promise.all([
    api.get<{ traits?: ApiRef[] }>(`races/${character.race.index}`),
    character.subrace
      ? api.get<{ racial_traits?: ApiRef[] }>(`subraces/${character.subrace.index}`)
      : Promise.resolve(undefined),
    Promise.all(
      levels.map((level) =>
        api.get<{ features?: ApiRef[] }>(`classes/${character.class.index}/levels/${level}`),
      ),
    ),
  ])

  const seen = new Set<string>()
  const features = classLevels.flatMap((data, i) =>
    (data.features ?? [])
      .filter((f) => !seen.has(f.index) && seen.add(f.index))
      .map((f) => ({ ...f, level: i + 1 })),
  )
  return { traits: [...(race.traits ?? []), ...(subrace?.racial_traits ?? [])], features }
}
