import { describe, expect, it } from 'vitest'
import type { Character } from '../../types/models.ts'
import { loadFeatures } from './loadFeatures.ts'

const ref = (index: string) => ({ index, name: index, url: '' })

const data: Record<string, unknown> = {
  'races/elf': { traits: [ref('darkvision'), ref('keen-senses')] },
  'subraces/high-elf': { racial_traits: [ref('elf-weapon-training')] },
  'classes/fighter/levels/1': { features: [ref('fighting-style'), ref('second-wind')] },
  'classes/fighter/levels/2': { features: [ref('action-surge-1-use')] },
  'classes/fighter/levels/3': { features: [ref('martial-archetype'), ref('second-wind')] },
}
const api = { get: async <T,>(path: string) => data[path] as T }

describe('loadFeatures', () => {
  it('collects racial traits and class features up to the level', async () => {
    const character = {
      race: ref('elf'),
      subrace: ref('high-elf'),
      class: ref('fighter'),
      level: 3,
    } as Character

    const result = await loadFeatures(character, api)

    expect(result.traits.map((t) => t.index)).toEqual(['darkvision', 'keen-senses', 'elf-weapon-training'])
    expect(result.features.map((f) => [f.index, f.level])).toEqual([
      ['fighting-style', 1],
      ['second-wind', 1],
      ['action-surge-1-use', 2],
      ['martial-archetype', 3],
    ])
  })
})
