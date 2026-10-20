import { useState, type FormEvent } from 'react'
import { EditSection, EditorActions, TextField } from '../../components/editor/fields.tsx'
import ed from '../../components/editor/editor.module.css'
import type { PlayerSheet } from '../../types/models.ts'
import { emptySheet, finishPlayerEdit } from './editPlayer.ts'
import {
  AbilitySection,
  AttacksSection,
  CombatSection,
  GearSection,
  SheetText,
  SkillsSection,
  SpellsSection,
  StorySection,
  type SetSheetField,
} from './PlayerEditorSections.tsx'

interface PlayerEditorProps {
  player: PlayerSheet
  onSave: (edited: PlayerSheet) => void
  onCancel: () => void
  error?: string | null
}

/** Form to change a player character; sheets without imported data can be filled in by hand. */
export default function PlayerEditor({ player, onSave, onCancel, error }: PlayerEditorProps) {
  const [draft, setDraft] = useState<PlayerSheet>(player)
  const sheet = draft.sheet

  const set = <K extends keyof PlayerSheet>(key: K, value: PlayerSheet[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const setSheet: SetSheetField = (key, value) =>
    setDraft((d) => (d.sheet ? { ...d, sheet: { ...d.sheet, [key]: value } } : d))

  function submit(event: FormEvent) {
    event.preventDefault()
    onSave(finishPlayerEdit(draft, player))
  }

  return (
    <form className={ed.form} onSubmit={submit} aria-label={`Edit ${player.name}`}>
      <h2 className={ed.heading}>Edit {player.name}</h2>
      <p className={ed.intro}>Changes are saved in the app; the uploaded PDF stays as it was.</p>

      <EditSection title="Character">
        <TextField label="Name" value={draft.name} onChange={(v) => set('name', v)} required />
        <TextField label="Race" value={draft.race} onChange={(v) => set('race', v)} />
        <TextField label="Class & level" value={draft.classLevel} onChange={(v) => set('classLevel', v)} />
        {sheet && (
          <>
            <SheetText sheet={sheet} setSheet={setSheet} label="Background" field="background" />
            <SheetText sheet={sheet} setSheet={setSheet} label="Alignment" field="alignment" />
            <SheetText sheet={sheet} setSheet={setSheet} label="Experience points" field="experience" />
          </>
        )}
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
          <CombatSection sheet={sheet} setSheet={setSheet} />
          <AbilitySection sheet={sheet} setSheet={setSheet} />
          <SkillsSection sheet={sheet} setSheet={setSheet} />
          <AttacksSection sheet={sheet} setSheet={setSheet} />
          <SpellsSection sheet={sheet} setSheet={setSheet} />
          <GearSection sheet={sheet} setSheet={setSheet} />
          <StorySection sheet={sheet} setSheet={setSheet} />
        </>
      )}

      <EditorActions onCancel={onCancel} error={error} />
    </form>
  )
}
