import { describe, expect, it } from 'vitest'
import type { PlayerSheet } from '../../types/models.ts'
import { emptySheet, finishPlayerEdit } from './editPlayer.ts'

const player: PlayerSheet = {
  id: 'p1',
  name: 'Mira',
  race: 'Wood Elf',
  classLevel: 'Ranger 3',
  fileName: 'mira.pdf',
  fileSize: 100,
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-15T00:00:00.000Z',
}

describe('finishPlayerEdit', () => {
  it('trims fields and drops empty rows', () => {
    const sheet = {
      ...emptySheet(),
      abilityScores: { str: 12, dex: Number.NaN },
      attacks: [
        { name: ' Longbow ', bonus: '+7', damage: '1d8+3' },
        { name: '', bonus: ' ', damage: '' },
      ],
      spells: ['Cure Wounds', '  ', ' Guidance '],
      coins: { gp: ' 12 ', sp: '' },
    }
    const done = finishPlayerEdit({ ...player, name: ' Mira T. ', sheet }, player)
    expect(done.name).toBe('Mira T.')
    expect(done.sheet?.abilityScores).toEqual({ str: 12 })
    expect(done.sheet?.attacks).toEqual([{ name: 'Longbow', bonus: '+7', damage: '1d8+3' }])
    expect(done.sheet?.spells).toEqual(['Cure Wounds', 'Guidance'])
    expect(done.sheet?.coins).toEqual({ gp: '12' })
  })

  it('keeps the old name when emptied and leaves sheets without data alone', () => {
    const done = finishPlayerEdit({ ...player, name: '' }, player)
    expect(done.name).toBe('Mira')
    expect(done.sheet).toBeUndefined()
  })
})

describe('emptySheet', () => {
  it('has all saves and skills to fill in', () => {
    expect(emptySheet().savingThrows).toHaveLength(6)
    expect(emptySheet().skills).toHaveLength(18)
  })
})
