import type { Character, PlayerSheet, Scene } from '../../types/models.ts'
import { createFileStore } from './files.ts'
import { createCollection } from './storage.ts'

export { newId, StorageFullError } from './storage.ts'
export type { Collection } from './storage.ts'
export type { FileStore } from './files.ts'

// Schema versions of the stored models. When a model in types/models.ts
// changes, raise its version and add a `migrate` step that upgrades older
// items, so data already saved in a browser keeps working.
export const characters = createCollection<Character>('characters', { version: 1 })
export const scenes = createCollection<Scene>('scenes', { version: 1 })
export const playerSheets = createCollection<PlayerSheet>('player-sheets', { version: 1 })
/** The PDF files of `playerSheets`, stored under the same id. */
export const playerSheetFiles = createFileStore('player-sheets')

/** Everything a backup contains (see `lib/backup.ts`). */
export const backupSources = { characters, scenes, playerSheets, files: playerSheetFiles }

/** User-facing message for a failed save. */
export const SAVE_FAILED_MESSAGE =
  'This could not be saved: your browser storage is full or blocked. Delete a few saved characters or scenes and try again.'
