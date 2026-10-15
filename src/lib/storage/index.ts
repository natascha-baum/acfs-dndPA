import type { Character, Scene } from '../../types/models.ts'
import { createCollection } from './storage.ts'

export { newId } from './storage.ts'
export type { Collection } from './storage.ts'

export const characters = createCollection<Character>('characters')
export const scenes = createCollection<Scene>('scenes')
