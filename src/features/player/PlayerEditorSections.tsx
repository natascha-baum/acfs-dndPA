// The sections of PlayerEditor for an imported sheet, one component each.
// Every section gets the sheet and `setSheet`, which changes one of its fields.
import { CheckField, EditSection, NumberField, TextField } from '../../components/editor/fields.tsx'
import ed from '../../components/editor/editor.module.css'
import type { ImportedSheet } from '../../types/models.ts'
import { ABILITY_LABELS } from '../npc/format.ts'
import { ABILITIES } from '../npc/rules.ts'

export type SetSheetField = <K extends keyof ImportedSheet>(key: K, value: ImportedSheet[K]) => void

interface SectionProps {
  sheet: ImportedSheet
  setSheet: SetSheetField
}

const COINS = ['cp', 'sp', 'ep', 'gp', 'pp'] as const
const LOOKS = ['age', 'height', 'weight', 'eyes', 'skin', 'hair'] as const
const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

type TextKey = { [K in keyof ImportedSheet]: ImportedSheet[K] extends string ? K : never }[keyof ImportedSheet]

/** A text field for one of the sheet's plain text values. */
export function SheetText({ sheet, setSheet, label, field, rows }: SectionProps & { label: string; field: TextKey; rows?: number }) {
  return <TextField label={label} value={sheet[field]} onChange={(v) => setSheet(field, v)} multiline={rows} />
}

export function CombatSection(props: SectionProps) {
  return (
    <EditSection title="Combat">
      <SheetText {...props} label="Hit points" field="hitPoints" />
      <SheetText {...props} label="Armor class" field="armorClass" />
      <SheetText {...props} label="Speed" field="speed" />
      <SheetText {...props} label="Initiative" field="initiative" />
      <SheetText {...props} label="Proficiency bonus" field="proficiencyBonus" />
      <SheetText {...props} label="Passive perception" field="passivePerception" />
      <SheetText {...props} label="Hit dice" field="hitDice" />
    </EditSection>
  )
}

export function AbilitySection({ sheet, setSheet }: SectionProps) {
  return (
    <EditSection title="Ability scores & saving throws">
      {ABILITIES.map((ability) => {
        const save = sheet.savingThrows.find((t) => t.ability === ability)
        const setSave = (patch: Partial<NonNullable<typeof save>>) =>
          setSheet(
            'savingThrows',
            sheet.savingThrows.map((t) => (t.ability === ability ? { ...t, ...patch } : t)),
          )
        return (
          <div key={ability} className={ed.ability}>
            <NumberField
              label={ABILITY_LABELS[ability]}
              value={sheet.abilityScores[ability] ?? Number.NaN}
              min={1}
              max={30}
              onChange={(v) => setSheet('abilityScores', { ...sheet.abilityScores, [ability]: v })}
            />
            <TextField
              label="Modifier"
              value={sheet.abilityModifiers[ability] ?? ''}
              onChange={(v) => setSheet('abilityModifiers', { ...sheet.abilityModifiers, [ability]: v })}
            />
            <TextField label="Save" value={save?.value ?? ''} onChange={(v) => setSave({ value: v })} />
            <CheckField label="Proficient" checked={!!save?.proficient} onChange={(on) => setSave({ proficient: on })} />
          </div>
        )
      })}
    </EditSection>
  )
}

export function SkillsSection({ sheet, setSheet }: SectionProps) {
  return (
    <EditSection title="Skills">
      {sheet.skills.map((skill) => {
        const setSkill = (patch: Partial<typeof skill>) =>
          setSheet(
            'skills',
            sheet.skills.map((k) => (k.name === skill.name ? { ...k, ...patch } : k)),
          )
        return (
          <div key={skill.name} className={ed.skill}>
            <TextField label={skill.name} value={skill.value} onChange={(v) => setSkill({ value: v })} />
            <CheckField label="Proficient" checked={skill.proficient} onChange={(on) => setSkill({ proficient: on })} />
          </div>
        )
      })}
    </EditSection>
  )
}

export function AttacksSection(props: SectionProps) {
  const { sheet, setSheet } = props
  return (
    <EditSection title="Attacks">
      {sheet.attacks.map((attack, i) => {
        const setAttack = (patch: Partial<typeof attack>) =>
          setSheet(
            'attacks',
            sheet.attacks.map((a, j) => (j === i ? { ...a, ...patch } : a)),
          )
        return (
          <div key={i} className={`${ed.row} ${ed.full}`}>
            <TextField label="Weapon" value={attack.name} onChange={(v) => setAttack({ name: v })} />
            <TextField label="Bonus" value={attack.bonus} onChange={(v) => setAttack({ bonus: v })} />
            <TextField label="Damage" value={attack.damage} onChange={(v) => setAttack({ damage: v })} />
            <button
              type="button"
              className={ed.remove}
              aria-label={`Remove attack ${attack.name || i + 1}`}
              title="Remove"
              onClick={() => setSheet('attacks', sheet.attacks.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        )
      })}
      <p className={ed.full}>
        <button
          type="button"
          className="btn"
          onClick={() => setSheet('attacks', [...sheet.attacks, { name: '', bonus: '', damage: '' }])}
        >
          + Add attack
        </button>
      </p>
      <SheetText {...props} label="Attack notes" field="attacksNotes" rows={2} />
    </EditSection>
  )
}

export function SpellsSection({ sheet, setSheet }: SectionProps) {
  const setCasting = (patch: Partial<ImportedSheet['spellcasting']>) =>
    setSheet('spellcasting', { ...sheet.spellcasting, ...patch })
  return (
    <EditSection title="Spells">
      <TextField label="Spellcasting class" value={sheet.spellcasting.class} onChange={(v) => setCasting({ class: v })} />
      <TextField
        label="Spellcasting ability"
        value={sheet.spellcasting.ability}
        onChange={(v) => setCasting({ ability: v })}
      />
      <TextField label="Spell save DC" value={sheet.spellcasting.saveDc} onChange={(v) => setCasting({ saveDc: v })} />
      <TextField
        label="Spell attack bonus"
        value={sheet.spellcasting.attackBonus}
        onChange={(v) => setCasting({ attackBonus: v })}
      />
      <TextField
        label="Spells (one per line)"
        value={sheet.spells.join('\n')}
        onChange={(v) => setSheet('spells', v.split('\n'))}
        multiline={6}
      />
    </EditSection>
  )
}

export function GearSection(props: SectionProps) {
  const { sheet, setSheet } = props
  return (
    <EditSection title="Proficiencies, equipment & features">
      <SheetText {...props} label="Proficiencies & languages" field="proficienciesAndLanguages" rows={4} />
      <SheetText {...props} label="Equipment" field="equipment" rows={5} />
      {COINS.map((coin) => (
        <TextField
          key={coin}
          label={coin.toUpperCase()}
          value={sheet.coins[coin] ?? ''}
          onChange={(v) => setSheet('coins', { ...sheet.coins, [coin]: v })}
        />
      ))}
      <SheetText {...props} label="Features & traits" field="featuresAndTraits" rows={6} />
    </EditSection>
  )
}

export function StorySection(props: SectionProps) {
  const { sheet, setSheet } = props
  return (
    <EditSection title="Personality & story">
      {(['traits', 'ideals', 'bonds', 'flaws'] as const).map((key) => (
        <TextField
          key={key}
          label={capitalize(key)}
          value={sheet.personality[key]}
          onChange={(v) => setSheet('personality', { ...sheet.personality, [key]: v })}
          multiline={2}
        />
      ))}
      {LOOKS.map((key) => (
        <TextField
          key={key}
          label={capitalize(key)}
          value={sheet.appearance[key] ?? ''}
          onChange={(v) => setSheet('appearance', { ...sheet.appearance, [key]: v })}
        />
      ))}
      <SheetText {...props} label="Backstory" field="backstory" rows={6} />
      <SheetText {...props} label="Allies & organizations" field="alliesAndOrganizations" rows={3} />
      <SheetText {...props} label="Treasure" field="treasure" rows={3} />
    </EditSection>
  )
}
