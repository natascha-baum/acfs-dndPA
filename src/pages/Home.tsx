import { Link } from 'react-router'
import Embers from '../components/Embers.tsx'
import FateDie from '../components/FateDie.tsx'
import Icon from '../components/Icon.tsx'
import TavernWisdom from '../components/TavernWisdom.tsx'
import { modules } from '../modules/registry.ts'
import styles from './Home.module.css'

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <Embers />
        <p className={styles.kicker}>Your companion for the table</p>
        <h1 className={styles.title}>
          D&amp;D Personal
          <br />
          Assistant
        </h1>
        <Icon name="flourish" className={styles.flourish} />
        <p className={styles.lead}>
          Summon strangers, conjure places and keep your heroes’ tales, all in one tome.
        </p>
        <FateDie />
      </section>

      <section aria-labelledby="tools-heading" className={styles.tools}>
        <h2 id="tools-heading" className={styles.sectionTitle}>
          Choose your path
        </h2>
        <div className={styles.grid}>
          {modules.map((m) => (
            <Link key={m.id} to={m.path} className={styles.card}>
              <span className={styles.cardIcon}>
                <Icon name={m.icon} />
              </span>
              <h3>{m.title}</h3>
              <p className={styles.flavor}>{m.flavor}</p>
              <p>{m.description}</p>
              <span className={styles.enter}>Enter →</span>
            </Link>
          ))}
        </div>
      </section>

      <TavernWisdom />
    </>
  )
}
