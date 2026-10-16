import { describe, expect, it } from 'vitest'
import type { ApiRef } from '../../types/models.ts'
import { LOOKUP_KINDS } from '../detail/resolveDetail.ts'
import { WIKI_CATEGORIES, filterEntries, findCategory } from './categories.ts'

const ref = (name: string): ApiRef => ({ index: name.toLowerCase().replace(/ /g, '-'), name, url: '' })
const spells = ['Acid Splash', 'Fire Bolt', 'Fireball', 'Wall of Fire'].map(ref)

describe('filterEntries', () => {
  it('finds names that contain the search, ignoring case and extra spaces', () => {
    expect(filterEntries(spells, 'fire').map((s) => s.name)).toEqual(['Fire Bolt', 'Fireball', 'Wall of Fire'])
    expect(filterEntries(spells, ' FIRE   bolt ').map((s) => s.name)).toEqual(['Fire Bolt'])
  })

  it('returns everything for an empty search', () => {
    expect(filterEntries(spells, '  ')).toEqual(spells)
  })
})

describe('WIKI_CATEGORIES', () => {
  it('has unique ids and list paths, and kinds the detail view knows', () => {
    const ids = WIKI_CATEGORIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(WIKI_CATEGORIES.map((c) => c.listPath)).size).toBe(ids.length)
    expect(WIKI_CATEGORIES.every((c) => LOOKUP_KINDS.includes(c.kind))).toBe(true)
  })

  it('starts with spells and falls back to it for unknown ids', () => {
    expect(WIKI_CATEGORIES[0].id).toBe('spells')
    expect(findCategory('monsters').label).toBe('Monsters')
    expect(findCategory('nonsense').id).toBe('spells')
    expect(findCategory(undefined).id).toBe('spells')
  })
})
