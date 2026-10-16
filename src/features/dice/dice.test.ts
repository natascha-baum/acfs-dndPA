import { describe, expect, it } from 'vitest'
import { seededRng, type Rng } from '../../lib/random.ts'
import { addDie, canUseAdvantage, formatRoll, formulaText, parseFormula, rollFormula } from './dice.ts'

/** An rng that returns the given values in order (each in [0, 1)). */
function fixed(...values: number[]): Rng {
  let i = 0
  return () => values[i++ % values.length]
}

/** The rng value that makes `1 + randomInt(sides)` return `face`. */
const face = (value: number, sides: number) => (value - 1) / sides

describe('parseFormula', () => {
  const one = (count: number, sides: number, modifier = 0) => ({ groups: [{ count, sides }], modifier })

  it.each([
    ['d20', one(1, 20)],
    ['2d6+3', one(2, 6, 3)],
    ['4D8 - 1', one(4, 8, -1)],
    [' d100 ', one(1, 100)],
    ['d6+2d6', one(3, 6)],
    ['1d8+2+3', one(1, 8, 5)],
    ['3d10+1d8', { groups: [{ count: 3, sides: 10 }, { count: 1, sides: 8 }], modifier: 0 }],
    ['2d6 + d4 + 3', { groups: [{ count: 2, sides: 6 }, { count: 1, sides: 4 }], modifier: 3 }],
    ['d20+d4-1', { groups: [{ count: 1, sides: 20 }, { count: 1, sides: 4 }], modifier: -1 }],
  ])('reads %s', (text, formula) => {
    expect(parseFormula(text)).toEqual(formula)
  })

  const elevenTypes = Array.from({ length: 11 }, (_, i) => `d${i + 2}`).join('+')

  it.each([
    '',
    'd',
    '0d6',
    '101d6',
    '60d6+50d6',
    '2d1',
    '2d1001',
    '2d6+x',
    'd20+1001',
    'd20-d4',
    '2d6++3',
    '3d10+',
    '+d6',
    '5',
    elevenTypes,
  ])('rejects "%s"', (text) => {
    expect(() => parseFormula(text)).toThrow(/Try something like 3d10\+d8\+2/)
  })

  it('accepts ten die types', () => {
    const ten = Array.from({ length: 10 }, (_, i) => `d${i + 2}`).join('+')
    expect(parseFormula(ten).groups).toHaveLength(10)
  })
})

describe('rollFormula', () => {
  it('is reproducible with a seeded rng and keeps every die in range', () => {
    const formula = parseFormula('10d6')
    const a = rollFormula(formula, 'normal', seededRng(7))
    const b = rollFormula(formula, 'normal', seededRng(7))
    expect(a.groups).toEqual(b.groups)
    expect(a.groups[0].dice).toHaveLength(10)
    expect(a.kept.every((d) => d >= 1 && d <= 6)).toBe(true)
  })

  it('adds the modifier to the sum of the dice', () => {
    const result = rollFormula(parseFormula('2d6+3'), 'normal', fixed(face(4, 6), face(2, 6)))
    expect(result.groups).toEqual([{ sides: 6, dice: [4, 2] }])
    expect(result.kept).toEqual([4, 2])
    expect(result.total).toBe(9)
  })

  it('rolls every group of a mixed formula and adds them up', () => {
    const rng = fixed(face(4, 10), face(7, 10), face(1, 10), face(5, 8))
    const result = rollFormula(parseFormula('3d10+d8+2'), 'normal', rng)
    expect(result.groups).toEqual([
      { sides: 10, dice: [4, 7, 1] },
      { sides: 8, dice: [5] },
    ])
    expect(result.total).toBe(19)
    expect(result.critical).toBeUndefined()
  })

  it('keeps the higher d20 with advantage and the lower with disadvantage', () => {
    const rng = () => fixed(face(7, 20), face(15, 20))
    const adv = rollFormula(parseFormula('d20+5'), 'advantage', rng())
    expect(adv.groups).toEqual([{ sides: 20, dice: [7, 15] }])
    expect(adv.kept).toEqual([15])
    expect(adv.total).toBe(20)

    const dis = rollFormula(parseFormula('d20+5'), 'disadvantage', rng())
    expect(dis.kept).toEqual([7])
    expect(dis.total).toBe(12)
  })

  it('refuses advantage for anything but a single d20', () => {
    expect(canUseAdvantage(parseFormula('d20-1'))).toBe(true)
    expect(canUseAdvantage(parseFormula('d20+5'))).toBe(true)
    expect(canUseAdvantage(parseFormula('2d6'))).toBe(false)
    expect(canUseAdvantage(parseFormula('d20+d4'))).toBe(false)
    expect(() => rollFormula(parseFormula('2d6'), 'advantage')).toThrow()
    expect(() => rollFormula(parseFormula('d20+d4'), 'disadvantage')).toThrow()
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

describe('addDie', () => {
  const add = (text: string, sides: number) => formulaText(addDie(parseFormula(text), sides))

  it('adds a new die type at the end and grows an existing one', () => {
    expect(add('3d10', 8)).toBe('3d10+d8')
    expect(add('3d10+d8', 10)).toBe('4d10+d8')
  })

  it('keeps the modifier', () => {
    expect(add('2d6+2', 6)).toBe('3d6+2')
  })

  it('starts a new formula when there is none', () => {
    expect(formulaText(addDie(undefined, 20))).toBe('d20')
  })

  it('stays unchanged when the die would break a limit', () => {
    expect(add('100d6', 6)).toBe('100d6')
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

  it('shows each die type of a mixed roll', () => {
    const rng = fixed(face(4, 10), face(7, 10), face(1, 10), face(5, 8))
    const result = rollFormula(parseFormula('3d10+d8+2'), 'normal', rng)
    expect(formatRoll(result)).toBe('3d10+d8+2 → d10 [4, 7, 1] + d8 [5] + 2 = 19')
  })
})
