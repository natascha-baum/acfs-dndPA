import type { ImportedSheet, PlayerSheet } from '../../types/models.ts'
import { ABILITY_LABELS } from '../npc/format.ts'
import { ABILITIES } from '../npc/rules.ts'
import { SKILL_NAMES } from './parseSheet.ts'

/** An empty sheet, so players whose PDF had no form fields can fill one in by hand. */
export function emptySheet(): ImportedSheet {
  return {
    background: '',
    alignment: '',
    experience: '',
    abilityScores: {},
    abilityModifiers: {},
    proficiencyBonus: '',
    armorClass: '',
    initiative: '',
    speed: '',
    hitPoints: '',
    hitDice: '',
    passivePerception: '',
    savingThrows: ABILITIES.map((ability) => ({ ability, name: ABILITY_LABELS[ability], value: '', proficient: false })),
    skills: SKILL_NAMES.map((name) => ({ name, value: '', proficient: false })),
    attacks: [],
    attacksNotes: '',
    spellcasting: { class: '', ability: '', saveDc: '', attackBonus: '' },
    spells: [],
    proficienciesAndLanguages: '',
    equipment: '',
    coins: {},
    featuresAndTraits: '',
    personality: { traits: '', ideals: '', bonds: '', flaws: '' },
    appearance: {},
    backstory: '',
    alliesAndOrganizations: '',
    treasure: '',
  }
}

const trimRecord = <K extends string>(record: Partial<Record<K, string>>) =>
  Object.fromEntries(
    Object.entries(record)
      .map(([k, v]) => [k, String(v ?? '').trim()])
      .filter(([, v]) => v),
  ) as Partial<Record<K, string>>

/** Trims an edited player and drops empty attack rows and spell lines. */
export function finishPlayerEdit(edited: PlayerSheet, original: PlayerSheet): PlayerSheet {
  const result: PlayerSheet = {
    ...edited,
    name: edited.name.trim() || original.name,
    race: edited.race.trim(),
    classLevel: edited.classLevel.trim(),
    updatedAt: new Date().toISOString(),
  }
  const s = edited.sheet
  if (s) {
    const abilityScores = Object.fromEntries(
      Object.entries(s.abilityScores).filter(([, v]) => typeof v === 'number' && Number.isFinite(v)),
    )
    result.sheet = {
      ...s,
      abilityScores,
      abilityModifiers: trimRecord(s.abilityModifiers),
      attacks: s.attacks
        .map((a) => ({ name: a.name.trim(), bonus: a.bonus.trim(), damage: a.damage.trim() }))
        .filter((a) => a.name || a.bonus || a.damage),
      spells: s.spells.map((sp) => sp.trim()).filter(Boolean),
      coins: trimRecord(s.coins),
      appearance: trimRecord(s.appearance),
    }
  }
  return result
}
