import { useState, type FormEvent } from 'react'
import PageHeader from '../components/PageHeader.tsx'
import {
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
  const [text, setText] = useState('d20')
  const [mode, setMode] = useState<RollMode>('normal')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<RollResult[]>([])

  const typed = tryParse(text)
  const advantageAllowed = typed ? canUseAdvantage(typed) : false
  // The chosen mode is kept, but only shown as active where it applies.
  const shownMode = advantageAllowed ? mode : 'normal'
  const last = history[0]

  function roll(formula: DiceFormula) {
    const result = rollFormula(formula, canUseAdvantage(formula) ? mode : 'normal')
    setHistory((h) => [result, ...h].slice(0, HISTORY_SIZE))
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

  function quick(sides: number) {
    const formula = { count: 1, sides, modifier: 0 }
    setText(formulaText(formula))
    roll(formula)
  }

  return (
    <>
      <PageHeader title="Dice Roller" icon="d20">
        Let fate decide.
      </PageHeader>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.quick} role="group" aria-label="Quick dice">
          {QUICK_DICE.map((sides) => (
            <button key={sides} type="button" className="btn" onClick={() => quick(sides)}>
              d{sides}
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
              placeholder="2d6+3"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={error ? 'dice-error' : undefined}
            />
          </div>
          <button type="submit" className={`btn btn-primary ${styles.roll}`}>
            Roll
          </button>
        </div>

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
          <>
            <p
              className={`${styles.total} ${last.critical === 'success' ? styles.crit : ''} ${last.critical === 'failure' ? styles.fail : ''}`}
            >
              {last.total}
            </p>
            <p className={styles.detail}>{formatRoll(last)}</p>
            {last.critical && (
              <p className={styles.detail}>{last.critical === 'success' ? 'Natural 20!' : 'Natural 1…'}</p>
            )}
          </>
        )}
      </div>

      {history.length > 0 && (
        <section className={styles.history} aria-labelledby="dice-history">
          <div className={styles.historyHead}>
            <h2 id="dice-history">Last rolls</h2>
            <button type="button" className="btn" onClick={() => setHistory([])}>
              Clear
            </button>
          </div>
          <ol>
            {history.map((r, i) => (
              <li key={history.length - i}>{formatRoll(r)}</li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
