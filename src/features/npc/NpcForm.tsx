import { useState, type FormEvent } from 'react'
import type { ApiRef, NpcOptions } from '../../types/models.ts'
import { GENDERS, ROLE_LABELS, ROLES, type NpcRole } from './tables.ts'
import styles from './NpcForm.module.css'

interface NpcFormProps {
  races: ApiRef[]
  classes: ApiRef[]
  busy: boolean
  onSubmit: (options: NpcOptions) => void
}

const RANDOM = ''

export default function NpcForm({ races, classes, busy, onSubmit }: NpcFormProps) {
  const [role, setRole] = useState(RANDOM)
  const [gender, setGender] = useState(RANDOM)
  const [race, setRace] = useState(RANDOM)
  const [cls, setCls] = useState(RANDOM)
  const [level, setLevel] = useState(1)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit({
      role: (role || undefined) as NpcRole | undefined,
      gender: gender || undefined,
      race: race || undefined,
      class: cls || undefined,
      level,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <div className="field">
          <label htmlFor="npc-role">Role</label>
          <select id="npc-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value={RANDOM}>Random</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="npc-gender">Gender</label>
          <select id="npc-gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value={RANDOM}>Random</option>
            {GENDERS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="npc-race">Race</label>
          <select id="npc-race" value={race} onChange={(e) => setRace(e.target.value)}>
            <option value={RANDOM}>Random</option>
            {races.map((r) => (
              <option key={r.index} value={r.index}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="npc-class">Class</label>
          <select id="npc-class" value={cls} onChange={(e) => setCls(e.target.value)}>
            <option value={RANDOM}>Random</option>
            {classes.map((c) => (
              <option key={c.index} value={c.index}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="npc-level">Level</label>
          <input
            id="npc-level"
            type="number"
            min={1}
            max={20}
            value={level}
            onChange={(e) => setLevel(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
          />
        </div>
      </div>
      <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={busy}>
        {busy ? 'Summoning…' : 'Summon NPC'}
      </button>
    </form>
  )
}
