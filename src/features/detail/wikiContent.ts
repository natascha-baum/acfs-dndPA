// Detail views for the Wiki: monsters, magic items, races, subraces, classes
// and conditions. Spells and equipment use the views in resolveDetail.ts.
import type {
  AbilityBonus,
  ClassDetail,
  Condition,
  LevelFeatures,
  MagicItem,
  Monster,
  MonsterAbility,
  RaceDetail,
  SubraceDetail,
} from '../../lib/api/types.ts'
import type { ApiRef } from '../../types/models.ts'
import { abilityModifier } from '../npc/rules.ts'
import type { DetailApi, DetailContent, LookupKind, LookupRef } from './resolveDetail.ts'

export const WIKI_PATHS = {
  monster: 'monsters',
  'magic-item': 'magic-items',
  race: 'races',
  subrace: 'subraces',
  class: 'classes',
  condition: 'conditions',
} as const

export type WikiKind = keyof typeof WIKI_PATHS

export const isWikiKind = (kind: LookupKind): kind is WikiKind => kind in WIKI_PATHS

type Facts = DetailContent['facts']

const refs = (kind: LookupKind, items: ApiRef[]): LookupRef[] => items.map((i) => ({ kind, index: i.index, name: i.name }))
const signed = (n: number) => (n < 0 ? `−${-n}` : `+${n}`)
const names = (items: ApiRef[]) => items.map((i) => i.name).join(', ')

/** Adds a fact only when it has a value, so empty lists don't show up. */
function addFact(facts: Facts, label: string, value: string | undefined) {
  if (value) facts.push({ label, value })
}

const bonuses = (list: AbilityBonus[]) => list.map((b) => `${b.ability_score.name} ${signed(b.bonus)}`).join(', ')

// --- Monsters ---

const ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const

function speedText(speed: Monster['speed']): string {
  return Object.entries(speed)
    .map(([mode, value]) => (mode === 'walk' ? String(value) : value === true ? mode : `${mode} ${value}`))
    .join(', ')
}

function sensesText(senses: Monster['senses']): string {
  return Object.entries(senses)
    .map(([sense, value]) => (sense === 'passive_perception' ? `passive Perception ${value}` : `${sense} ${value}`))
    .join(', ')
}

/** "Saving Throw: CON" with value 6 → "CON +6"; "Skill: History" → "History +12". */
function proficiencyList(monster: Monster, prefix: string): string {
  return monster.proficiencies
    .filter((p) => p.proficiency.name.startsWith(prefix))
    .map((p) => `${p.proficiency.name.slice(prefix.length)} ${signed(p.value)}`)
    .join(', ')
}

const abilityParagraphs = (list: MonsterAbility[] = []) => list.map((a) => `${a.name}. ${a.desc}`)

function monsterContent(m: Monster): DetailContent {
  const facts: Facts = []
  const ac = m.armor_class[0]
  addFact(facts, 'Armor class', ac && `${ac.value}${ac.type === 'dex' ? '' : ` (${ac.type})`}`)
  addFact(facts, 'Hit points', `${m.hit_points} (${m.hit_dice})`)
  addFact(facts, 'Speed', speedText(m.speed))
  for (const a of ABILITIES) addFact(facts, a.slice(0, 3).toUpperCase(), `${m[a]} (${signed(abilityModifier(m[a]))})`)
  addFact(facts, 'Saving throws', proficiencyList(m, 'Saving Throw: '))
  addFact(facts, 'Skills', proficiencyList(m, 'Skill: '))
  addFact(facts, 'Vulnerabilities', m.damage_vulnerabilities.join(', '))
  addFact(facts, 'Resistances', m.damage_resistances.join(', '))
  addFact(facts, 'Immunities', m.damage_immunities.join(', '))
  addFact(facts, 'Condition immunities', names(m.condition_immunities))
  addFact(facts, 'Senses', sensesText(m.senses))
  addFact(facts, 'Languages', m.languages)
  addFact(facts, 'Challenge', `${m.challenge_rating} (${m.xp.toLocaleString('en-US')} XP)`)
  const sections = [
    { label: 'Traits', paragraphs: abilityParagraphs(m.special_abilities) },
    { label: 'Actions', paragraphs: abilityParagraphs(m.actions) },
    { label: 'Legendary actions', paragraphs: abilityParagraphs(m.legendary_actions) },
  ].filter((s) => s.paragraphs.length > 0)
  const type = m.subtype ? `${m.type} (${m.subtype})` : m.type
  return { title: m.name, subtitle: `${m.size} ${type}, ${m.alignment}`, facts, paragraphs: [], links: [], sections }
}

// --- Other entries ---

function magicItemContent(item: MagicItem): DetailContent {
  return {
    title: item.name,
    subtitle: `${item.equipment_category.name} · ${item.rarity.name.toLowerCase()}`,
    facts: [],
    paragraphs: item.desc,
    links: item.variants.length ? [{ label: 'Variants', items: refs('magic-item', item.variants) }] : [],
  }
}

function raceContent(race: RaceDetail): DetailContent {
  const facts: Facts = []
  addFact(facts, 'Speed', `${race.speed} ft.`)
  addFact(facts, 'Size', race.size)
  addFact(facts, 'Ability scores', bonuses(race.ability_bonuses))
  addFact(facts, 'Languages', names(race.languages ?? []))
  const links = [
    { label: 'Traits', items: refs('trait', race.traits ?? []) },
    { label: 'Subraces', items: refs('subrace', race.subraces ?? []) },
  ].filter((l) => l.items.length > 0)
  return {
    title: race.name,
    subtitle: 'Race',
    facts,
    paragraphs: [`Age. ${race.age}`, `Alignment. ${race.alignment}`, `Size. ${race.size_description}`, `Languages. ${race.language_desc}`],
    links,
  }
}

function subraceContent(subrace: SubraceDetail): DetailContent {
  const facts: Facts = []
  addFact(facts, 'Ability scores', bonuses(subrace.ability_bonuses))
  const traits = refs('trait', subrace.racial_traits ?? [])
  return {
    title: subrace.name,
    subtitle: `${subrace.race.name} subrace`,
    facts,
    paragraphs: [subrace.desc],
    links: traits.length ? [{ label: 'Traits', items: traits }] : [],
  }
}

/** Features grouped by level; subclass features carry the subclass name. */
function featuresByLevel(levels: LevelFeatures[]): DetailContent['links'] {
  const byLevel = new Map<number, LookupRef[]>()
  for (const { level, features, subclass } of [...levels].sort((a, b) => a.level - b.level)) {
    const items = features.map((f) => ({
      kind: 'feature' as const,
      index: f.index,
      name: subclass ? `${f.name} (${subclass.name})` : f.name,
    }))
    if (items.length) byLevel.set(level, [...(byLevel.get(level) ?? []), ...items])
  }
  return [...byLevel].map(([level, items]) => ({ label: `Level ${level}`, items }))
}

function classContent(cls: ClassDetail, levels: LevelFeatures[]): DetailContent {
  const facts: Facts = []
  addFact(facts, 'Hit die', `d${cls.hit_die}`)
  addFact(facts, 'Saving throws', names(cls.saving_throws ?? []))
  const proficiencies = (cls.proficiencies ?? []).filter((p) => !p.name.startsWith('Saving Throw'))
  addFact(facts, 'Proficiencies', names(proficiencies))
  addFact(facts, 'Spellcasting', cls.spellcasting?.spellcasting_ability.name)
  addFact(facts, 'Subclasses', names(cls.subclasses))
  return { title: cls.name, subtitle: 'Class', facts, paragraphs: [], links: featuresByLevel(levels) }
}

function conditionContent(condition: Condition): DetailContent {
  return {
    title: condition.name,
    subtitle: 'Condition',
    facts: [],
    // The SRD writes each rule as a "- " list line.
    paragraphs: condition.desc.map((line) => line.replace(/^-\s*/, '')),
    links: [],
  }
}

export async function wikiContent(kind: WikiKind, index: string, api: DetailApi): Promise<DetailContent> {
  const path = `${WIKI_PATHS[kind]}/${index}`
  switch (kind) {
    case 'monster':
      return monsterContent(await api.get<Monster>(path))
    case 'magic-item':
      return magicItemContent(await api.get<MagicItem>(path))
    case 'race':
      return raceContent(await api.get<RaceDetail>(path))
    case 'subrace':
      return subraceContent(await api.get<SubraceDetail>(path))
    case 'class': {
      const [cls, levels] = await Promise.all([api.get<ClassDetail>(path), api.get<LevelFeatures[]>(`${path}/levels`)])
      return classContent(cls, levels)
    }
    case 'condition':
      return conditionContent(await api.get<Condition>(path))
  }
}
