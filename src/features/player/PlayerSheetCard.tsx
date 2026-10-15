import type { LookupRef } from '../detail/resolveDetail.ts'
import { ABILITY_LABELS, spellLevelLabel } from '../npc/format.ts'
import { ABILITIES } from '../npc/rules.ts'
import npc from '../npc/NpcCard.module.css'
import type { PlayerSheet } from '../../types/models.ts'
import { lines } from './parseSheet.ts'
import type { SpellGroups } from './matchSpells.ts'
import styles from './PlayerSheetCard.module.css'

interface PlayerSheetCardProps {
  player: PlayerSheet & { sheet: NonNullable<PlayerSheet['sheet']> }
  /** SRD matches for the sheet's spells; undefined while loading or offline. */
  spells?: SpellGroups
  onLookup?: (ref: LookupRef) => void
}

const skillIndex = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

/** A player's uploaded sheet in the same layout as generated NPCs. */
export default function PlayerSheetCard({ player, spells, onLookup }: PlayerSheetCardProps) {
  const s = player.sheet
  const lookup = (ref: LookupRef, label: string = ref.name) =>
    onLookup ? (
      <button type="button" className={npc.lookup} onClick={() => onLookup(ref)}>
        {label}
      </button>
    ) : (
      label
    )

  const subtitle = [player.race, player.classLevel].filter(Boolean).join(' · ')
  const facts = [s.background, s.alignment, s.experience && `${s.experience} XP`].filter(Boolean).join(' · ')
  const vitals = [
    ['Hit Points', s.hitPoints],
    ['Armor Class', s.armorClass],
    ['Speed', s.speed],
    ['Initiative', s.initiative],
    ['Proficiency', s.proficiencyBonus],
    ['Passive Perception', s.passivePerception],
    ['Hit Dice', s.hitDice],
  ].filter(([, value]) => value)
  const saves = new Set(s.savingThrows.filter((t) => t.proficient).map((t) => t.ability))
  const skills = s.skills.filter((k) => k.proficient || k.value)
  const proficientSkills = skills.filter((k) => k.proficient)
  const otherSkills = skills.filter((k) => !k.proficient)
  const hasSpellcasting = Object.values(s.spellcasting).some(Boolean)
  const coins = Object.entries(s.coins)
  const personality = [
    ['Traits', s.personality.traits],
    ['Ideals', s.personality.ideals],
    ['Bonds', s.personality.bonds],
    ['Flaws', s.personality.flaws],
  ].filter(([, v]) => v)
  const appearance = Object.entries(s.appearance)

  const textList = (text: string) => (
    <ul className={npc.list}>
      {lines(text).map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  )

  return (
    <article className={npc.card} aria-label={`Player character ${player.name}`}>
      <header className={npc.header}>
        <span className={`${npc.badge} ${styles.player}`}>Player character</span>
        <div className={npc.nameRow}>
          <h2 className={npc.name}>{player.name}</h2>
        </div>
        {subtitle && <p className={npc.subtitle}>{subtitle}</p>}
        {facts && <p className={styles.facts}>{facts}</p>}
      </header>

      {vitals.length > 0 && (
        <dl className={`${npc.vitals} ${styles.vitals}`}>
          {vitals.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <ul className={npc.abilities}>
        {ABILITIES.map((ability) => {
          const save = saves.has(ability)
          const throwValue = s.savingThrows.find((t) => t.ability === ability)?.value
          return (
            <li key={ability} className={save ? npc.save : undefined}>
              <span className={npc.abbr} title={ABILITY_LABELS[ability]}>
                {ability.toUpperCase()}
              </span>
              <span className={npc.mod}>{s.abilityModifiers[ability] ?? '—'}</span>
              <span className={npc.score}>{s.abilityScores[ability] ?? '—'}</span>
              {save && (
                <span className={npc.saveMark} title="Saving throw proficiency">
                  ◆ Save {throwValue}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <div className={npc.columns}>
        <section>
          {skills.length > 0 && (
            <>
              <h3>Skills</h3>
              <ul className={npc.list}>
                {proficientSkills.map((k) => (
                  <li key={k.name}>
                    {lookup({ kind: 'skill', index: skillIndex(k.name), name: k.name })}{' '}
                    <span className={npc.muted}>{k.value}</span>
                  </li>
                ))}
              </ul>
              {otherSkills.length > 0 && (
                <p className={`${npc.tags} ${styles.otherSkills}`}>
                  {otherSkills.map((k, i) => (
                    <span key={k.name}>
                      {k.name} {k.value}
                      {i < otherSkills.length - 1 && ', '}
                    </span>
                  ))}
                </p>
              )}
            </>
          )}

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

          {s.proficienciesAndLanguages && (
            <>
              <h3>Proficiencies &amp; Languages</h3>
              {textList(s.proficienciesAndLanguages)}
            </>
          )}

          {(s.equipment || coins.length > 0) && (
            <>
              <h3>Equipment</h3>
              {s.equipment && textList(s.equipment)}
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
          )}
        </section>

        <section>
          {(hasSpellcasting || s.spells.length > 0) && (
            <>
              <h3>Spells</h3>
              {hasSpellcasting && (
                <p className={styles.note}>
                  {[
                    s.spellcasting.class,
                    s.spellcasting.ability && `Ability ${s.spellcasting.ability}`,
                    s.spellcasting.saveDc && `Save DC ${s.spellcasting.saveDc}`,
                    s.spellcasting.attackBonus && `Attack ${s.spellcasting.attackBonus}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {spells
                ? spells.byLevel.map((group) => (
                    <div key={group.level} className={npc.spellGroup}>
                      <h4>{spellLevelLabel(group.level)}</h4>
                      <p className={npc.tags}>
                        {group.spells.map((spell, i) => (
                          <span key={spell.index}>
                            {lookup({ kind: 'spell', index: spell.index, name: spell.name })}
                            {i < group.spells.length - 1 && ', '}
                          </span>
                        ))}
                      </p>
                    </div>
                  ))
                : null}
              {(spells ? spells.other : s.spells).length > 0 && (
                <div className={npc.spellGroup}>
                  {spells && spells.byLevel.length > 0 && <h4>Other spells</h4>}
                  <p className={npc.tags}>{(spells ? spells.other : s.spells).join(', ')}</p>
                </div>
              )}
            </>
          )}

          {s.featuresAndTraits && (
            <>
              <h3>Features &amp; Traits</h3>
              {textList(s.featuresAndTraits)}
            </>
          )}

          {personality.length > 0 && (
            <>
              <h3>Personality</h3>
              <dl className={styles.pairs}>
                {personality.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {appearance.length > 0 && (
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
          )}

          {s.backstory && (
            <>
              <h3>Backstory</h3>
              {lines(s.backstory).map((p, i) => (
                <p key={i} className={styles.paragraph}>
                  {p}
                </p>
              ))}
            </>
          )}

          {s.alliesAndOrganizations && (
            <>
              <h3>Allies &amp; Organizations</h3>
              {textList(s.alliesAndOrganizations)}
            </>
          )}

          {s.treasure && (
            <>
              <h3>Treasure</h3>
              {textList(s.treasure)}
            </>
          )}
        </section>
      </div>
    </article>
  )
}
