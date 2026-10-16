import type { RollResult } from './dice.ts'
import styles from './RolledDice.module.css'

/** Index of the d20 that does not count with advantage or disadvantage. */
function droppedIndex({ mode, groups, kept }: RollResult): number | undefined {
  if (mode === 'normal') return undefined
  return groups[0].dice.indexOf(kept[0]) === 0 ? 1 : 0
}

/**
 * The dice of one roll as small dice, grouped by type. They tumble briefly
 * before their number shows; give the component a new `key` for every roll
 * so the animation starts again.
 */
export default function RolledDice({ result }: { result: RollResult }) {
  const dropped = droppedIndex(result)
  return (
    <div className={styles.groups}>
      {result.groups.map((group) => (
        <div key={group.sides} className={styles.group}>
          <p className={styles.label}>
            {group.dice.length} × d{group.sides}
          </p>
          <ul className={styles.dice}>
            {group.dice.map((value, i) => (
              <li key={i} className={`${styles.die} ${i === dropped ? styles.dropped : ''}`}>
                <span className={styles.value}>{value}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
