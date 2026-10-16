// The sections of PlayerSheetCard, one small component each. Every section
// renders nothing when the sheet has no data for it, so empty headings never show.
import type { LookupRef } from '../detail/resolveDetail.ts'
import { ABILITY_LABELS, spellLevelLabel } from '../npc/format.ts'
import { ABILITIES } from '../npc/rules.ts'
import npc from '../npc/NpcCard.module.css'
import type { ImportedSheet } from '../../types/models.ts'
import { lines } from './parseSheet.ts'
import type { SpellGroups } from './matchSpells.ts'
import styles from './PlayerSheetCard.module.css'

type OnLookup = ((ref: LookupRef) => void) | undefined

const skillIndex = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

/** A button that opens the detail dialog, or plain text when lookups are not possible. */
function Lookup({ target, onLookup }: { target: LookupRef; onLookup: OnLookup }) {
  if (!onLookup) return target.name
  return (
    <button type="button" className={npc.lookup} onClick={() => onLookup(target)}>
      {target.name}
    </button>
  )
}

/** One line of the text per list item. */
function TextList({ text }: { text: string }) {
  return (
    <ul className={npc.list}>
      {lines(text).map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  )
}

/** A heading with the text as a list, e.g. "Features & Traits". */
export function TextSection({ title, text }: { title: string; text: string }) {
  if (!text) return null
  return (
    <>
      <h3>{title}</h3>
      <TextList text={text} />
    </>
  )
}

/** Label / value pairs, only those with a value. */
function Pairs({ pairs, className }: { pairs: [string, string][]; className: string }) {
  const filled = pairs.filter(([, value]) => value)
  if (filled.length === 0) return null
  return (
    <dl className={className}>
      {filled.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Vitals({ sheet: s }: { sheet: ImportedSheet }) {
  return (
    <Pairs
      className={`${npc.vitals} ${styles.vitals}`}
      pairs={[
        ['Hit Points', s.hitPoints],
        ['Armor Class', s.armorClass],
        ['Speed', s.speed],
        ['Initiative', s.initiative],
        ['Proficiency', s.proficiencyBonus],
        ['Passive Perception', s.passivePerception],
        ['Hit Dice', s.hitDice],
      ]}
    />
  )
}

/** The six ability scores; proficient saving throws are marked with their bonus. */
export function Abilities({ sheet: s }: { sheet: ImportedSheet }) {
  return (
    <ul className={npc.abilities}>
      {ABILITIES.map((ability) => {
        const save = s.savingThrows.find((t) => t.ability === ability)
        const proficient = save?.proficient ?? false
        return (
          <li key={ability} className={proficient ? npc.save : undefined}>
            <span className={npc.abbr} title={ABILITY_LABELS[ability]}>
              {ability.toUpperCase()}
            </span>
            <span className={npc.mod}>{s.abilityModifiers[ability] ?? '—'}</span>
            <span className={npc.score}>{s.abilityScores[ability] ?? '—'}</span>
            {proficient && (
              <span className={npc.saveMark} title="Saving throw proficiency">
                ◆ Save {save?.value}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Proficient skills as a list (with lookups), the other filled-in skills as one line. */
export function Skills({ sheet: s, onLookup }: { sheet: ImportedSheet; onLookup: OnLookup }) {
  const skills = s.skills.filter((k) => k.proficient || k.value)
  if (skills.length === 0) return null
  const proficient = skills.filter((k) => k.proficient)
  const other = skills.filter((k) => !k.proficient)
  return (
    <>
      <h3>Skills</h3>
      <ul className={npc.list}>
        {proficient.map((k) => (
          <li key={k.name}>
            <Lookup target={{ kind: 'skill', index: skillIndex(k.name), name: k.name }} onLookup={onLookup} />{' '}
            <span className={npc.muted}>{k.value}</span>
          </li>
        ))}
      </ul>
      {other.length > 0 && (
        <p className={`${npc.tags} ${styles.otherSkills}`}>
          {other.map((k, i) => (
            <span key={k.name}>
              {k.name} {k.value}
              {i < other.length - 1 && ', '}
            </span>
          ))}
        </p>
      )}
    </>
  )
}

export function Attacks({ sheet: s }: { sheet: ImportedSheet }) {
  return (
    <>
      {s.attacks.length > 0 && (
        <>
          <h3>Attacks</h3>
          <table className={styles.attacks}>
            <thead>
              <tr>
                <th>Weapon</th>
                <th>Bonus</th>
                <th>Damage</th>
              </tr>
            </thead>
            <tbody>
              {s.attacks.map((a, i) => (
                <tr key={i}>
                  <td>{a.name}</td>
                  <td>{a.bonus}</td>
                  <td>{a.damage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {s.attacksNotes && <p className={styles.note}>{s.attacksNotes}</p>}
    </>
  )
}

export function Equipment({ sheet: s }: { sheet: ImportedSheet }) {
  const coins = Object.entries(s.coins)
  if (!s.equipment && coins.length === 0) return null
  return (
    <>
      <h3>Equipment</h3>
      {s.equipment && <TextList text={s.equipment} />}
      {coins.length > 0 && (
        <p className={styles.coins}>
          {coins.map(([coin, amount]) => (
            <span key={coin}>
              <strong>{amount}</strong> {coin.toUpperCase()}
            </span>
          ))}
        </p>
      )}
    </>
  )
}

/**
 * Spellcasting stats and the spells. With SRD matches (`spells`), known spells
 * are grouped by level and can be looked up; without them the names are listed as written.
 */
export function Spells({ sheet: s, spells, onLookup }: { sheet: ImportedSheet; spells?: SpellGroups; onLookup: OnLookup }) {
  const stats = [
    s.spellcasting.class,
    s.spellcasting.ability && `Ability ${s.spellcasting.ability}`,
    s.spellcasting.saveDc && `Save DC ${s.spellcasting.saveDc}`,
    s.spellcasting.attackBonus && `Attack ${s.spellcasting.attackBonus}`,
  ].filter(Boolean)
  if (stats.length === 0 && s.spells.length === 0) return null
  const other = spells ? spells.other : s.spells
  return (
    <>
      <h3>Spells</h3>
      {stats.length > 0 && <p className={styles.note}>{stats.join(' · ')}</p>}
      {spells?.byLevel.map((group) => (
        <div key={group.level} className={npc.spellGroup}>
          <h4>{spellLevelLabel(group.level)}</h4>
          <p className={npc.tags}>
            {group.spells.map((spell, i) => (
              <span key={spell.index}>
                <Lookup target={{ kind: 'spell', index: spell.index, name: spell.name }} onLookup={onLookup} />
                {i < group.spells.length - 1 && ', '}
              </span>
            ))}
          </p>
        </div>
      ))}
      {other.length > 0 && (
        <div className={npc.spellGroup}>
          {spells && spells.byLevel.length > 0 && <h4>Other spells</h4>}
          <p className={npc.tags}>{other.join(', ')}</p>
        </div>
      )}
    </>
  )
}

export function Personality({ sheet: s }: { sheet: ImportedSheet }) {
  const { traits, ideals, bonds, flaws } = s.personality
  if (!traits && !ideals && !bonds && !flaws) return null
  return (
    <>
      <h3>Personality</h3>
      <Pairs
        className={styles.pairs}
        pairs={[
          ['Traits', traits],
          ['Ideals', ideals],
          ['Bonds', bonds],
          ['Flaws', flaws],
        ]}
      />
    </>
  )
}

export function Appearance({ sheet: s }: { sheet: ImportedSheet }) {
  const appearance = Object.entries(s.appearance)
  if (appearance.length === 0) return null
  return (
    <>
      <h3>Appearance</h3>
      <p className={styles.coins}>
        {appearance.map(([label, value]) => (
          <span key={label}>
            <span className={npc.muted}>{label[0].toUpperCase() + label.slice(1)}</span> {value}
          </span>
        ))}
      </p>
    </>
  )
}

export function Backstory({ sheet: s }: { sheet: ImportedSheet }) {
  if (!s.backstory) return null
  return (
    <>
      <h3>Backstory</h3>
      {lines(s.backstory).map((p, i) => (
        <p key={i} className={styles.paragraph}>
          {p}
        </p>
      ))}
    </>
  )
}
