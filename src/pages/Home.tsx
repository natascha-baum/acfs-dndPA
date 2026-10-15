import { Link } from 'react-router'
import { modules } from '../modules/registry.ts'
import styles from './Home.module.css'

export default function Home() {
  return (
    <>
      <h1>Your D&amp;D toolbox</h1>
      <p>Pick a tool to get started.</p>
      <div className={styles.grid}>
        {modules.map((m) => (
          <Link key={m.id} to={m.path} className={styles.tile}>
            <h2>{m.title}</h2>
            <p>{m.description}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
