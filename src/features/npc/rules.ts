// Pure D&D 5e rule helpers used by the NPC generator.
import type { Equipment } from '../../lib/api/types.ts'
import type { Ability, AbilityScores } from '../../types/models.ts'
import { STANDARD_ARRAY } from './tables.ts'

export const ABILITIES: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
export const MAX_ABILITY_SCORE = 20

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4)
}

/** Puts the standard array onto the abilities in the given priority order. */
export function assignStandardArray(priority: Ability[]): AbilityScores {
  const scores = {} as AbilityScores
  priority.forEach((ability, i) => {
    scores[ability] = STANDARD_ARRAY[i]
  })
  return scores
}

export function applyBonuses(
  scores: AbilityScores,
  bonuses: { ability: Ability; bonus: number }[],
): AbilityScores {
  const result = { ...scores }
  for (const { ability, bonus } of bonuses) {
    result[ability] = Math.min(MAX_ABILITY_SCORE, result[ability] + bonus)
  }
  return result
}

/**
 * Spends Ability Score Improvements (+2 each) on the most important
 * abilities first, never going above 20.
 */
export function applyImprovements(
  scores: AbilityScores,
  improvements: number,
  priority: Ability[],
): AbilityScores {
  const result = { ...scores }
  let points = improvements * 2
  for (const ability of priority) {
    while (points > 0 && result[ability] < MAX_ABILITY_SCORE) {
      result[ability] += 1
      points -= 1
    }
  }
  return result
}

/** Max HP at level 1, then the fixed average per level (PHB rule). */
export function hitPoints(hitDie: number, level: number, conModifier: number): number {
  const first = Math.max(1, hitDie + conModifier)
  const perLevel = Math.max(1, hitDie / 2 + 1 + conModifier)
  return first + (level - 1) * perLevel
}

interface ArmorClassInput {
  classIndex: string
  scores: AbilityScores
  /** Details of the items the character carries. */
  items: Equipment[]
}

export function armorClass({ classIndex, scores, items }: ArmorClassInput): number {
  const dex = abilityModifier(scores.dex)
  const armors = items.filter((i) => i.armor_class && i.armor_category && i.armor_category !== 'Shield')
  const hasShield = items.some((i) => i.armor_category === 'Shield')
  const shield = hasShield ? 2 : 0

  const armored = armors.map((armor) => {
    const ac = armor.armor_class!
    if (!ac.dex_bonus) return ac.base
    return ac.base + (ac.max_bonus === undefined ? dex : Math.min(dex, ac.max_bonus))
  })

  let unarmored = 10 + dex
  if (classIndex === 'barbarian') unarmored += abilityModifier(scores.con)
  if (classIndex === 'monk' && !hasShield) unarmored += abilityModifier(scores.wis)

  return Math.max(unarmored, ...armored) + shield
}

/** Highest spell slot level available, or 0 if none. */
export function highestSpellSlot(spellcasting: Record<string, number | undefined> | undefined): number {
  if (!spellcasting) return 0
  for (let level = 9; level >= 1; level--) {
    if ((spellcasting[`spell_slots_level_${level}`] ?? 0) > 0) return level
  }
  return 0
}

/** Classes that prepare spells from their whole list instead of knowing a fixed number. */
const HALF_LEVEL_PREPARERS = new Set(['paladin'])

export function leveledSpellCount(input: {
  classIndex: string
  level: number
  spellsKnown?: number
  castingModifier: number
}): number {
  if (input.spellsKnown !== undefined) return input.spellsKnown
  const levels = HALF_LEVEL_PREPARERS.has(input.classIndex)
    ? Math.floor(input.level / 2)
    : input.level
  return Math.max(1, input.castingModifier + levels)
}
