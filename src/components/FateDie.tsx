import { useState } from 'react'
import Icon from './Icon.tsx'
import styles from './FateDie.module.css'

function verdict(roll: number): string {
  if (roll === 20) return 'Natural 20! The gods smile upon you.'
  if (roll === 1) return 'Critical fail. Perhaps stay in bed today.'
  if (roll >= 15) return 'Fortune favors the bold.'
  if (roll >= 8) return 'A fair day for adventure.'
  return 'Tread carefully, traveler.'
}

/** A clickable d20 that rolls today's fortune. */
export default function FateDie() {
  const [roll, setRoll] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)

  function rollDie() {
    if (rolling) return
    setRolling(true)
    window.setTimeout(() => {
      setRoll(1 + Math.floor(Math.random() * 20))
      setRolling(false)
    }, 700)
  }

  const tone = roll === 20 ? styles.crit : roll === 1 ? styles.fail : ''

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.die} ${rolling ? styles.rolling : ''} ${tone}`}
        onClick={rollDie}
        aria-label="Roll a d20 for your fortune"
      >
        <Icon name="d20" className={styles.icon} />
        <span className={styles.value} aria-hidden="true">
          {rolling ? '' : (roll ?? '20')}
        </span>
      </button>
      <p className={styles.caption} aria-live="polite">
        {rolling ? 'The die tumbles…' : roll === null ? 'Roll for your fortune' : verdict(roll)}
      </p>
    </div>
  )
}
