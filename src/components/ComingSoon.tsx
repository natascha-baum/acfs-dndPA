import styles from './ComingSoon.module.css'

/** Placeholder panel for modules that are not built yet. */
export default function ComingSoon({ milestone }: { milestone: number }) {
  return (
    <div className={styles.panel}>
      <p className={styles.text}>The scribes are still at work on this chapter.</p>
      <p className={styles.meta}>Coming in Milestone {milestone}</p>
    </div>
  )
}
