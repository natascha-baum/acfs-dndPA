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

/** A player's own character, kept as an uploaded PDF character sheet. */
export interface PlayerSheet {
  id: string
  name: string
  race: string
  /** Free text as written on the sheet, e.g. "Rogue 3 / Fighter 1". */
  classLevel: string
  fileName: string
  /** Size of the PDF in bytes; the file itself lives in the file store. */
  fileSize: number
  /** Everything read from a fillable PDF, shown in the app's own sheet layout. */
  sheet?: ImportedSheet
  createdAt: string
  updatedAt: string
}

/** A skill or saving throw as written on a character sheet. */
export interface SheetCheck {
  name: string
  /** The bonus as written, e.g. "+5". */
  value: string
  proficient: boolean
}

export interface SheetAttack {
  name: string
  bonus: string
  damage: string
}

/**
 * The contents of an uploaded character sheet. Values are kept as written on
 * the sheet (text), because players fill in sheets in many different ways.
 */
export interface ImportedSheet {
  background: string
  alignment: string
  experience: string
  abilityScores: Partial<Record<Ability, number>>
  abilityModifiers: Partial<Record<Ability, string>>
  proficiencyBonus: string
  armorClass: string
  initiative: string
  speed: string
  hitPoints: string
  hitDice: string
  passivePerception: string
  savingThrows: (SheetCheck & { ability: Ability })[]
  skills: SheetCheck[]
  attacks: SheetAttack[]
  attacksNotes: string
  spellcasting: { class: string; ability: string; saveDc: string; attackBonus: string }
  /** Spell names in the order they appear on the sheet. */
  spells: string[]
  proficienciesAndLanguages: string
  equipment: string
  coins: Partial<Record<'cp' | 'sp' | 'ep' | 'gp' | 'pp', string>>
  featuresAndTraits: string
  personality: { traits: string; ideals: string; bonds: string; flaws: string }
  appearance: Partial<Record<'age' | 'height' | 'weight' | 'eyes' | 'skin' | 'hair', string>>
  backstory: string
  alliesAndOrganizations: string
  treasure: string
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
  /** Own read-aloud text; when empty it is built from the fields. */
  readAloud?: string
  /** The DM's own notes, added when editing. */
  notes?: string
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
