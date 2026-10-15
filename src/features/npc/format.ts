import type { Ability } from '../../types/models.ts'

export const ABILITY_LABELS: Record<Ability, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
}

/** "Skill: Animal Handling" → "Animal Handling" */
export const skillName = (name: string) => name.replace(/^Skill:\s*/, '')

export function spellLevelLabel(level: number): string {
  if (level === 0) return 'Cantrips'
  const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th'
  return `${level}${suffix} level`
}

/** Which ability each skill uses, keyed by the API's proficiency index. */
export const SKILL_ABILITY: Record<string, Ability> = {
  'skill-acrobatics': 'dex',
  'skill-animal-handling': 'wis',
  'skill-arcana': 'int',
  'skill-athletics': 'str',
  'skill-deception': 'cha',
  'skill-history': 'int',
  'skill-insight': 'wis',
  'skill-intimidation': 'cha',
  'skill-investigation': 'int',
  'skill-medicine': 'wis',
  'skill-nature': 'int',
  'skill-perception': 'wis',
  'skill-performance': 'cha',
  'skill-persuasion': 'cha',
  'skill-religion': 'int',
  'skill-sleight-of-hand': 'dex',
  'skill-stealth': 'dex',
  'skill-survival': 'wis',
}
