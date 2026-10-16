import type { Character, PlayerSheet, Scene } from '../types/models.ts'
import type { FileStore } from './storage/files.ts'
import { StorageFullError, type Collection } from './storage/storage.ts'

// A backup is one JSON file with everything the user saved: NPCs, scenes,
// player sheets and their PDFs. It can be loaded again in any browser.

/** Version of the backup file itself; the collections carry their own schema versions. */
export const BACKUP_FORMAT = 1

export interface BackupSources {
  characters: Collection<Character>
  scenes: Collection<Scene>
  playerSheets: Collection<PlayerSheet>
  /** The PDFs of `playerSheets`, stored under the same id. */
  files: FileStore
}

type CollectionKey = 'characters' | 'scenes' | 'playerSheets'
const COLLECTION_KEYS: CollectionKey[] = ['characters', 'scenes', 'playerSheets']

interface StoredFile {
  type: string
  base64: string
}

export interface Backup {
  app: 'dndpa'
  format: typeof BACKUP_FORMAT
  exportedAt: string
  collections: Record<CollectionKey, { version: number; items: unknown[] }>
  files: Record<string, StoredFile>
}

export type BackupSummary = Record<CollectionKey | 'files', number>

/** A backup file that cannot be loaded; the message is shown to the user. */
export class BackupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupError'
  }
}

// btoa only takes a string of single-byte characters; converting in chunks
// keeps String.fromCharCode below the argument limit for large PDFs.
const CHUNK = 0x8000

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function createBackup(sources: BackupSources, now: () => Date = () => new Date()): Promise<Backup> {
  const files: Record<string, StoredFile> = {}
  for (const sheet of sources.playerSheets.list()) {
    const blob = await sources.files.get(sheet.id)
    if (blob) files[sheet.id] = { type: blob.type, base64: bytesToBase64(new Uint8Array(await blob.arrayBuffer())) }
  }
  const collection = (key: CollectionKey) => ({ version: sources[key].version, items: sources[key].list() })
  return {
    app: 'dndpa',
    format: BACKUP_FORMAT,
    exportedAt: now().toISOString(),
    collections: {
      characters: collection('characters'),
      scenes: collection('scenes'),
      playerSheets: collection('playerSheets'),
    },
    files,
  }
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

/** Reads and checks a backup file. Throws `BackupError` when it is not a usable backup. */
export function parseBackup(text: string): Backup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new BackupError('This file is not a backup: it could not be read as JSON.')
  }
  if (!isObject(data) || data.app !== 'dndpa') throw new BackupError('This file is not a backup from this app.')
  if (data.format !== BACKUP_FORMAT) {
    throw new BackupError('This backup was made with a different version of the app and cannot be loaded.')
  }

  const collections = isObject(data.collections) ? data.collections : {}
  function readCollection(key: CollectionKey): Backup['collections'][CollectionKey] {
    const entry = collections[key]
    if (
      isObject(entry) &&
      typeof entry.version === 'number' &&
      Array.isArray(entry.items) &&
      entry.items.every((item) => isObject(item) && typeof item.id === 'string')
    ) {
      return { version: entry.version, items: entry.items }
    }
    throw new BackupError(`This backup is damaged: the ${key} list is missing or broken.`)
  }

  const damagedFiles = new BackupError('This backup is damaged: the stored PDF files are broken.')
  if (!isObject(data.files)) throw damagedFiles
  const files: Record<string, StoredFile> = {}
  for (const [id, file] of Object.entries(data.files)) {
    if (!isObject(file) || typeof file.type !== 'string' || typeof file.base64 !== 'string') throw damagedFiles
    files[id] = { type: file.type, base64: file.base64 }
  }

  return {
    app: 'dndpa',
    format: BACKUP_FORMAT,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
    collections: {
      characters: readCollection('characters'),
      scenes: readCollection('scenes'),
      playerSheets: readCollection('playerSheets'),
    },
    files,
  }
}

export function summarizeBackup(backup: Backup): BackupSummary {
  return {
    characters: backup.collections.characters.items.length,
    scenes: backup.collections.scenes.items.length,
    playerSheets: backup.collections.playerSheets.items.length,
    files: Object.keys(backup.files).length,
  }
}

/**
 * Loads a backup into the stores. Items with an id that already exists replace
 * the stored one. A full browser storage throws `StorageFullError`.
 */
export async function restoreBackup(backup: Backup, sources: BackupSources): Promise<BackupSummary> {
  for (const key of COLLECTION_KEYS) {
    const { version, items } = backup.collections[key]
    try {
      sources[key].importItems(items, version)
    } catch (error) {
      if (error instanceof StorageFullError) throw error
      throw new BackupError(error instanceof Error ? error.message : 'The backup could not be loaded.')
    }
  }
  for (const [id, file] of Object.entries(backup.files)) {
    await sources.files.put(id, new Blob([base64ToBytes(file.base64)], { type: file.type }))
  }
  return summarizeBackup(backup)
}

export function backupFileName(date: Date): string {
  return `dndpa-backup-${date.toISOString().slice(0, 10)}.json`
}
