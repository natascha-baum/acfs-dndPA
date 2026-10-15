import type { RandomTable, RandomTableEntry } from '../types/models.ts'
import { defaultRng, type Rng } from './random.ts'

/** Shorthand entries: plain text (weight 1) or [text, weight]. */
export type EntryInput = string | [text: string, weight: number]

export function table(id: string, name: string, category: string, entries: EntryInput[]): RandomTable {
  return {
    id,
    name,
    category,
    entries: entries.map((e): RandomTableEntry => (typeof e === 'string' ? { text: e } : { text: e[0], weight: e[1] })),
  }
}

/** Rolls one entry, respecting weights. */
export function rollTable(t: RandomTable, rng: Rng = defaultRng): string {
  const total = t.entries.reduce((sum, e) => sum + (e.weight ?? 1), 0)
  if (total <= 0) throw new Error(`Table "${t.id}" has no entries`)
  let roll = rng() * total
  for (const entry of t.entries) {
    roll -= entry.weight ?? 1
    if (roll < 0) return entry.text
  }
  return t.entries[t.entries.length - 1].text
}

/** Rolls `count` different entries (fewer if the table is smaller). */
export function rollDistinct(t: RandomTable, count: number, rng: Rng = defaultRng): string[] {
  const remaining = { ...t, entries: [...t.entries] }
  const results: string[] = []
  while (results.length < count && remaining.entries.length > 0) {
    const text = rollTable(remaining, rng)
    results.push(text)
    remaining.entries = remaining.entries.filter((e) => e.text !== text)
  }
  return results
}
