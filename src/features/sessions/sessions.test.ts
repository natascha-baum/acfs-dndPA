import { describe, expect, it } from 'vitest'
import type { Character, PlayerSheet, Scene, Session, SessionEntry } from '../../types/models.ts'
import {
  addEntry,
  buttonLabel,
  countSessionsWith,
  createSession,
  editSession,
  groupEntries,
  hasEntry,
  removeEntry,
  toggleEntry,
  type SessionLookup,
} from './sessions.ts'

const T0 = new Date('2026-10-16T10:00:00.000Z')
const T1 = new Date('2026-10-16T11:00:00.000Z')

const session = (entries: SessionEntry[] = []): Session => ({
  ...createSession('Session 4', T0, 'session-1'),
  entries,
})

const goblin: SessionEntry = { kind: 'monster', ref: 'goblin', name: 'Goblin' }

const ref = (index: string) => ({ index, name: index, url: `/api/2014/x/${index}` })
const npc = (id: string, name: string, role: Character['role']): Character => ({
  id,
  name,
  role,
  gender: 'Female',
  race: ref('human'),
  class: ref('fighter'),
  level: 1,
  abilityScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  hitPoints: 11,
  armorClass: 16,
  speed: 30,
  proficiencyBonus: 2,
  savingThrows: [],
  skills: [],
  proficiencies: [],
  spells: [],
  equipment: [],
  appearance: '',
  personality: '',
  hook: '',
  notes: '',
  createdAt: T0.toISOString(),
  updatedAt: T0.toISOString(),
})
const player = (id: string, name: string): PlayerSheet => ({
  id,
  name,
  race: 'Half-Elf',
  classLevel: 'Bard 2',
  fileName: 'sheet.pdf',
  fileSize: 1,
  createdAt: T0.toISOString(),
  updatedAt: T0.toISOString(),
})
const scene = (id: string, title: string): Scene => ({
  id,
  title,
  locationType: 'tavern',
  location: '',
  timeOfDay: 'night',
  weather: '',
  mood: '',
  details: [],
  createdAt: T0.toISOString(),
})

function lookup(items: { npcs?: Character[]; players?: PlayerSheet[]; scenes?: Scene[] }): SessionLookup {
  return {
    npc: (id) => items.npcs?.find((c) => c.id === id),
    player: (id) => items.players?.find((p) => p.id === id),
    scene: (id) => items.scenes?.find((s) => s.id === id),
  }
}

describe('createSession and editSession', () => {
  it('trims the name and falls back to "Untitled session"', () => {
    expect(createSession('  Curse of the Mill  ', T0, 'a')).toEqual({
      id: 'a',
      name: 'Curse of the Mill',
      notes: '',
      entries: [],
      createdAt: T0.toISOString(),
      updatedAt: T0.toISOString(),
    })
    expect(createSession('   ', T0, 'b').name).toBe('Untitled session')
  })

  it('changes name and notes and sets updatedAt', () => {
    const edited = editSession(session(), { name: ' Session 5 ', notes: 'The heist' }, T1)
    expect(edited).toMatchObject({ name: 'Session 5', notes: 'The heist', updatedAt: T1.toISOString() })
    expect(editSession(session(), { name: '', notes: '' }, T1).name).toBe('Untitled session')
  })
})

describe('addEntry, removeEntry and toggleEntry', () => {
  it('adds an entry once and sets updatedAt', () => {
    const original = session()
    const added = addEntry(original, goblin, T1)
    expect(added.entries).toEqual([goblin])
    expect(added.updatedAt).toBe(T1.toISOString())
    expect(original.entries).toEqual([])
    expect(addEntry(added, { ...goblin, name: 'Goblin again' }, T1)).toBe(added)
  })

  it('treats the same ref of another kind as a different entry', () => {
    const withNpc = addEntry(session(), { kind: 'npc', ref: 'x', name: 'A' }, T1)
    const both = addEntry(withNpc, { kind: 'scene', ref: 'x', name: 'B' }, T1)
    expect(both.entries).toHaveLength(2)
    expect(hasEntry(both, 'npc', 'x')).toBe(true)
    expect(hasEntry(both, 'player', 'x')).toBe(false)
  })

  it('removes only the given entry', () => {
    const other: SessionEntry = { kind: 'npc', ref: 'npc-1', name: 'Grimble' }
    const removed = removeEntry(session([goblin, other]), 'monster', 'goblin', T1)
    expect(removed.entries).toEqual([other])
    expect(removed.updatedAt).toBe(T1.toISOString())
  })

  it('toggles an entry in and out', () => {
    const added = toggleEntry(session(), goblin, T1)
    expect(hasEntry(added, 'monster', 'goblin')).toBe(true)
    expect(hasEntry(toggleEntry(added, goblin, T1), 'monster', 'goblin')).toBe(false)
  })
})

describe('countSessionsWith', () => {
  it('counts the sessions that contain an item', () => {
    const sessions = [session([goblin]), session(), { ...session([goblin]), id: 'session-2' }]
    expect(countSessionsWith(sessions, 'monster', 'goblin')).toBe(2)
    expect(countSessionsWith(sessions, 'npc', 'goblin')).toBe(0)
  })
})

describe('groupEntries', () => {
  it('puts every kind in its group, sorted by name', () => {
    const s = session([
      { kind: 'npc', ref: 'n2', name: 'Zed' },
      { kind: 'scene', ref: 's1', name: 'The Gilded Tankard' },
      goblin,
      { kind: 'player', ref: 'p1', name: 'Aria' },
      { kind: 'npc', ref: 'n1', name: 'Bram' },
      { kind: 'npc', ref: 'n3', name: 'Mira' },
    ])
    const groups = groupEntries(
      s,
      lookup({
        npcs: [npc('n1', 'Bram', 'enemy'), npc('n2', 'Zed', 'enemy'), npc('n3', 'Mira', 'encounter')],
        players: [player('p1', 'Aria')],
        scenes: [scene('s1', 'The Gilded Tankard')],
      }),
    )
    const names = (lines: { name: string }[]) => lines.map((l) => l.name)
    expect(names(groups.players)).toEqual(['Aria'])
    expect(names(groups.enemies)).toEqual(['Bram', 'Goblin', 'Zed'])
    expect(names(groups.npcs)).toEqual(['Mira'])
    expect(names(groups.scenes)).toEqual(['The Gilded Tankard'])
    expect(groups.enemies.map((l) => l.kind)).toEqual(['npc', 'monster', 'npc'])
  })

  it('reads the NPC role and name as they are now', () => {
    const s = session([{ kind: 'npc', ref: 'n1', name: 'Old name' }])
    const groups = groupEntries(s, lookup({ npcs: [npc('n1', 'Bram the Bold', 'encounter')] }))
    expect(groups.enemies).toEqual([])
    expect(groups.npcs[0]).toMatchObject({ kind: 'npc', name: 'Bram the Bold' })
  })

  it('marks deleted items as missing and keeps their stored name', () => {
    const s = session([
      { kind: 'npc', ref: 'gone', name: 'Grimble' },
      { kind: 'player', ref: 'gone', name: 'Aria' },
      { kind: 'scene', ref: 'gone', name: 'The Old Mill' },
    ])
    const groups = groupEntries(s, lookup({}))
    expect(groups.npcs).toEqual([{ kind: 'missing', entry: s.entries[0], name: 'Grimble' }])
    expect(groups.players[0]).toMatchObject({ kind: 'missing', name: 'Aria' })
    expect(groups.scenes[0]).toMatchObject({ kind: 'missing', name: 'The Old Mill' })
  })
})

describe('buttonLabel', () => {
  it('says how many sessions an item is in', () => {
    expect(buttonLabel(0)).toBe('+ Add to session')
    expect(buttonLabel(1)).toBe('✓ In 1 session')
    expect(buttonLabel(2)).toBe('✓ In 2 sessions')
  })
})
