import type { Character, PlayerSheet, Scene } from '../../types/models.ts'
import { createFileStore } from './files.ts'
import { createCollection } from './storage.ts'

export { newId } from './storage.ts'
export type { Collection } from './storage.ts'
export type { FileStore } from './files.ts'

export const characters = createCollection<Character>('characters')
export const scenes = createCollection<Scene>('scenes')
export const playerSheets = createCollection<PlayerSheet>('player-sheets')
/** The PDF files of `playerSheets`, stored under the same id. */
export const playerSheetFiles = createFileStore('player-sheets')
