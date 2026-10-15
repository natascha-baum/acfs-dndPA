import { useState, type FormEvent } from 'react'
import { CheckField, EditSection, EditorActions, NumberField, TextField } from '../../components/editor/fields.tsx'
import ed from '../../components/editor/editor.module.css'
import type { ImportedSheet, PlayerSheet } from '../../types/models.ts'
import { ABILITY_LABELS } from '../npc/format.ts'
import { ABILITIES } from '../npc/rules.ts'
import { emptySheet, finishPlayerEdit } from './editPlayer.ts'

interface PlayerEditorProps {
  player: PlayerSheet
  onSave: (edited: PlayerSheet) => void
  onCancel: () => void
  error?: string | null
}

const COINS = ['cp', 'sp', 'ep', 'gp', 'pp'] as const
const LOOKS = ['age', 'height', 'weight', 'eyes', 'skin', 'hair'] as const
const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

/** Form to change a player character; sheets without imported data can be filled in by hand. */
export default function PlayerEditor({ player, onSave, onCancel, error }: PlayerEditorProps) {
  const [draft, setDraft] = useState<PlayerSheet>(player)
  const sheet = draft.sheet

  const set = <K extends keyof PlayerSheet>(key: K, value: PlayerSheet[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const setSheet = <K extends keyof ImportedSheet>(key: K, value: ImportedSheet[K]) =>
    setDraft((d) => (d.sheet ? { ...d, sheet: { ...d.sheet, [key]: value } } : d))

  function submit(event: FormEvent) {
    event.preventDefault()
    onSave(finishPlayerEdit(draft, player))
  }

  const text = (label: string, key: keyof ImportedSheet, rows?: number) =>
    sheet && (
      <TextField
        label={label}
        value={sheet[key] as string}
        onChange={(v) => setSheet(key, v as never)}
        multiline={rows}
      />
    )

  return (
    <form className={ed.form} onSubmit={submit} aria-label={`Edit ${player.name}`}>
      <h2 className={ed.heading}>Edit {player.name}</h2>
      <p className={ed.intro}>Changes are saved in the app; the uploaded PDF stays as it was.</p>

      <EditSection title="Character">
        <TextField label="Name" value={draft.name} onChange={(v) => set('name', v)} required />
        <TextField label="Race" value={draft.race} onChange={(v) => set('race', v)} />
        <TextField label="Class & level" value={draft.classLevel} onChange={(v) => set('classLevel', v)} />
        {text('Background', 'background')}
        {text('Alignment', 'alignment')}
        {text('Experience points', 'experience')}
      </EditSection>

      {!sheet ? (
        <div className={ed.section}>
          <p className={ed.intro}>
            This sheet was kept as a PDF only. Fill in the full sheet to see it in the app’s own layout.
          </p>
          <p className={ed.intro}>
            <button type="button" className="btn" onClick={() => set('sheet', emptySheet())}>
              Fill in the full sheet
            </button>
          </p>
        </div>
      ) : (
        <>
          <EditSection title="Combat">
            {text('Hit points', 'hitPoints')}
            {text('Armor class', 'armorClass')}
            {text('Speed', 'speed')}
            {text('Initiative', 'initiative')}
            {text('Proficiency bonus', 'proficiencyBonus')}
            {text('Passive perception', 'passivePerception')}
            {text('Hit dice', 'hitDice')}
          </EditSection>

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
            {text('Attack notes', 'attacksNotes', 2)}
          </EditSection>

          <EditSection title="Spells">
            <TextField
              label="Spellcasting class"
              value={sheet.spellcasting.class}
              onChange={(v) => setSheet('spellcasting', { ...sheet.spellcasting, class: v })}
            />
            <TextField
              label="Spellcasting ability"
              value={sheet.spellcasting.ability}
              onChange={(v) => setSheet('spellcasting', { ...sheet.spellcasting, ability: v })}
            />
            <TextField
              label="Spell save DC"
              value={sheet.spellcasting.saveDc}
              onChange={(v) => setSheet('spellcasting', { ...sheet.spellcasting, saveDc: v })}
            />
            <TextField
              label="Spell attack bonus"
              value={sheet.spellcasting.attackBonus}
              onChange={(v) => setSheet('spellcasting', { ...sheet.spellcasting, attackBonus: v })}
            />
            <TextField
              label="Spells (one per line)"
              value={sheet.spells.join('\n')}
              onChange={(v) => setSheet('spells', v.split('\n'))}
              multiline={6}
            />
          </EditSection>

          <EditSection title="Proficiencies, equipment & features">
            {text('Proficiencies & languages', 'proficienciesAndLanguages', 4)}
            {text('Equipment', 'equipment', 5)}
            {COINS.map((coin) => (
              <TextField
                key={coin}
                label={coin.toUpperCase()}
                value={sheet.coins[coin] ?? ''}
                onChange={(v) => setSheet('coins', { ...sheet.coins, [coin]: v })}
              />
            ))}
            {text('Features & traits', 'featuresAndTraits', 6)}
          </EditSection>

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
            {text('Backstory', 'backstory', 6)}
            {text('Allies & organizations', 'alliesAndOrganizations', 3)}
            {text('Treasure', 'treasure', 3)}
          </EditSection>
        </>
      )}

      <EditorActions onCancel={onCancel} error={error} />
    </form>
  )
}
