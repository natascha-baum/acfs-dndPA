import type { ApiRef } from '../../types/models.ts'
import type { LookupKind } from '../detail/resolveDetail.ts'

export interface WikiCategory {
  id: string
  label: string
  /** API list endpoint, e.g. "monsters". */
  listPath: string
  /** How an entry opens in the detail dialog. */
  kind: LookupKind
}

/** The tabs of the Wiki, in order. The first one opens by default. */
export const WIKI_CATEGORIES: WikiCategory[] = [
  { id: 'spells', label: 'Spells', listPath: 'spells', kind: 'spell' },
  { id: 'monsters', label: 'Monsters', listPath: 'monsters', kind: 'monster' },
  { id: 'magic-items', label: 'Magic Items', listPath: 'magic-items', kind: 'magic-item' },
  { id: 'equipment', label: 'Equipment', listPath: 'equipment', kind: 'equipment' },
  { id: 'races', label: 'Races', listPath: 'races', kind: 'race' },
  { id: 'classes', label: 'Classes', listPath: 'classes', kind: 'class' },
  { id: 'conditions', label: 'Conditions', listPath: 'conditions', kind: 'condition' },
]

export function findCategory(id: string | undefined): WikiCategory {
  return WIKI_CATEGORIES.find((c) => c.id === id) ?? WIKI_CATEGORIES[0]
}

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim()

/** Entries whose name contains the search text; all of them for an empty search. */
export function filterEntries(entries: ApiRef[], query: string): ApiRef[] {
  const q = normalize(query)
  return q ? entries.filter((e) => normalize(e.name).includes(q)) : entries
}
