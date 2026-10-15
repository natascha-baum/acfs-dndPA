import { describe, expect, it } from 'vitest'
import type { Equipment } from '../../lib/api/types.ts'
import {
  abilityModifier,
  applyImprovements,
  armorClass,
  assignStandardArray,
  highestSpellSlot,
  hitPoints,
  leveledSpellCount,
} from './rules.ts'
import { ABILITY_PRIORITY } from './tables.ts'

const scores = { str: 10, dex: 14, con: 12, int: 10, wis: 16, cha: 8 }
const armor = (index: string, extra: Partial<Equipment>): Equipment => ({
  index,
  name: index,
  equipment_category: { index: 'armor', name: 'Armor', url: '' },
  ...extra,
})

describe('ability scores', () => {
  it('computes modifiers', () => {
    expect([1, 8, 9, 10, 11, 15, 20].map(abilityModifier)).toEqual([-5, -1, -1, 0, 0, 2, 5])
  })

  it('assigns the standard array by class priority', () => {
    expect(assignStandardArray(ABILITY_PRIORITY.wizard)).toEqual({
      int: 15, con: 14, dex: 13, wis: 12, cha: 10, str: 8,
    })
  })

  it('spends improvements on top abilities without exceeding 20', () => {
    const base = { str: 19, dex: 10, con: 14, int: 8, wis: 10, cha: 10 }
    expect(applyImprovements(base, 2, ['str', 'con', 'dex', 'wis', 'cha', 'int'])).toMatchObject({
      str: 20,
      con: 17,
    })
  })
})

describe('hitPoints', () => {
  it('uses the max hit die at level 1 and the average afterwards', () => {
    expect(hitPoints(10, 1, 2)).toBe(12)
    expect(hitPoints(10, 5, 2)).toBe(12 + 4 * 8)
    expect(hitPoints(6, 3, -1)).toBe(5 + 2 * 3)
  })
})

describe('armorClass', () => {
  it('uses 10 + DEX without armor', () => {
    expect(armorClass({ classIndex: 'wizard', scores, items: [] })).toBe(12)
  })

  it('adds CON for barbarians and WIS for monks', () => {
    expect(armorClass({ classIndex: 'barbarian', scores, items: [] })).toBe(13)
    expect(armorClass({ classIndex: 'monk', scores, items: [] })).toBe(15)
  })

  it('picks the best armor and adds a shield', () => {
    const items = [
      armor('leather-armor', { armor_category: 'Light', armor_class: { base: 11, dex_bonus: true } }),
      armor('chain-mail', { armor_category: 'Heavy', armor_class: { base: 16, dex_bonus: false } }),
      armor('shield', { armor_category: 'Shield', armor_class: { base: 2, dex_bonus: false } }),
    ]
    expect(armorClass({ classIndex: 'fighter', scores, items })).toBe(18)
  })

  it('caps DEX for medium armor', () => {
    const items = [
      armor('scale-mail', {
        armor_category: 'Medium',
        armor_class: { base: 14, dex_bonus: true, max_bonus: 2 },
      }),
    ]
    expect(armorClass({ classIndex: 'cleric', scores: { ...scores, dex: 18 }, items })).toBe(16)
  })
})

describe('spells', () => {
  it('finds the highest slot level', () => {
    expect(highestSpellSlot(undefined)).toBe(0)
    expect(highestSpellSlot({ spell_slots_level_1: 0 })).toBe(0)
    expect(highestSpellSlot({ spell_slots_level_1: 4, spell_slots_level_2: 3, spell_slots_level_3: 0 })).toBe(2)
  })

  it('uses spells known, or modifier + level for preparing casters', () => {
    expect(leveledSpellCount({ classIndex: 'bard', level: 3, spellsKnown: 6, castingModifier: 3 })).toBe(6)
    expect(leveledSpellCount({ classIndex: 'wizard', level: 5, castingModifier: 3 })).toBe(8)
    expect(leveledSpellCount({ classIndex: 'paladin', level: 5, castingModifier: 2 })).toBe(4)
  })
})
