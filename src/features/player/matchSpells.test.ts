import { describe, expect, it } from 'vitest'
import { groupSpells } from './matchSpells.ts'

const srd = [
  { index: 'cure-wounds', name: 'Cure Wounds', level: 1, url: '/api/2014/spells/cure-wounds' },
  { index: 'hunters-mark', name: "Hunter's Mark", level: 1, url: '/api/2014/spells/hunters-mark' },
  { index: 'guidance', name: 'Guidance', level: 0, url: '/api/2014/spells/guidance' },
  { index: 'pass-without-trace', name: 'Pass without Trace', level: 2, url: '/api/2014/spells/pass-without-trace' },
]

describe('groupSpells', () => {
  it('groups SRD spells by level and keeps unknown ones apart', () => {
    const groups = groupSpells(
      ['Hunter’s Mark', 'pass without trace (R)', 'Cure Wounds', 'Zephyr Strike', 'guidance', 'Cure wounds'],
      srd,
    )
    expect(groups.byLevel.map((g) => [g.level, g.spells.map((s) => s.index)])).toEqual([
      [0, ['guidance']],
      [1, ['hunters-mark', 'cure-wounds']],
      [2, ['pass-without-trace']],
    ])
    expect(groups.other).toEqual(['Zephyr Strike'])
  })
})
