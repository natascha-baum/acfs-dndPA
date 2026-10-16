import { defaultRng, randomInt, type Rng } from '../../lib/random.ts'

/** A dice formula such as `2d6+3`: roll `count` dice with `sides` sides, add `modifier`. */
export interface DiceFormula {
  count: number
  sides: number
  modifier: number
}

/** Advantage and disadvantage only apply to a single d20 (5e rules). */
export type RollMode = 'normal' | 'advantage' | 'disadvantage'

export interface RollResult {
  formula: DiceFormula
  mode: RollMode
  /** Every die rolled, in order. With advantage these are the two d20. */
  dice: number[]
  /** The dice that count for the total. */
  kept: number[]
  total: number
  /** A natural 20 or 1 on a kept single d20. */
  critical?: 'success' | 'failure'
}

export const QUICK_DICE = [4, 6, 8, 10, 12, 20, 100] as const

const LIMITS = { count: 100, sides: 1000, modifier: 1000 }
const FORMULA = /^(\d*)d(\d+)(?:([+-])(\d+))?$/

export function parseFormula(text: string): DiceFormula {
  const match = FORMULA.exec(text.toLowerCase().replace(/\s+/g, ''))
  const invalid = new Error(`"${text.trim()}" is not a dice roll. Try something like 2d6+3.`)
  if (!match) throw invalid
  const [, count, sides, sign, modifier] = match
  const formula: DiceFormula = {
    count: count ? Number(count) : 1,
    sides: Number(sides),
    modifier: modifier ? Number(modifier) * (sign === '-' ? -1 : 1) : 0,
  }
  const inRange =
    formula.count >= 1 &&
    formula.count <= LIMITS.count &&
    formula.sides >= 2 &&
    formula.sides <= LIMITS.sides &&
    Math.abs(formula.modifier) <= LIMITS.modifier
  if (!inRange) throw invalid
  return formula
}

export function canUseAdvantage(formula: DiceFormula): boolean {
  return formula.count === 1 && formula.sides === 20
}

const rollDie = (sides: number, rng: Rng) => 1 + randomInt(sides, rng)

export function rollFormula(formula: DiceFormula, mode: RollMode, rng: Rng = defaultRng): RollResult {
  if (mode !== 'normal' && !canUseAdvantage(formula)) {
    throw new Error('Advantage and disadvantage only work for a single d20.')
  }
  const rolls = mode === 'normal' ? formula.count : 2
  const dice = Array.from({ length: rolls }, () => rollDie(formula.sides, rng))
  const kept =
    mode === 'advantage' ? [Math.max(...dice)] : mode === 'disadvantage' ? [Math.min(...dice)] : dice
  const total = kept.reduce((sum, d) => sum + d, 0) + formula.modifier
  const natural = canUseAdvantage(formula) ? kept[0] : undefined
  const critical = natural === 20 ? 'success' : natural === 1 ? 'failure' : undefined
  return { formula, mode, dice, kept, total, ...(critical && { critical }) }
}

export function formulaText({ count, sides, modifier }: DiceFormula): string {
  const mod = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : ''
  return `${count === 1 ? '' : count}d${sides}${mod}`
}

/** One line for the history, e.g. `2d6+3 → [4, 2] + 3 = 9`. */
export function formatRoll(result: RollResult): string {
  const { formula, mode, dice, kept, total } = result
  const head = mode === 'normal' ? formulaText(formula) : `${formulaText(formula)} with ${mode}`
  const keep = mode === 'normal' ? '' : ` keep ${kept[0]}`
  const mod = formula.modifier === 0 ? '' : ` ${formula.modifier > 0 ? '+' : '−'} ${Math.abs(formula.modifier)}`
  return `${head} → [${dice.join(', ')}]${keep}${mod} = ${total}`
}
