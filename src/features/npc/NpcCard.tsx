import type { ApiRef, Character } from '../../types/models.ts'
import type { LookupKind, LookupRef } from '../detail/resolveDetail.ts'
import { abilityModifier, ABILITIES, formatModifier } from './rules.ts'
import { ABILITY_LABELS, SKILL_ABILITY, skillName, spellLevelLabel } from './format.ts'
import { ROLE_LABELS, type NpcRole } from './tables.ts'
import styles from './NpcCard.module.css'

export type RerollField = 'name' | 'appearance' | 'personality' | 'hook'

interface NpcCardProps {
  npc: Character
  onReroll?: (field: RerollField) => void
  /** When given, spells, items, skills and proficiencies become clickable. */
  onLookup?: (ref: LookupRef) => void
}

function RerollButton({ label, onClick }: { label: string; onClick?: () => void }) {
  if (!onClick) return null
  return (
    <button type="button" className={styles.reroll} onClick={onClick} aria-label={`Re-roll ${label}`} title={`Re-roll ${label}`}>
      ↻
    </button>
  )
}

export default function NpcCard({ npc, onReroll, onLookup }: NpcCardProps) {
  const entry = (kind: LookupKind, ref: ApiRef, label: string = ref.name) =>
    onLookup ? (
      <button type="button" className={styles.lookup} onClick={() => onLookup({ kind, index: ref.index, name: ref.name })}>
        {label}
      </button>
    ) : (
      label
    )
  const entries = (kind: LookupKind, refs: ApiRef[]) =>
    refs.map((ref, i) => (
      <span key={ref.index}>
        {entry(kind, ref)}
        {i < refs.length - 1 && ', '}
      </span>
    ))

  const reroll = (field: RerollField) => (onReroll ? () => onReroll(field) : undefined)
  const mod = (ability: keyof typeof npc.abilityScores) => abilityModifier(npc.abilityScores[ability])
  const raceName = npc.subrace?.name ?? npc.race.name
  const spellGroups = [...new Set(npc.spells.map((s) => s.level))].map((level) => ({
    level,
    spells: npc.spells.filter((s) => s.level === level),
  }))

  return (
    <article className={styles.card} aria-label={`NPC ${npc.name}`}>
      <header className={styles.header}>
        {npc.role !== 'player' && (
          <span className={`${styles.badge} ${npc.role === 'enemy' ? styles.enemy : styles.encounter}`}>
            {ROLE_LABELS[npc.role as NpcRole]}
          </span>
        )}
        <div className={styles.nameRow}>
          <h2 className={styles.name}>{npc.name}</h2>
          <RerollButton label="name" onClick={reroll('name')} />
        </div>
        <p className={styles.subtitle}>
          {npc.gender} {raceName} {npc.class.name} · Level {npc.level}
        </p>
      </header>

      <div className={styles.hook}>
        <p>{npc.hook}</p>
        <RerollButton label="story hook" onClick={reroll('hook')} />
      </div>

      <dl className={styles.vitals}>
        <div>
          <dt>Hit Points</dt>
          <dd>{npc.hitPoints}</dd>
        </div>
        <div>
          <dt>Armor Class</dt>
          <dd>{npc.armorClass}</dd>
        </div>
        <div>
          <dt>Speed</dt>
          <dd>{npc.speed} ft</dd>
        </div>
        <div>
          <dt>Proficiency</dt>
          <dd>{formatModifier(npc.proficiencyBonus)}</dd>
        </div>
      </dl>

      <ul className={styles.abilities}>
        {ABILITIES.map((ability) => {
          const save = npc.savingThrows.includes(ability)
          return (
            <li key={ability} className={save ? styles.save : undefined}>
              <span className={styles.abbr} title={ABILITY_LABELS[ability]}>
                {ability.toUpperCase()}
              </span>
              <span className={styles.mod}>{formatModifier(mod(ability))}</span>
              <span className={styles.score}>{npc.abilityScores[ability]}</span>
              {save && <span className={styles.saveMark} title="Saving throw proficiency">◆ Save</span>}
            </li>
          )
        })}
      </ul>

      <div className={styles.columns}>
        <section>
          <h3>Skills</h3>
          <ul className={styles.list}>
            {npc.skills.map((skill) => {
              const ability = SKILL_ABILITY[skill.index]
              const bonus = (ability ? mod(ability) : 0) + npc.proficiencyBonus
              return (
                <li key={skill.index}>
                  {entry('proficiency', skill, skillName(skill.name))}{' '}
                  <span className={styles.muted}>{formatModifier(bonus)}</span>
                </li>
              )
            })}
          </ul>

          <h3>Proficiencies</h3>
          <p className={styles.tags}>
            {npc.proficiencies.length ? entries('proficiency', npc.proficiencies) : '—'}
          </p>

          <h3>Equipment</h3>
          <ul className={styles.list}>
            {npc.equipment.map((e) => (
              <li key={e.item.index}>
                {e.quantity > 1 && <span className={styles.muted}>{e.quantity}× </span>}
                {entry('equipment', e.item)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Spells</h3>
          {spellGroups.length === 0 ? (
            <p className={styles.muted}>No spells.</p>
          ) : (
            spellGroups.map((group) => (
              <div key={group.level} className={styles.spellGroup}>
                <h4>{spellLevelLabel(group.level)}</h4>
                <p className={styles.tags}>{entries('spell', group.spells)}</p>
              </div>
            ))
          )}

          <h3>
            Appearance <RerollButton label="appearance" onClick={reroll('appearance')} />
          </h3>
          <p>{npc.appearance}</p>

          <h3>
            Personality <RerollButton label="personality" onClick={reroll('personality')} />
          </h3>
          <p>{npc.personality}</p>
        </section>
      </div>
    </article>
  )
}
