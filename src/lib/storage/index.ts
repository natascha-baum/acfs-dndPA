import type { Character, PlayerSheet, Scene } from '../../types/models.ts'
import { createFileStore } from './files.ts'
import { createCollection } from './storage.ts'
import { VERSIONS } from './versions.ts'

export { newId, StorageFullError } from './storage.ts'
export type { Collection } from './storage.ts'
export type { FileStore } from './files.ts'

// Versions and their history: see versions.ts.
export const characters = createCollection<Character>('characters', { version: VERSIONS.characters })
export const scenes = createCollection<Scene>('scenes', { version: VERSIONS.scenes })
export const playerSheets = createCollection<PlayerSheet>('player-sheets', { version: VERSIONS.playerSheets })
/** The PDF files of `playerSheets`, stored under the same id. */
export const playerSheetFiles = createFileStore('player-sheets')

/** Everything a backup contains (see `lib/backup.ts`). */
export const backupSources = { characters, scenes, playerSheets, files: playerSheetFiles }

/** User-facing message for a failed save. */
export const SAVE_FAILED_MESSAGE =
  'This could not be saved: your browser storage is full or blocked. Delete a few saved characters or scenes and try again.'
