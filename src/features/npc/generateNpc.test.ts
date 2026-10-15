import { describe, expect, it } from 'vitest'
import { seededRng } from '../../lib/random.ts'
import srd from './__fixtures__/srd-sample.json'
import { generateNpc, type NpcApi } from './generateNpc.ts'

// Real SRD records (from 5e-bits/5e-database) keyed by API path.
const data = srd as Record<string, unknown>
const fakeApi: NpcApi = {
  async get<T>(path: string) {
    if (!(path in data)) throw new Error(`No fixture for ${path}`)
    return structuredClone(data[path]) as T
  },
}

const deps = (seed: number) => ({ api: fakeApi, rng: seededRng(seed), id: 'npc-1', now: new Date(0) })

describe('generateNpc', () => {
  it('builds a valid level 1 fighter from the chosen options', async () => {
    const npc = await generateNpc(
      { role: 'enemy', gender: 'Female', race: 'human', class: 'fighter', level: 1 },
      deps(1),
    )

    expect(npc).toMatchObject({
      id: 'npc-1',
      role: 'enemy',
      gender: 'Female',
      race: { index: 'human' },
      class: { index: 'fighter' },
      level: 1,
      speed: 30,
      proficiencyBonus: 2,
      savingThrows: ['str', 'con'],
      spells: [],
    })
    // Standard array by fighter priority, +1 to everything for humans.
    expect(npc.abilityScores).toEqual({ str: 16, con: 15, dex: 14, wis: 13, cha: 11, int: 9 })
    expect(npc.hitPoints).toBe(12)
    expect(npc.skills).toHaveLength(2)
    expect(npc.skills.every((s) => s.index.startsWith('skill-'))).toBe(true)
    expect(npc.equipment.length).toBeGreaterThan(0)
    expect(npc.armorClass).toBeGreaterThanOrEqual(12)
    expect(npc.name).toMatch(/^\S+ \S+/)
    expect(npc.hook).not.toBe('')
  })

  it('gives a wizard cantrips and spells up to its highest slot', async () => {
    const npc = await generateNpc({ race: 'elf', class: 'wizard', level: 5 }, deps(2))

    expect(npc.subrace?.index).toBe('high-elf')
    expect(npc.abilityScores.int).toBe(18) // 15 + 1 high elf + 2 from one ASI
    expect(npc.proficiencyBonus).toBe(3)
    expect(npc.spells.filter((s) => s.level === 0)).toHaveLength(4)
    expect(npc.spells.filter((s) => s.level > 0)).toHaveLength(9) // INT +4 + level 5
    expect(Math.max(...npc.spells.map((s) => s.level))).toBeLessThanOrEqual(3)
    expect(npc.skills.map((s) => s.index)).toContain('skill-perception') // elven Keen Senses
  })

  it('gives half-elves their two flexible +1 bonuses', async () => {
    const npc = await generateNpc({ race: 'half-elf', class: 'barbarian' }, deps(3))
    // Barbarian priority: str, con, dex, wis, cha, int. CHA +2 is fixed; +1 goes to STR and CON.
    expect(npc.abilityScores).toEqual({ str: 16, con: 15, dex: 13, wis: 12, cha: 12, int: 8 })
    expect(npc.armorClass).toBe(10 + 1 + 2) // unarmored defense
  })

  it('resolves random choices from the API lists', async () => {
    const npc = await generateNpc({}, deps(4))
    expect(['elf', 'half-elf', 'human']).toContain(npc.race.index)
    expect(['fighter', 'wizard', 'monk', 'barbarian']).toContain(npc.class.index)
    expect(['enemy', 'encounter']).toContain(npc.role)
  })

  it('is reproducible with the same seed', async () => {
    const a = await generateNpc({}, deps(7))
    const b = await generateNpc({}, deps(7))
    expect(a).toEqual(b)
  })
})
