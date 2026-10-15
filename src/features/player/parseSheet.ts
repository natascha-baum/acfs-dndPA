import { ABILITY_LABELS as ABILITY_NAMES } from '../npc/format.ts'
import { ABILITIES } from '../npc/rules.ts'
import type { Ability, ImportedSheet } from '../../types/models.ts'

// Turns the form fields of a fillable character sheet into an ImportedSheet.
// Field names follow the official 5e sheet by Wizards of the Coast (which
// D&D Beyond and most community sheets reuse). Names are compared after
// `normalize`, so "Race ", "RACE" and "race" all match.

export interface FormFields {
  /** Text fields by name. */
  text: Map<string, string>
  /** Names of ticked check boxes. */
  checked: Set<string>
}

export const normalize = (fieldName: string) => fieldName.toLowerCase().replace(/[^a-z0-9]/g, '')

// Check box numbers on the official sheet, in sheet order.
const SAVE_BOXES: Record<Ability, number> = { str: 11, dex: 18, con: 19, int: 20, wis: 21, cha: 22 }
const SKILLS: { name: string; fields: string[]; box: number }[] = [
  { name: 'Acrobatics', fields: ['acrobatics'], box: 23 },
  { name: 'Animal Handling', fields: ['animal', 'animalhandling'], box: 24 },
  { name: 'Arcana', fields: ['arcana'], box: 25 },
  { name: 'Athletics', fields: ['athletics'], box: 26 },
  { name: 'Deception', fields: ['deception'], box: 27 },
  { name: 'History', fields: ['history'], box: 28 },
  { name: 'Insight', fields: ['insight'], box: 29 },
  { name: 'Intimidation', fields: ['intimidation'], box: 30 },
  { name: 'Investigation', fields: ['investigation'], box: 31 },
  { name: 'Medicine', fields: ['medicine'], box: 32 },
  { name: 'Nature', fields: ['nature'], box: 33 },
  { name: 'Perception', fields: ['perception'], box: 34 },
  { name: 'Performance', fields: ['performance'], box: 35 },
  { name: 'Persuasion', fields: ['persuasion'], box: 36 },
  { name: 'Religion', fields: ['religion'], box: 37 },
  { name: 'Sleight of Hand', fields: ['sleightofhand'], box: 38 },
  { name: 'Stealth', fields: ['stealth'], box: 39 },
  { name: 'Survival', fields: ['survival'], box: 40 },
]

/** Fewer filled fields than this means the PDF is not really a filled-in sheet. */
const MIN_FIELDS = 5

const isModifier = (value: string) => /^[+\-−–]\s*\d+$/.test(value.trim())
const toInt = (value: string | undefined) => {
  const n = Number.parseInt((value ?? '').replace(/[−–]/g, '-').replace(/\s/g, ''), 10)
  return Number.isNaN(n) ? undefined : n
}
const modifierOf = (score: number) => Math.floor((score - 10) / 2)

/**
 * The official sheet names its two ability boxes "STR" and "STRmod", but sheets
 * disagree about which holds the score. Decide by the values themselves.
 */
export function scoreAndModifier(a: string, b: string): { score?: number; modifier?: string } {
  const [na, nb] = [toInt(a), toInt(b)]
  const pick = (score: string, mod: string) => {
    const s = toInt(score)
    return { score: s, modifier: mod.trim() || (s !== undefined ? signed(modifierOf(s)) : undefined) }
  }
  if (na === undefined && nb === undefined) return {}
  if (na === undefined) return pick(b, '')
  if (nb === undefined) return pick(a, '')
  if (isModifier(a) && !isModifier(b)) return pick(b, a)
  if (isModifier(b) && !isModifier(a)) return pick(a, b)
  if (modifierOf(na) === nb) return pick(a, b)
  if (modifierOf(nb) === na) return pick(b, a)
  return na >= nb ? pick(a, b) : pick(b, a)
}

export function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}

/** Splits a free-text sheet field into lines, dropping empty ones. */
export function lines(text: string): string[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

export function parseSheet(fields: FormFields): ImportedSheet | undefined {
  const byName = new Map<string, string>()
  for (const [name, value] of fields.text) {
    const key = normalize(name)
    if (value.trim() && !byName.has(key)) byName.set(key, value.trim())
  }
  if (byName.size < MIN_FIELDS) return undefined

  const checked = new Set([...fields.checked].map(normalize))
  const get = (...names: string[]) => names.map((n) => byName.get(n)).find(Boolean) ?? ''
  const box = (n: number) => checked.has(`checkbox${n}`)

  const abilityScores: ImportedSheet['abilityScores'] = {}
  const abilityModifiers: ImportedSheet['abilityModifiers'] = {}
  for (const ability of ABILITIES) {
    const { score, modifier } = scoreAndModifier(byName.get(ability) ?? '', byName.get(`${ability}mod`) ?? '')
    if (score !== undefined) abilityScores[ability] = score
    if (modifier) abilityModifiers[ability] = modifier
  }

  const attacks = [1, 2, 3]
    .map((i) => ({
      name: get(i === 1 ? 'wpnname' : `wpnname${i}`),
      bonus: get(`wpn${i}atkbonus`),
      damage: get(`wpn${i}damage`),
    }))
    .filter((a) => a.name || a.bonus || a.damage)

  // Spell lines on the official sheet are fields named "Spells 1014" and so on.
  const spells = [...fields.text]
    .filter(([name, value]) => /^spells\d+$/.test(normalize(name)) && value.trim())
    .sort(([a], [b]) => Number(normalize(a).slice(6)) - Number(normalize(b).slice(6)))
    .map(([, value]) => value.trim())

  return {
    background: get('background'),
    alignment: get('alignment'),
    experience: get('xp', 'experiencepoints'),
    abilityScores,
    abilityModifiers,
    proficiencyBonus: get('profbonus', 'proficiencybonus'),
    armorClass: get('ac', 'armorclass'),
    initiative: get('initiative', 'init'),
    speed: get('speed'),
    hitPoints: get('hpmax', 'maxhp', 'hpcurrent'),
    hitDice: get('hdtotal', 'hd'),
    passivePerception: get('passive', 'passiveperception'),
    savingThrows: ABILITIES.map((ability) => ({
      ability,
      name: ABILITY_NAMES[ability],
      value: get(`st${ABILITY_NAMES[ability].toLowerCase()}`),
      proficient: box(SAVE_BOXES[ability]),
    })),
    skills: SKILLS.map((s) => ({ name: s.name, value: get(...s.fields), proficient: box(s.box) })),
    attacks,
    attacksNotes: get('attacksspellcasting'),
    spellcasting: {
      class: get('spellcastingclass2', 'spellcastingclass'),
      ability: get('spellcastingability2', 'spellcastingability'),
      saveDc: get('spellsavedc2', 'spellsavedc'),
      attackBonus: get('spellatkbonus2', 'spellatkbonus'),
    },
    spells: [...new Set(spells)],
    proficienciesAndLanguages: get('proficiencieslang', 'proficienciesandlanguages'),
    equipment: get('equipment'),
    coins: Object.fromEntries((['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((c) => [c, get(c)]).filter(([, v]) => v)),
    featuresAndTraits: [get('featuresandtraits'), get('feattraits')].filter(Boolean).join('\n'),
    personality: {
      traits: get('personalitytraits'),
      ideals: get('ideals'),
      bonds: get('bonds'),
      flaws: get('flaws'),
    },
    appearance: Object.fromEntries(
      (['age', 'height', 'weight', 'eyes', 'skin', 'hair'] as const).map((k) => [k, get(k)]).filter(([, v]) => v),
    ),
    backstory: get('backstory'),
    alliesAndOrganizations: get('allies'),
    treasure: get('treasure'),
  }
}
