import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import type { Character, PlayerSheet, Scene } from '../types/models.ts'
import {
  BackupError,
  backupFileName,
  base64ToBytes,
  bytesToBase64,
  createBackup,
  parseBackup,
  restoreBackup,
  summarizeBackup,
  type BackupSources,
} from './backup.ts'
import { createFileStore } from './storage/files.ts'
import { createCollection } from './storage/storage.ts'
import { memoryStore } from './testing.ts'

let dbCount = 0

function sources(): BackupSources {
  const store = memoryStore()
  return {
    characters: createCollection<Character>('characters', { store }),
    scenes: createCollection<Scene>('scenes', { store }),
    playerSheets: createCollection<PlayerSheet>('player-sheets', { store }),
    files: createFileStore(`backup-test-${dbCount++}`, () => indexedDB),
  }
}

const npc: Character = {
  id: 'npc-1',
  name: 'Grimble',
  role: 'enemy',
  gender: 'Male',
  race: { index: 'gnome', name: 'Gnome', url: '/api/2014/races/gnome' },
  class: { index: 'wizard', name: 'Wizard', url: '/api/2014/classes/wizard' },
  level: 2,
  abilityScores: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
  hitPoints: 12,
  armorClass: 12,
  speed: 25,
  proficiencyBonus: 2,
  savingThrows: ['int', 'wis'],
  skills: [],
  proficiencies: [],
  spells: [{ index: 'magic-missile', name: 'Magic Missile', url: '/api/2014/spells/magic-missile', level: 1 }],
  equipment: [],
  appearance: 'Ink-stained fingers',
  personality: 'Nervous',
  hook: 'Stole a spellbook',
  notes: '',
  createdAt: '2026-10-16T00:00:00.000Z',
  updatedAt: '2026-10-16T00:00:00.000Z',
}

const scene: Scene = {
  id: 'scene-1',
  title: 'The Whispering Hollow',
  locationType: 'forest',
  location: 'a clearing ringed by old oaks',
  timeOfDay: 'dusk',
  weather: 'a light drizzle',
  mood: 'watchful',
  details: ['a broken cart', 'distant howling', 'wet moss'],
  createdAt: '2026-10-16T00:00:00.000Z',
}

const player = (id: string): PlayerSheet => ({
  id,
  name: 'Aria',
  race: 'Half-Elf',
  classLevel: 'Bard 2',
  fileName: 'aria.pdf',
  fileSize: 6,
  createdAt: '2026-10-16T00:00:00.000Z',
  updatedAt: '2026-10-16T00:00:00.000Z',
})

async function filled(): Promise<BackupSources> {
  const s = sources()
  s.characters.save(npc)
  s.scenes.save(scene)
  s.playerSheets.save(player('pc-1'))
  await s.files.put('pc-1', new Blob([new Uint8Array([37, 80, 68, 70, 0, 255])], { type: 'application/pdf' }))
  return s
}

describe('base64 helpers', () => {
  it('turn bytes into text and back unchanged, also across chunks', () => {
    const bytes = new Uint8Array(100_000).map((_, i) => (i * 7) % 256)
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes)
  })
})

describe('createBackup / parseBackup / restoreBackup', () => {
  it('round-trips all items and PDF bytes into empty stores', async () => {
    const from = await filled()
    const backup = await createBackup(from, () => new Date('2026-10-16T12:00:00Z'))
    expect(backup.exportedAt).toBe('2026-10-16T12:00:00.000Z')

    const parsed = parseBackup(JSON.stringify(backup))
    const to = sources()
    const summary = await restoreBackup(parsed, to)

    expect(summary).toEqual({ characters: 1, scenes: 1, playerSheets: 1, files: 1 })
    expect(to.characters.list()).toEqual([npc])
    expect(to.scenes.list()).toEqual([scene])
    expect(to.playerSheets.list()).toEqual([player('pc-1')])
    const pdf = await to.files.get('pc-1')
    expect(pdf?.type).toBe('application/pdf')
    const bytes = await pdf?.arrayBuffer()
    expect(bytes && new Uint8Array(bytes)).toEqual(new Uint8Array([37, 80, 68, 70, 0, 255]))
  })

  it('does not duplicate items when the same backup is loaded twice', async () => {
    const backup = parseBackup(JSON.stringify(await createBackup(await filled())))
    const to = sources()
    await restoreBackup(backup, to)
    await restoreBackup(backup, to)
    expect(to.characters.list()).toHaveLength(1)
    expect(to.playerSheets.list()).toHaveLength(1)
  })

  it('skips a player sheet whose PDF is missing', async () => {
    const from = await filled()
    from.playerSheets.save(player('pc-2'))
    const backup = await createBackup(from)
    expect(Object.keys(backup.files)).toEqual(['pc-1'])
    expect(summarizeBackup(backup)).toEqual({ characters: 1, scenes: 1, playerSheets: 2, files: 1 })
  })
})

describe('parseBackup', () => {
  const valid = () => ({
    app: 'dndpa',
    format: 1,
    exportedAt: '2026-10-16T12:00:00.000Z',
    collections: {
      characters: { version: 1, items: [] },
      scenes: { version: 1, items: [] },
      playerSheets: { version: 1, items: [] },
    },
    files: {},
  })

  it('accepts a valid backup', () => {
    expect(parseBackup(JSON.stringify(valid())).format).toBe(1)
  })

  it.each([
    ['invalid JSON', '{nope'],
    ['another app', JSON.stringify({ ...valid(), app: 'other' })],
    ['an unknown format', JSON.stringify({ ...valid(), format: 2 })],
    ['a missing collection', JSON.stringify({ ...valid(), collections: { characters: { version: 1, items: [] } } })],
    ['items without an id', JSON.stringify({ ...valid(), collections: { ...valid().collections, scenes: { version: 1, items: [{}] } } })],
    ['a broken file entry', JSON.stringify({ ...valid(), files: { a: { type: 'application/pdf' } } })],
  ])('rejects %s with a BackupError', (_, text) => {
    expect(() => parseBackup(text)).toThrow(BackupError)
  })
})

describe('backupFileName', () => {
  it('uses the date of the export', () => {
    expect(backupFileName(new Date('2026-10-16T12:00:00Z'))).toBe('dndpa-backup-2026-10-16.json')
  })
})
