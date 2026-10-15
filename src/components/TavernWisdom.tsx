import { useState } from 'react'
import styles from './TavernWisdom.module.css'

const SAYINGS = [
  'Never split the party. Unless the bard insists.',
  'Always check the ceiling. Mimics are patient.',
  'A locked door is merely a suggestion to the rogue.',
  'The innkeeper knows more than they let on.',
  'If the treasure looks too easy, it is probably a trap.',
  'Dragons can be reasoned with. Briefly.',
  'Name your horse. The DM will remember if you don’t.',
  'Rest when you can; the night watch is always interrupted.',
  'Every goblin has a mother, and she is very angry.',
  'Fireball solves many problems and creates a few new ones.',
]

function pick(exclude?: string): string {
  const options = SAYINGS.filter((s) => s !== exclude)
  return options[Math.floor(Math.random() * options.length)]
}

/** A rotating piece of tavern advice for the home page. */
export default function TavernWisdom() {
  const [saying, setSaying] = useState(() => pick())

  return (
    <aside className={styles.scroll}>
      <h2 className={styles.title}>Overheard at the Tavern</h2>
      <blockquote className={styles.quote} aria-live="polite">
        “{saying}”
      </blockquote>
      <button type="button" className={styles.more} onClick={() => setSaying(pick(saying))}>
        Buy another round
      </button>
    </aside>
  )
}
