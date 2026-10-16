// Response shapes of the D&D 5e API (https://5e-bits.github.io/docs/).
// Only the fields the app uses are typed; the API returns more.
import type { ApiRef } from '../../types/models.ts'

export interface ApiList<T extends ApiRef = ApiRef> {
  count: number
  results: T[]
}

export interface AbilityBonus {
  ability_score: ApiRef
  bonus: number
}

/** A pick-from-a-list in the API ("choose 2 from ..."). */
export interface Choice {
  desc?: string
  choose: number
  type: string
  from: OptionSet
}

/** One entry in an option set; which fields are present depends on `option_type`. */
export interface Option {
  option_type: 'reference' | 'counted_reference' | 'choice' | 'multiple' | 'ability_bonus' | string
  item?: ApiRef
  count?: number
  of?: ApiRef
  choice?: Choice
  items?: Option[]
  ability_score?: ApiRef
  bonus?: number
}

export interface OptionSet {
  option_set_type: 'options_array' | 'equipment_category' | string
  options?: Option[]
  equipment_category?: ApiRef
}

export interface Race {
  index: string
  name: string
  speed: number
  size: string
  ability_bonuses: AbilityBonus[]
  ability_bonus_options?: Choice
  starting_proficiencies?: ApiRef[]
  languages?: ApiRef[]
  traits?: ApiRef[]
  subraces?: ApiRef[]
}

export interface Subrace {
  index: string
  name: string
  ability_bonuses: AbilityBonus[]
  starting_proficiencies?: ApiRef[]
  racial_traits?: ApiRef[]
}

/** Racial trait, e.g. an elf's Keen Senses (which grants Perception). */
export interface Trait {
  index: string
  name: string
  proficiencies?: ApiRef[]
  proficiency_choices?: Choice
}

export interface Class {
  index: string
  name: string
  hit_die: number
  proficiencies?: ApiRef[]
  proficiency_choices?: Choice[]
  saving_throws?: ApiRef[]
  starting_equipment?: { equipment: ApiRef; quantity: number }[]
  starting_equipment_options?: Choice[]
  spellcasting?: { level: number; spellcasting_ability: ApiRef }
  spells?: string
}

export interface ClassLevel {
  level: number
  prof_bonus: number
  /** Number of Ability Score Improvements gained up to this level. */
  ability_score_bonuses: number
  spellcasting?: {
    cantrips_known?: number
    spells_known?: number
    [slotKey: `spell_slots_level_${number}`]: number | undefined
  }
}

/** Entry of /classes/{index}/spells; includes the spell level. */
export interface ClassSpellRef extends ApiRef {
  level: number
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
  armor_category?: 'Light' | 'Medium' | 'Heavy' | 'Shield'
  armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number }
  weapon_category?: string
  damage?: { damage_dice: string; damage_type: ApiRef }
}

export interface EquipmentCategory {
  index: string
  name: string
  equipment: ApiRef[]
}

// Wiki entries (src/features/detail/wikiContent.ts).

/** One named block of a monster: a trait, an action or a legendary action. */
export interface MonsterAbility {
  name: string
  desc: string
}

export interface Monster {
  index: string
  name: string
  size: string
  type: string
  subtype?: string
  alignment: string
  armor_class: { type: string; value: number }[]
  hit_points: number
  hit_dice: string
  speed: Record<string, string | boolean>
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  /** Saving throws and skills, e.g. "Saving Throw: CON" with value 6. */
  proficiencies: { value: number; proficiency: ApiRef }[]
  damage_vulnerabilities: string[]
  damage_resistances: string[]
  damage_immunities: string[]
  condition_immunities: ApiRef[]
  senses: Record<string, string | number>
  languages: string
  challenge_rating: number
  xp: number
  special_abilities?: MonsterAbility[]
  actions?: MonsterAbility[]
  legendary_actions?: MonsterAbility[]
}

export interface MagicItem {
  index: string
  name: string
  equipment_category: ApiRef
  rarity: { name: string }
  desc: string[]
  variants: ApiRef[]
}

export interface Condition {
  index: string
  name: string
  desc: string[]
}

/** The full race entry; `Race` above holds what the NPC generator needs. */
export interface RaceDetail extends Race {
  alignment: string
  age: string
  size_description: string
  language_desc: string
}

export interface SubraceDetail extends Subrace {
  desc: string
  race: ApiRef
}

/** One entry of /classes/{index}/levels; subclass levels name their subclass. */
export interface LevelFeatures {
  level: number
  features: ApiRef[]
  subclass?: ApiRef
}

export interface ClassDetail extends Class {
  subclasses: ApiRef[]
}
