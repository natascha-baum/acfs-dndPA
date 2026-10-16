import { defaultRng, randomInt, type Rng } from '../../lib/random.ts'

/** `count` dice with `sides` sides, e.g. the `3d10` in `3d10+d8+2`. */
export interface DiceGroup {
  count: number
  sides: number
}

/** A dice formula such as `3d10+d8+2`: roll every group, add `modifier`. */
export interface DiceFormula {
  /** One group per die type, in the order typed. */
  groups: DiceGroup[]
  modifier: number
}

/** Advantage and disadvantage only apply to a single d20 (5e rules). */
export type RollMode = 'normal' | 'advantage' | 'disadvantage'

/** The dice rolled for one group. With advantage these are the two d20. */
export interface GroupRoll {
  sides: number
  dice: number[]
}

export interface RollResult {
  formula: DiceFormula
  mode: RollMode
  groups: GroupRoll[]
  /** The dice that count for the total. */
  kept: number[]
  total: number
  /** A natural 20 or 1 on a kept single d20. */
  critical?: 'success' | 'failure'
}

export const QUICK_DICE = [4, 6, 8, 10, 12, 20, 100] as const

const LIMITS = { dice: 100, groups: 10, sides: 1000, modifier: 1000 }
/** One term: an optional sign, then a dice group (`3d10`, `d8`) or a number. */
const TERM = /([+-])?(?:(\d*)d(\d+)|(\d+))/y

function withinLimits({ groups, modifier }: DiceFormula): boolean {
  const dice = groups.reduce((sum, g) => sum + g.count, 0)
  return (
    groups.length >= 1 &&
    groups.length <= LIMITS.groups &&
    dice <= LIMITS.dice &&
    groups.every((g) => g.count >= 1 && g.sides >= 2 && g.sides <= LIMITS.sides) &&
    Math.abs(modifier) <= LIMITS.modifier
  )
}

/** Adds `count` dice to the group with the same sides, or as a new group at the end. */
function addToGroups(groups: DiceGroup[], count: number, sides: number): DiceGroup[] {
  return groups.some((g) => g.sides === sides)
    ? groups.map((g) => (g.sides === sides ? { sides, count: g.count + count } : g))
    : [...groups, { count, sides }]
}

export function parseFormula(text: string): DiceFormula {
  const input = text.toLowerCase().replace(/\s+/g, '')
  const invalid = new Error(`"${text.trim()}" is not a dice roll. Try something like 3d10+d8+2.`)
  let formula: DiceFormula = { groups: [], modifier: 0 }
  TERM.lastIndex = 0
  while (TERM.lastIndex < input.length) {
    const first = TERM.lastIndex === 0
    const match = TERM.exec(input)
    if (!match) throw invalid
    const [, sign, count, sides, number] = match
    // Terms after the first need a sign; the first one has none.
    if (first === (sign !== undefined)) throw invalid
    if (number !== undefined) {
      formula = { ...formula, modifier: formula.modifier + Number(number) * (sign === '-' ? -1 : 1) }
    } else {
      // Dice can only be added: `d20-d4` is refused.
      if (sign === '-') throw invalid
      formula = { ...formula, groups: addToGroups(formula.groups, count ? Number(count) : 1, Number(sides)) }
    }
  }
  if (!withinLimits(formula)) throw invalid
  return formula
}

export function canUseAdvantage({ groups }: DiceFormula): boolean {
  return groups.length === 1 && groups[0].count === 1 && groups[0].sides === 20
}

/**
 * The formula with one more die of `sides`, for the quick buttons. Starts a new
 * formula when there is none; stays unchanged when the die would break a limit.
 */
export function addDie(formula: DiceFormula | undefined, sides: number): DiceFormula {
  if (!formula) return { groups: [{ count: 1, sides }], modifier: 0 }
  const next = { ...formula, groups: addToGroups(formula.groups, 1, sides) }
  return withinLimits(next) ? next : formula
}

const rollDie = (sides: number, rng: Rng) => 1 + randomInt(sides, rng)

export function rollFormula(formula: DiceFormula, mode: RollMode, rng: Rng = defaultRng): RollResult {
  if (mode !== 'normal' && !canUseAdvantage(formula)) {
    throw new Error('Advantage and disadvantage only work for a single d20.')
  }
  if (mode !== 'normal') {
    const dice = [rollDie(20, rng), rollDie(20, rng)]
    const kept = mode === 'advantage' ? Math.max(...dice) : Math.min(...dice)
    return finish(formula, mode, [{ sides: 20, dice }], [kept])
  }
  const groups = formula.groups.map(({ count, sides }) => ({
    sides,
    dice: Array.from({ length: count }, () => rollDie(sides, rng)),
  }))
  return finish(formula, mode, groups, groups.flatMap((g) => g.dice))
}

function finish(formula: DiceFormula, mode: RollMode, groups: GroupRoll[], kept: number[]): RollResult {
  const total = kept.reduce((sum, d) => sum + d, 0) + formula.modifier
  const natural = canUseAdvantage(formula) ? kept[0] : undefined
  const critical = natural === 20 ? 'success' : natural === 1 ? 'failure' : undefined
  return { formula, mode, groups, kept, total, ...(critical && { critical }) }
}

export function formulaText({ groups, modifier }: DiceFormula): string {
  const dice = groups.map(({ count, sides }) => `${count === 1 ? '' : count}d${sides}`).join('+')
  const mod = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : ''
  return `${dice}${mod}`
}

/**
 * One line for the history, e.g. `2d6+3 → [4, 2] + 3 = 9`, or with several
 * die types `3d10+d8+2 → d10 [4, 7, 1] + d8 [5] + 2 = 19`.
 */
export function formatRoll(result: RollResult): string {
  const { formula, mode, groups, kept, total } = result
  const head = mode === 'normal' ? formulaText(formula) : `${formulaText(formula)} with ${mode}`
  const dice =
    groups.length === 1
      ? `[${groups[0].dice.join(', ')}]`
      : groups.map((g) => `d${g.sides} [${g.dice.join(', ')}]`).join(' + ')
  const keep = mode === 'normal' ? '' : ` keep ${kept[0]}`
  const mod = formula.modifier === 0 ? '' : ` ${formula.modifier > 0 ? '+' : '−'} ${Math.abs(formula.modifier)}`
  return `${head} → ${dice}${keep}${mod} = ${total}`
}
