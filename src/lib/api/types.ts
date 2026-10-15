// Response shapes of the D&D 5e API (https://5e-bits.github.io/docs/).
// Only the fields the app uses are typed; the API returns more.
import type { ApiRef } from '../../types/models.ts'

export interface ApiList {
  count: number
  results: ApiRef[]
}

export interface AbilityBonus {
  ability_score: ApiRef
  bonus: number
}

export interface Race {
  index: string
  name: string
  speed: number
  size: string
  ability_bonuses: AbilityBonus[]
  starting_proficiencies: ApiRef[]
  languages: ApiRef[]
  traits: ApiRef[]
  subraces: ApiRef[]
}

export interface Choice {
  desc?: string
  choose: number
  type: string
  from: unknown
}

export interface Class {
  index: string
  name: string
  hit_die: number
  proficiencies: ApiRef[]
  proficiency_choices: Choice[]
  saving_throws: ApiRef[]
  starting_equipment: { equipment: ApiRef; quantity: number }[]
  starting_equipment_options: Choice[]
  spellcasting?: { level: number; spellcasting_ability: ApiRef }
  spells?: string
}

export interface Spell {
  index: string
  name: string
  desc: string[]
  higher_level?: string[]
  range: string
  components: string[]
  material?: string
  ritual: boolean
  duration: string
  concentration: boolean
  casting_time: string
  level: number
  school: ApiRef
  classes: ApiRef[]
}

export interface Equipment {
  index: string
  name: string
  desc?: string[]
  equipment_category: ApiRef
  weight?: number
  cost?: { quantity: number; unit: string }
  armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number }
  damage?: { damage_dice: string; damage_type: ApiRef }
}
