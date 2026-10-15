import { describe, expect, it } from 'vitest'
import { seededRng } from './random.ts'
import { rollDistinct, rollTable, table } from './randomTable.ts'

describe('random tables', () => {
  it('respects weights', () => {
    const t = table('t', 'Test', 'test', [['common', 9], 'rare'])
    const rng = seededRng(1)
    const rolls = Array.from({ length: 2000 }, () => rollTable(t, rng))
    const common = rolls.filter((r) => r === 'common').length / rolls.length
    expect(common).toBeGreaterThan(0.85)
    expect(common).toBeLessThan(0.95)
  })

  it('rolls distinct entries', () => {
    const t = table('t', 'Test', 'test', ['a', 'b', 'c'])
    const rolled = rollDistinct(t, 5, seededRng(2))
    expect(rolled).toHaveLength(3)
    expect(new Set(rolled).size).toBe(3)
  })

  it('fails loudly on an empty table', () => {
    expect(() => rollTable(table('t', 'Empty', 'test', []))).toThrow('no entries')
  })
})
