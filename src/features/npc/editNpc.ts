import type { ApiRef, Character } from '../../types/models.ts'
import { SKILL_ABILITY } from './format.ts'
import { ABILITIES } from './rules.ts'

// Helpers for editing a generated or saved character by hand.

/** Entries typed in by the user have no API record, so they have no url. */
export const isCustom = (ref: ApiRef) => ref.url === ''

export function customRef(name: string): ApiRef {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return { index: `custom-${slug}-${Math.random().toString(36).slice(2, 7)}`, name: name.trim(), url: '' }
}

const titleCase = (words: string) => words.replace(/\b\w/g, (c) => c.toUpperCase())

/** All 18 skills as the API's proficiency references, e.g. "Skill: Stealth". */
export const SKILL_REFS: ApiRef[] = Object.keys(SKILL_ABILITY).map((index) => ({
  index,
  name: `Skill: ${titleCase(index.replace(/^skill-/, '').replace(/-/g, ' ')).replace(' Of ', ' of ')}`,
  url: `/api/2014/proficiencies/${index}`,
}))

const clamp = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback

/**
 * Cleans up an edited character before saving: trims text, keeps numbers in
 * the ranges 5e allows and falls back to the old value for empty number boxes.
 */
export function finishEdit(edited: Character, original: Character): Character {
  const abilityScores = { ...edited.abilityScores }
  for (const ability of ABILITIES) {
    abilityScores[ability] = clamp(abilityScores[ability], 1, 30, original.abilityScores[ability])
  }
  return {
    ...edited,
    name: edited.name.trim() || original.name,
    gender: edited.gender.trim(),
    appearance: edited.appearance.trim(),
    personality: edited.personality.trim(),
    hook: edited.hook.trim(),
    notes: edited.notes.trim(),
    level: clamp(edited.level, 1, 20, original.level),
    hitPoints: clamp(edited.hitPoints, 1, 999, original.hitPoints),
    armorClass: clamp(edited.armorClass, 0, 40, original.armorClass),
    speed: clamp(edited.speed, 0, 200, original.speed),
    proficiencyBonus: clamp(edited.proficiencyBonus, 0, 10, original.proficiencyBonus),
    abilityScores,
    updatedAt: new Date().toISOString(),
  }
}
