import { describe, expect, it } from 'vitest'
import { describeSummary } from './describe.ts'

describe('describeSummary', () => {
  it('names every kind of item with singular and plural', () => {
    expect(describeSummary({ characters: 2, scenes: 1, playerSheets: 0, files: 0 })).toBe(
      '2 NPCs, 1 scene and 0 player characters',
    )
    expect(describeSummary({ characters: 1, scenes: 3, playerSheets: 1, files: 1 })).toBe(
      '1 NPC, 3 scenes and 1 player character',
    )
  })
})
