import { describe, expect, it } from 'vitest'
import wiki from './__fixtures__/srd-wiki.json'
import { resolveDetail, type DetailApi, type DetailContent } from './resolveDetail.ts'

const data: Record<string, unknown> = wiki
const requested: string[] = []
const api: DetailApi = {
  async get<T>(path: string) {
    requested.push(path)
    if (!(path in data)) throw new Error(`No fixture for ${path}`)
    // Fixture data stands in for the API response, like in resolveDetail.test.ts.
    return data[path] as T
  },
}

const fact = (d: DetailContent, label: string) => d.facts.find((f) => f.label === label)?.value
const linkNames = (d: DetailContent, label: string) => d.links.find((l) => l.label === label)?.items.map((i) => i.name)

describe('wiki entries', () => {
  it('shows a monster as a stat block', async () => {
    const d = await resolveDetail({ kind: 'monster', index: 'aboleth', name: 'Aboleth' }, api)
    expect(d.subtitle).toBe('Large aberration, lawful evil')
    expect(fact(d, 'Armor class')).toBe('17 (natural)')
    expect(fact(d, 'Hit points')).toBe('135 (18d10)')
    expect(fact(d, 'Speed')).toBe('10 ft., swim 40 ft.')
    expect(fact(d, 'STR')).toBe('21 (+5)')
    expect(fact(d, 'DEX')).toBe('9 (−1)')
    expect(fact(d, 'CHA')).toBe('18 (+4)')
    expect(fact(d, 'Saving throws')).toBe('CON +6, INT +8, WIS +6')
    expect(fact(d, 'Senses')).toBe('darkvision 120 ft., passive Perception 20')
    expect(fact(d, 'Challenge')).toBe('10 (5,900 XP)')
    const actions = d.sections?.find((s) => s.label === 'Actions')
    expect(actions?.paragraphs[0]).toMatch(/^Multiattack\. The aboleth makes three tentacle attacks\./)
    expect(d.sections?.map((s) => s.label)).toEqual(['Traits', 'Actions', 'Legendary actions'])
  })

  it('shows a magic item with its rarity and variants', async () => {
    const d = await resolveDetail({ kind: 'magic-item', index: 'ammunition', name: 'Ammunition' }, api)
    expect(d.subtitle).toBe('Ammunition · varies')
    expect(d.paragraphs.length).toBeGreaterThan(0)
    expect(linkNames(d, 'Variants')).toEqual(['Ammunition, +1', 'Ammunition, +2', 'Ammunition, +3'])
    expect(d.links[0].items[0]).toEqual({ kind: 'magic-item', index: 'ammunition-1', name: 'Ammunition, +1' })
  })

  it('shows a race with its traits and subraces', async () => {
    const d = await resolveDetail({ kind: 'race', index: 'elf', name: 'Elf' }, api)
    expect(fact(d, 'Speed')).toBe('30 ft.')
    expect(fact(d, 'Size')).toBe('Medium')
    expect(fact(d, 'Ability scores')).toBe('DEX +2')
    expect(linkNames(d, 'Traits')).toContain('Keen Senses')
    expect(linkNames(d, 'Subraces')).toEqual(['High Elf'])
    expect(d.paragraphs.some((p) => p.startsWith('Age.'))).toBe(true)
  })

  it('shows a subrace with its bonuses and traits', async () => {
    const d = await resolveDetail({ kind: 'subrace', index: 'high-elf', name: 'High Elf' }, api)
    expect(d.subtitle).toBe('Elf subrace')
    expect(fact(d, 'Ability scores')).toBe('INT +1')
    expect(linkNames(d, 'Traits')?.length).toBeGreaterThan(0)
  })

  it('shows a class with its features by level', async () => {
    requested.length = 0
    const d = await resolveDetail({ kind: 'class', index: 'wizard', name: 'Wizard' }, api)
    expect(requested).toEqual(['classes/wizard', 'classes/wizard/levels'])
    expect(fact(d, 'Hit die')).toBe('d6')
    expect(fact(d, 'Saving throws')).toBe('INT, WIS')
    expect(fact(d, 'Subclasses')).toBe('Evocation')
    const level1 = d.links.find((l) => l.label === 'Level 1')
    expect(level1?.items.map((i) => i.name)).toContain('Arcane Recovery')
    expect(level1?.items[0].kind).toBe('feature')
    const level2 = d.links.find((l) => l.label === 'Level 2')
    expect(level2?.items.map((i) => i.name)).toContain('Evocation Savant (Evocation)')
  })

  it('shows a condition with its rules', async () => {
    const d = await resolveDetail({ kind: 'condition', index: 'blinded', name: 'Blinded' }, api)
    expect(d.subtitle).toBe('Condition')
    expect(d.paragraphs[0]).toMatch(/can't see/)
  })
})
