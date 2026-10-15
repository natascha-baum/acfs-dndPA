import { useState, type CSSProperties } from 'react'
import styles from './Embers.module.css'

function createEmbers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 7 + Math.random() * 8,
    delay: -Math.random() * 15,
    drift: (Math.random() - 0.5) * 80,
  }))
}

/** Slowly rising sparks, purely decorative. */
export default function Embers({ count = 24 }: { count?: number }) {
  const [embers] = useState(() => createEmbers(count))

  return (
    <div className={styles.embers} aria-hidden="true">
      {embers.map((e) => (
        <span
          key={e.id}
          className={styles.ember}
          style={
            {
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              animationDuration: `${e.duration}s`,
              animationDelay: `${e.delay}s`,
              '--drift': `${e.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
