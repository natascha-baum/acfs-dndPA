// Turns any API reference on a character sheet (spell, item, skill, trait,
// class feature, proficiency) into one display-ready shape.
import type { ApiRef } from '../../types/models.ts'

export type LookupKind = 'spell' | 'equipment' | 'proficiency' | 'skill' | 'trait' | 'feature' | 'category'

export interface LookupRef {
  kind: LookupKind
  index: string
  name: string
}

export interface DetailContent {
  title: string
  subtitle?: string
  facts: { label: string; value: string }[]
  paragraphs: string[]
  /** Related entries the user can open next, e.g. the contents of a pack. */
  links: { label: string; items: LookupRef[] }[]
}

export interface DetailApi {
  get<T>(path: string): Promise<T>
}

const PATHS: Record<LookupKind, string> = {
  spell: 'spells',
  equipment: 'equipment',
  proficiency: 'proficiencies',
  skill: 'skills',
  trait: 'traits',
  feature: 'features',
  category: 'equipment-categories',
}

interface Doc {
  index: string
  name: string
  desc?: string[] | string
  [key: string]: unknown
}

const paragraphs = (desc: Doc['desc']) => (Array.isArray(desc) ? desc : desc ? [desc] : [])
const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`

/** Maps an API url like "/api/2014/equipment/longsword" to a lookup ref. */
export function refFromUrl(ref: ApiRef): LookupRef | undefined {
  const match = /\/api\/2014\/([^/]+)\/([^/]+)$/.exec(ref.url)
  if (!match) return undefined
  const kind = (Object.keys(PATHS) as LookupKind[]).find((k) => PATHS[k] === match[1])
  return kind ? { kind, index: match[2], name: ref.name } : undefined
}

function spellContent(doc: Doc): DetailContent {
  const level = doc.level as number
  const school = (doc.school as ApiRef | undefined)?.name ?? ''
  const components = (doc.components as string[] | undefined)?.join(', ') ?? ''
  const material = doc.material ? ` (${doc.material as string})` : ''
  const duration = `${doc.concentration ? 'Concentration, ' : ''}${doc.duration as string}`
  return {
    title: doc.name,
    subtitle: level === 0 ? `${school} cantrip` : `${ordinal(level)}-level ${school.toLowerCase()}`,
    facts: [
      { label: 'Casting time', value: `${doc.casting_time as string}${doc.ritual ? ' (ritual)' : ''}` },
      { label: 'Range', value: doc.range as string },
      { label: 'Components', value: components + material },
      { label: 'Duration', value: duration },
    ],
    paragraphs: [...paragraphs(doc.desc), ...paragraphs(doc.higher_level as string[] | undefined).map((p) => `At higher levels: ${p}`)],
    links: [],
  }
}

function equipmentContent(doc: Doc): DetailContent {
  const facts: DetailContent['facts'] = []
  const cost = doc.cost as { quantity: number; unit: string } | undefined
  const damage = doc.damage as { damage_dice: string; damage_type: ApiRef } | undefined
  const twoHanded = doc.two_handed_damage as typeof damage
  const range = doc.range as { normal: number; long?: number } | undefined
  const ac = doc.armor_class as { base: number; dex_bonus: boolean; max_bonus?: number } | undefined
  if (damage) facts.push({ label: 'Damage', value: `${damage.damage_dice} ${damage.damage_type.name.toLowerCase()}` })
  if (twoHanded) facts.push({ label: 'Two-handed', value: `${twoHanded.damage_dice} ${twoHanded.damage_type.name.toLowerCase()}` })
  if (range && doc.weapon_range === 'Ranged') facts.push({ label: 'Range', value: `${range.normal}${range.long ? `/${range.long}` : ''} ft` })
  if (ac) {
    const dex = !ac.dex_bonus ? '' : ac.max_bonus !== undefined ? ` + DEX (max ${ac.max_bonus})` : ' + DEX'
    facts.push({ label: 'Armor class', value: doc.armor_category === 'Shield' ? `+${ac.base}` : `${ac.base}${dex}` })
  }
  if (doc.str_minimum) facts.push({ label: 'Strength', value: `${doc.str_minimum as number} required` })
  if (doc.stealth_disadvantage) facts.push({ label: 'Stealth', value: 'Disadvantage' })
  const properties = (doc.properties as ApiRef[] | undefined)?.map((p) => p.name).join(', ')
  if (properties) facts.push({ label: 'Properties', value: properties })
  if (cost) facts.push({ label: 'Cost', value: `${cost.quantity} ${cost.unit}` })
  if (doc.weight) facts.push({ label: 'Weight', value: `${doc.weight as number} lb` })

  const contents = (doc.contents as { item: ApiRef; quantity: number }[] | undefined) ?? []
  const category = [doc.armor_category && `${doc.armor_category as string} armor`, doc.category_range, (doc.gear_category as ApiRef | undefined)?.name]
    .find(Boolean) as string | undefined
  return {
    title: doc.name,
    subtitle: category ?? (doc.equipment_category as ApiRef | undefined)?.name,
    facts,
    paragraphs: paragraphs(doc.desc),
    links: contents.length
      ? [{ label: 'Contains', items: contents.map((c) => ({ kind: 'equipment' as const, index: c.item.index, name: c.quantity > 1 ? `${c.quantity}× ${c.item.name}` : c.item.name })) }]
      : [],
  }
}

export async function resolveDetail(ref: LookupRef, api: DetailApi): Promise<DetailContent> {
  const doc = await api.get<Doc>(`${PATHS[ref.kind]}/${ref.index}`)
  switch (ref.kind) {
    case 'spell':
      return spellContent(doc)
    case 'equipment':
      return equipmentContent(doc)
    case 'proficiency': {
      // A proficiency points at what it covers: a skill, an item or a whole category.
      const target = doc.reference as ApiRef | undefined
      const next = target && refFromUrl(target)
      if (next && next.kind !== 'proficiency') {
        const content = await resolveDetail(next, api)
        return { ...content, title: doc.name }
      }
      return { title: doc.name, subtitle: doc.type as string | undefined, facts: [], paragraphs: [], links: [] }
    }
    case 'skill':
      return {
        title: doc.name,
        subtitle: `Skill · ${(doc.ability_score as ApiRef | undefined)?.name ?? ''}`,
        facts: [],
        paragraphs: paragraphs(doc.desc),
        links: [],
      }
    case 'category': {
      const items = ((doc.equipment as ApiRef[] | undefined) ?? []).filter((e) => e.url.includes('/equipment/'))
      return {
        title: doc.name,
        subtitle: 'Equipment category',
        facts: [],
        paragraphs: [],
        links: [{ label: 'Includes', items: items.map((e) => ({ kind: 'equipment' as const, index: e.index, name: e.name })) }],
      }
    }
    case 'trait':
      return { title: doc.name, subtitle: 'Racial trait', facts: [], paragraphs: paragraphs(doc.desc), links: [] }
    case 'feature':
      return {
        title: doc.name,
        subtitle: `${(doc.class as ApiRef | undefined)?.name ?? 'Class'} feature · level ${doc.level as number}`,
        facts: [],
        paragraphs: paragraphs(doc.desc),
        links: [],
      }
  }
}
