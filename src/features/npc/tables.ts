// Content the D&D 5e API does not provide: names, personality and story hooks.
// Flavor lists are RandomTables, the same format the scene generator uses.
import { table } from '../../lib/randomTable.ts'
import type { Ability, RandomTable } from '../../types/models.ts'

export const GENDERS = ['Female', 'Male', 'Non-binary'] as const
export type Gender = (typeof GENDERS)[number]

export const ROLES = ['enemy', 'encounter'] as const
export type NpcRole = (typeof ROLES)[number]

export const ROLE_LABELS: Record<NpcRole, string> = {
  enemy: 'Enemy',
  encounter: 'Random encounter',
}

/** Standard array, highest first. */
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const

/** Which abilities matter most for each SRD class, most important first. */
export const ABILITY_PRIORITY: Record<string, Ability[]> = {
  barbarian: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
  bard: ['cha', 'dex', 'con', 'wis', 'int', 'str'],
  cleric: ['wis', 'con', 'str', 'cha', 'dex', 'int'],
  druid: ['wis', 'con', 'dex', 'int', 'cha', 'str'],
  fighter: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
  monk: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
  paladin: ['str', 'cha', 'con', 'wis', 'dex', 'int'],
  ranger: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
  rogue: ['dex', 'con', 'int', 'cha', 'wis', 'str'],
  sorcerer: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
  warlock: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
  wizard: ['int', 'con', 'dex', 'wis', 'cha', 'str'],
}

export const DEFAULT_PRIORITY: Ability[] = ['str', 'dex', 'con', 'wis', 'int', 'cha']

interface NameSet {
  female: string[]
  male: string[]
  family: string[]
}

export const NAMES: Record<string, NameSet> = {
  dragonborn: {
    female: ['Akra', 'Biri', 'Daar', 'Harann', 'Kava', 'Mishann', 'Sora', 'Thava', 'Uadjit'],
    male: ['Arjhan', 'Balasar', 'Donaar', 'Ghesh', 'Kriv', 'Medrash', 'Nadarr', 'Rhogar', 'Torinn'],
    family: ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Kepeshkmolik', 'Myastan', 'Yarjerit'],
  },
  dwarf: {
    female: ['Amber', 'Bardryn', 'Dagnal', 'Eldeth', 'Gunnloda', 'Helja', 'Kathra', 'Riswynn', 'Vistra'],
    male: ['Adrik', 'Baern', 'Brottor', 'Dain', 'Eberk', 'Harbek', 'Rurik', 'Thorin', 'Vondal'],
    family: ['Battlehammer', 'Fireforge', 'Gorunn', 'Holderhek', 'Ironfist', 'Rumnaheim', 'Torunn'],
  },
  elf: {
    female: ['Adrie', 'Birel', 'Caelynn', 'Enna', 'Keyleth', 'Leshanna', 'Naivara', 'Shava', 'Valanthe'],
    male: ['Adran', 'Aramil', 'Erevan', 'Galinndan', 'Ivellios', 'Laucian', 'Riardon', 'Soveliss', 'Thamior'],
    family: ['Amakiir', 'Galanodel', 'Holimion', 'Liadon', 'Meliamne', 'Nailo', 'Siannodel', 'Xiloscient'],
  },
  gnome: {
    female: ['Bimpnottin', 'Caramip', 'Ellyjobell', 'Lilli', 'Nissa', 'Orla', 'Roywyn', 'Tana', 'Zanna'],
    male: ['Alston', 'Boddynock', 'Brocc', 'Dimble', 'Fonkin', 'Glim', 'Orryn', 'Wrenn', 'Zook'],
    family: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig', 'Scheppen', 'Turen'],
  },
  halfling: {
    female: ['Andry', 'Bree', 'Callie', 'Cora', 'Kithri', 'Lavinia', 'Merla', 'Seraphina', 'Verna'],
    male: ['Alton', 'Cade', 'Eldon', 'Garret', 'Lyle', 'Milo', 'Osborn', 'Roscoe', 'Wellby'],
    family: ['Brushgather', 'Goodbarrel', 'Greenbottle', 'Highhill', 'Tealeaf', 'Thorngage', 'Underbough'],
  },
  'half-orc': {
    female: ['Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Shautha', 'Vola'],
    male: ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Krusk', 'Ront', 'Thokk'],
    family: ['of the Broken Tusk', 'of the Red Fang', 'Skullsplitter', 'Bonegnaw', 'Ironhide'],
  },
  tiefling: {
    female: ['Akta', 'Bryseis', 'Damaia', 'Ea', 'Kallista', 'Makaria', 'Nemeia', 'Orianna', 'Rieta'],
    male: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Kairon', 'Leucis', 'Mordai', 'Skamos'],
    family: ['Hope', 'Sorrow', 'Torment', 'Ember', 'Quiet', 'Ash', 'Dread'],
  },
  human: {
    female: ['Arveene', 'Betha', 'Esvele', 'Jhessail', 'Kerri', 'Lureene', 'Miri', 'Rowan', 'Tessele'],
    male: ['Ander', 'Bram', 'Darvin', 'Evendur', 'Gorstag', 'Helm', 'Marcon', 'Randal', 'Taman'],
    family: ['Amblecrown', 'Brightwood', 'Dundragon', 'Evenwood', 'Greycastle', 'Marsk', 'Tallstag'],
  },
}

// Half-elves draw from both elven and human names.
NAMES['half-elf'] = {
  female: [...NAMES.elf.female, ...NAMES.human.female],
  male: [...NAMES.elf.male, ...NAMES.human.male],
  family: [...NAMES.elf.family, ...NAMES.human.family],
}

export const PERSONALITY: RandomTable = table('npc-personality', 'Personality', 'npc', [
  'Speaks in a whisper and never makes eye contact.',
  'Laughs too loudly at their own jokes.',
  'Collects small trinkets from everyone they meet.',
  'Deeply suspicious of anyone who uses magic.',
  'Quotes old proverbs, usually slightly wrong.',
  'Polite to a fault, even while threatening someone.',
  'Hums an old lullaby when nervous.',
  'Always hungry and always eating.',
  'Keeps a meticulous ledger of every favor owed.',
  'Easily flattered and quick to brag.',
  'Calm and patient, like a still lake before a storm.',
  'Superstitious: knocks on wood three times before any decision.',
  'Blunt and honest, even when it hurts.',
  'Tells wildly exaggerated stories about past adventures.',
  'Fiercely loyal to family, cold to everyone else.',
  'Distracted, as if listening to a voice nobody else hears.',
])

export const APPEARANCE: RandomTable = table('npc-appearance', 'Appearance', 'npc', [
  'a jagged scar across one cheek',
  'mismatched eyes, one blue and one amber',
  'a threadbare cloak patched many times',
  'ink-stained fingers',
  'a missing front tooth',
  'braided hair woven with small bones',
  'an expensive ring that does not match their clothes',
  'a heavy limp and a carved walking stick',
  'tattoos of runes along both forearms',
  'a nervous twitch in one eye',
  'a booming voice that fills the room',
  'a faint smell of smoke and sulfur',
  'soot-smudged clothing',
  'a perfectly groomed appearance',
])

export const ENEMY_HOOKS: RandomTable = table('npc-enemy-hooks', 'Enemy hooks', 'npc', [
  'Hunts the party for a bounty placed by an old rival.',
  'Guards a secret their master would kill to protect.',
  'Believes the party stole something precious from them.',
  'Serves a cult that needs one more sacrifice before the new moon.',
  'Wants revenge for a friend the heroes once defeated.',
  'Has been paid to delay the party at any cost.',
  'Is testing the heroes on behalf of a powerful patron.',
  'Desperate and cornered, fights because there is no way out.',
  'Smuggles forbidden goods and cannot afford witnesses.',
  'Was cursed and attacks anyone who comes too close.',
])

export const ENCOUNTER_HOOKS: RandomTable = table('npc-encounter-hooks', 'Encounter hooks', 'npc', [
  'Is lost and asks the party for directions to the nearest town.',
  'Sells strange curiosities from a battered cart.',
  'Is being chased by something and begs for help.',
  'Sits by the road nursing an injured animal.',
  'Claims to know a shortcut, which may or may not be true.',
  'Is searching for a missing sibling last seen nearby.',
  'Offers a game of dice with suspiciously high stakes.',
  'Carries a sealed letter they were told never to open.',
  'Is celebrating loudly and invites everyone to join.',
  'Seems to recognize one of the heroes, though they have never met.',
])
