import { useState, type FormEvent } from 'react'
import PageHeader from '../components/PageHeader.tsx'
import RolledDice from '../features/dice/RolledDice.tsx'
import {
  addDie,
  canUseAdvantage,
  formatRoll,
  formulaText,
  parseFormula,
  QUICK_DICE,
  rollFormula,
  type DiceFormula,
  type RollMode,
  type RollResult,
} from '../features/dice/dice.ts'
import styles from './DiceRoller.module.css'

const HISTORY_SIZE = 20
const MODES: { id: RollMode; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'advantage', label: 'Advantage' },
  { id: 'disadvantage', label: 'Disadvantage' },
]

/** The formula in the text field, or undefined while it is not valid yet. */
function tryParse(text: string): DiceFormula | undefined {
  try {
    return parseFormula(text)
  } catch {
    return undefined
  }
}

export default function DiceRoller() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<RollMode>('normal')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<RollResult[]>([])
  // Counts every roll, so the dice animation restarts even for the same result.
  const [rollCount, setRollCount] = useState(0)

  const typed = tryParse(text)
  const advantageAllowed = typed ? canUseAdvantage(typed) : false
  // The chosen mode is kept, but only shown as active where it applies.
  const shownMode = advantageAllowed ? mode : 'normal'
  const last = history[0]

  function roll(formula: DiceFormula) {
    const result = rollFormula(formula, canUseAdvantage(formula) ? mode : 'normal')
    setHistory((h) => [result, ...h].slice(0, HISTORY_SIZE))
    setRollCount((n) => n + 1)
    setError(null)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      roll(parseFormula(text))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That is not a dice roll.')
    }
  }

  /** Quick buttons add one die to the formula; "Roll" rolls them all. */
  function quick(sides: number) {
    setText(formulaText(addDie(typed, sides)))
    setError(null)
  }

  function clearFormula() {
    setText('')
    setError(null)
  }

  return (
    <>
      <PageHeader title="Dice Roller" icon="d20">
        Let fate decide.
      </PageHeader>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.quick} role="group" aria-label="Add a die">
          {QUICK_DICE.map((sides) => (
            <button key={sides} type="button" className="btn" onClick={() => quick(sides)}>
              +d{sides}
            </button>
          ))}
        </div>

        <div className={styles.row}>
          <div className={`field ${styles.formula}`}>
            <label htmlFor="dice-formula">Formula</label>
            <input
              id="dice-formula"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="3d10+d8+2"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={error ? 'dice-error' : undefined}
            />
          </div>
          <button type="submit" className={`btn btn-primary ${styles.roll}`}>
            Roll
          </button>
        </div>
        <button type="button" className={`btn ${styles.clearFormula}`} onClick={clearFormula} disabled={!text}>
          Clear formula
        </button>

        <div className={styles.modes} role="radiogroup" aria-label="Roll mode">
          {MODES.map((m) => (
            <label key={m.id} className={styles.mode}>
              <input
                type="radio"
                name="dice-mode"
                value={m.id}
                checked={shownMode === m.id}
                disabled={m.id !== 'normal' && !advantageAllowed}
                onChange={() => setMode(m.id)}
              />
              {m.label}
            </label>
          ))}
        </div>
        {!advantageAllowed && <p className={styles.hint}>Advantage and disadvantage work for a single d20.</p>}

        {error && (
          <p id="dice-error" className="notice-error">
            {error}
          </p>
        )}
      </form>

      <div className={styles.result} aria-live="polite">
        {last && (
          <div key={rollCount}>
            <RolledDice result={last} />
            <p
              className={`${styles.total} ${last.critical === 'success' ? styles.crit : ''} ${last.critical === 'failure' ? styles.fail : ''}`}
            >
              {last.total}
            </p>
            <p className={styles.detail}>{formatRoll(last)}</p>
            {last.critical && (
              <p className={styles.detail}>{last.critical === 'success' ? 'Natural 20!' : 'Natural 1…'}</p>
            )}
          </div>
        )}
      </div>

      <RollHistory history={history} onClear={() => setHistory([])} />
    </>
  )
}

function RollHistory({ history, onClear }: { history: RollResult[]; onClear: () => void }) {
  if (history.length === 0) return null
  return (
    <section className={styles.history} aria-labelledby="dice-history">
      <div className={styles.historyHead}>
        <h2 id="dice-history">Last rolls</h2>
        <button type="button" className="btn" onClick={onClear}>
          Clear
        </button>
      </div>
      <ol>
        {history.map((r, i) => (
          <li key={history.length - i}>{formatRoll(r)}</li>
        ))}
      </ol>
    </section>
  )
}
