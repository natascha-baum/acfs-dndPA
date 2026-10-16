import { describe, expect, it } from 'vitest'
import { seededRng, type Rng } from '../../lib/random.ts'
import { canUseAdvantage, formatRoll, parseFormula, rollFormula } from './dice.ts'

/** An rng that returns the given values in order (each in [0, 1)). */
function fixed(...values: number[]): Rng {
  let i = 0
  return () => values[i++ % values.length]
}

/** The rng value that makes `1 + randomInt(sides)` return `face`. */
const face = (value: number, sides: number) => (value - 1) / sides

describe('parseFormula', () => {
  it.each([
    ['d20', { count: 1, sides: 20, modifier: 0 }],
    ['2d6+3', { count: 2, sides: 6, modifier: 3 }],
    ['4D8 - 1', { count: 4, sides: 8, modifier: -1 }],
    [' d100 ', { count: 1, sides: 100, modifier: 0 }],
  ])('reads %s', (text, formula) => {
    expect(parseFormula(text)).toEqual(formula)
  })

  it.each(['', 'd', '0d6', '101d6', '2d1', '2d1001', '2d6+x', '1d8+1d6', 'd20+1001'])('rejects "%s"', (text) => {
    expect(() => parseFormula(text)).toThrow(/Try something like 2d6\+3/)
  })
})

describe('rollFormula', () => {
  it('is reproducible with a seeded rng and keeps every die in range', () => {
    const formula = parseFormula('10d6')
    const a = rollFormula(formula, 'normal', seededRng(7))
    const b = rollFormula(formula, 'normal', seededRng(7))
    expect(a.dice).toEqual(b.dice)
    expect(a.dice).toHaveLength(10)
    expect(a.dice.every((d) => d >= 1 && d <= 6)).toBe(true)
  })

  it('adds the modifier to the sum of the dice', () => {
    const result = rollFormula(parseFormula('2d6+3'), 'normal', fixed(face(4, 6), face(2, 6)))
    expect(result.dice).toEqual([4, 2])
    expect(result.kept).toEqual([4, 2])
    expect(result.total).toBe(9)
  })

  it('keeps the higher d20 with advantage and the lower with disadvantage', () => {
    const rng = () => fixed(face(7, 20), face(15, 20))
    const adv = rollFormula(parseFormula('d20+5'), 'advantage', rng())
    expect(adv.dice).toEqual([7, 15])
    expect(adv.kept).toEqual([15])
    expect(adv.total).toBe(20)

    const dis = rollFormula(parseFormula('d20+5'), 'disadvantage', rng())
    expect(dis.kept).toEqual([7])
    expect(dis.total).toBe(12)
  })

  it('refuses advantage for anything but a single d20', () => {
    expect(canUseAdvantage(parseFormula('d20-1'))).toBe(true)
    expect(canUseAdvantage(parseFormula('2d6'))).toBe(false)
    expect(() => rollFormula(parseFormula('2d6'), 'advantage')).toThrow()
  })

  it('marks a natural 20 and a natural 1 on a kept d20 as critical', () => {
    expect(rollFormula(parseFormula('d20'), 'normal', fixed(face(20, 20))).critical).toBe('success')
    expect(rollFormula(parseFormula('d20+3'), 'normal', fixed(face(1, 20))).critical).toBe('failure')
    const dis = rollFormula(parseFormula('d20'), 'disadvantage', fixed(face(20, 20), face(1, 20)))
    expect(dis.critical).toBe('failure')
  })

  it('does not mark a 20 on other dice as critical', () => {
    expect(rollFormula(parseFormula('d100'), 'normal', fixed(face(20, 100))).critical).toBeUndefined()
    expect(rollFormula(parseFormula('2d20'), 'normal', fixed(face(20, 20))).critical).toBeUndefined()
  })
})

describe('formatRoll', () => {
  it('shows the dice, the modifier and the total', () => {
    const result = rollFormula(parseFormula('2d6+3'), 'normal', fixed(face(4, 6), face(2, 6)))
    expect(formatRoll(result)).toBe('2d6+3 → [4, 2] + 3 = 9')
  })

  it('names the mode and shows both d20 for advantage', () => {
    const result = rollFormula(parseFormula('d20-1'), 'advantage', fixed(face(7, 20), face(15, 20)))
    expect(formatRoll(result)).toBe('d20-1 with advantage → [7, 15] keep 15 − 1 = 14')
  })
})
