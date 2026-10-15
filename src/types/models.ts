// Domain models from plan.md, section 6.

/** A pointer to an entry in the D&D 5e API, e.g. a spell or an item. */
export interface ApiRef {
  index: string
  name: string
  url: string
}

export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
export type AbilityScores = Record<Ability, number>

export type CharacterRole = 'enemy' | 'encounter' | 'player'

export interface SpellRef extends ApiRef {
  level: number
}

export interface EquipmentEntry {
  item: ApiRef
  quantity: number
}

export interface Character {
  id: string
  name: string
  role: CharacterRole
  gender: string
  race: ApiRef
  subrace?: ApiRef
  class: ApiRef
  level: number
  abilityScores: AbilityScores
  hitPoints: number
  armorClass: number
  speed: number
  proficiencyBonus: number
  savingThrows: Ability[]
  /** Skill proficiencies, e.g. "Skill: Stealth". */
  skills: ApiRef[]
  /** Armor, weapon and tool proficiencies. */
  proficiencies: ApiRef[]
  spells: SpellRef[]
  equipment: EquipmentEntry[]
  appearance: string
  personality: string
  /** Why this NPC is here: an enemy's motive or an encounter's situation. */
  hook: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Scene {
  id: string
  /** Evocative place name, e.g. "The Whispering Hollow". */
  title: string
  locationType: string
  location: string
  timeOfDay: string
  weather: string
  mood: string
  /** Sensory details: something seen, heard and smelled. */
  details: string[]
  createdAt: string
}

/** Input for the scene generator. `undefined` means "Random". */
export interface SceneOptions {
  locationType?: string
  timeOfDay?: string
}

export interface RandomTableEntry {
  text: string
  /** Relative chance of being picked; defaults to 1. */
  weight?: number
}

export interface RandomTable {
  id: string
  name: string
  category: string
  entries: RandomTableEntry[]
}

/** Input for the NPC generator. `undefined` means "Random". */
export interface NpcOptions {
  role?: Exclude<CharacterRole, 'player'>
  gender?: string
  race?: string
  class?: string
  level?: number
}
