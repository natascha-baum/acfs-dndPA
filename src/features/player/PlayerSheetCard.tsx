import type { LookupRef } from '../detail/resolveDetail.ts'
import npc from '../npc/NpcCard.module.css'
import type { PlayerSheet } from '../../types/models.ts'
import type { SpellGroups } from './matchSpells.ts'
import styles from './PlayerSheetCard.module.css'
import {
  Abilities,
  Appearance,
  Attacks,
  Backstory,
  Equipment,
  Personality,
  Skills,
  Spells,
  TextSection,
  Vitals,
} from './PlayerSheetSections.tsx'

interface PlayerSheetCardProps {
  player: PlayerSheet & { sheet: NonNullable<PlayerSheet['sheet']> }
  /** SRD matches for the sheet's spells; undefined while loading or offline. */
  spells?: SpellGroups
  onLookup?: (ref: LookupRef) => void
}

/** A player's uploaded sheet in the same layout as generated NPCs. */
export default function PlayerSheetCard({ player, spells, onLookup }: PlayerSheetCardProps) {
  const s = player.sheet
  const subtitle = [player.race, player.classLevel].filter(Boolean).join(' · ')
  const facts = [s.background, s.alignment, s.experience && `${s.experience} XP`].filter(Boolean).join(' · ')

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

      <Vitals sheet={s} />
      <Abilities sheet={s} />

      <div className={npc.columns}>
        <section>
          <Skills sheet={s} onLookup={onLookup} />
          <Attacks sheet={s} />
          <TextSection title="Proficiencies & Languages" text={s.proficienciesAndLanguages} />
          <Equipment sheet={s} />
        </section>

        <section>
          <Spells sheet={s} spells={spells} onLookup={onLookup} />
          <TextSection title="Features & Traits" text={s.featuresAndTraits} />
          <Personality sheet={s} />
          <Appearance sheet={s} />
          <Backstory sheet={s} />
          <TextSection title="Allies & Organizations" text={s.alliesAndOrganizations} />
          <TextSection title="Treasure" text={s.treasure} />
        </section>
      </div>
    </article>
  )
}
