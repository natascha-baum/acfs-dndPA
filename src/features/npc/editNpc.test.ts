import { describe, expect, it } from 'vitest'
import type { Character } from '../../types/models.ts'
import { customRef, finishEdit, isCustom, SKILL_REFS } from './editNpc.ts'

const base: Character = {
  id: 'a',
  name: 'Orla',
  role: 'enemy',
  gender: 'Female',
  race: { index: 'human', name: 'Human', url: '/api/2014/races/human' },
  class: { index: 'fighter', name: 'Fighter', url: '/api/2014/classes/fighter' },
  level: 3,
  abilityScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  hitPoints: 28,
  armorClass: 16,
  speed: 30,
  proficiencyBonus: 2,
  savingThrows: ['str', 'con'],
  skills: [],
  proficiencies: [],
  spells: [],
  equipment: [],
  appearance: 'Tall',
  personality: 'Grim',
  hook: 'Hunts the party',
  notes: '',
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-15T00:00:00.000Z',
}

describe('finishEdit', () => {
  it('trims text, clamps numbers and keeps old values for empty boxes', () => {
    const edited = {
      ...base,
      name: '  Orla the Red ',
      notes: ' owes the party a favor \n',
      level: 25,
      hitPoints: Number.NaN,
      abilityScores: { ...base.abilityScores, str: 40, cha: 0 },
    }
    const done = finishEdit(edited, base)
    expect(done.name).toBe('Orla the Red')
    expect(done.notes).toBe('owes the party a favor')
    expect(done.level).toBe(20)
    expect(done.hitPoints).toBe(28)
    expect(done.abilityScores).toMatchObject({ str: 30, cha: 1 })
    expect(done.updatedAt > base.updatedAt).toBe(true)
  })

  it('keeps the old name when the new one is empty', () => {
    expect(finishEdit({ ...base, name: '  ' }, base).name).toBe('Orla')
  })
})

describe('custom entries', () => {
  it('have no url and a unique index', () => {
    const a = customRef('Lucky coin')
    expect(isCustom(a)).toBe(true)
    expect(a.name).toBe('Lucky coin')
    expect(a.index).toMatch(/^custom-lucky-coin-/)
    expect(customRef('Lucky coin').index).not.toBe(a.index)
  })
})

describe('SKILL_REFS', () => {
  it('lists all 18 skills with API names', () => {
    expect(SKILL_REFS).toHaveLength(18)
    expect(SKILL_REFS.find((s) => s.index === 'skill-sleight-of-hand')?.name).toBe('Skill: Sleight of Hand')
    expect(SKILL_REFS.find((s) => s.index === 'skill-animal-handling')?.name).toBe('Skill: Animal Handling')
  })
})
