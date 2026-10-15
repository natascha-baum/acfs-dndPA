import type { ApiClient } from '../../lib/api/client.ts'

export interface SpellListEntry {
  index: string
  name: string
  level: number
  url: string
}

export interface SpellGroups {
  /** SRD spells by level (0 = cantrips), in sheet order. */
  byLevel: { level: number; spells: SpellListEntry[] }[]
  /** Names the SRD does not know (other books, homebrew, typos). */
  other: string[]
}

// "Hunter’s Mark", "hunters mark" and "Hunter's Mark (concentration)" all match.
const key = (name: string) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '')

/** Sorts spell names from a sheet into SRD spells (with level) and the rest. */
export function groupSpells(names: string[], srd: SpellListEntry[]): SpellGroups {
  const byKey = new Map(srd.map((s) => [key(s.name), s]))
  const found: SpellListEntry[] = []
  const other: string[] = []
  for (const name of names) {
    const spell = byKey.get(key(name))
    if (spell && !found.includes(spell)) found.push(spell)
    else if (!spell) other.push(name)
  }
  const levels = [...new Set(found.map((s) => s.level))].sort((a, b) => a - b)
  return { byLevel: levels.map((level) => ({ level, spells: found.filter((s) => s.level === level) })), other }
}

/** Looks the sheet's spells up in the SRD spell list (one cached request). */
export async function matchSpells(names: string[], api: ApiClient): Promise<SpellGroups> {
  if (names.length === 0) return { byLevel: [], other: [] }
  const list = await api.get<{ results: SpellListEntry[] }>('spells')
  return groupSpells(names, list.results)
}
