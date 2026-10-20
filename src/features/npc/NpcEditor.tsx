import { useState, type FormEvent } from 'react'
import { EditorActions } from '../../components/editor/fields.tsx'
import ed from '../../components/editor/editor.module.css'
import { api } from '../../lib/api/index.ts'
import { useAsync } from '../../hooks/useAsync.ts'
import type { Character, SpellRef } from '../../types/models.ts'
import { finishEdit } from './editNpc.ts'
import {
  AbilitySection,
  CombatSection,
  EquipmentSection,
  IdentitySection,
  ProficienciesSection,
  SkillsSection,
  SpellsSection,
  type SetField,
} from './NpcEditorSections.tsx'

interface NpcEditorProps {
  npc: Character
  onSave: (edited: Character) => void
  onCancel: () => void
  /** Shown above the buttons, e.g. when storage is full. */
  error?: string | null
  saveLabel?: string
}

// Spells the character's class can learn, for the "add spell" picker.
const loadClassSpells = async (classIndex: string): Promise<SpellRef[]> => {
  const list = await api.classSpells(classIndex)
  return (list.results as SpellRef[]).filter((s) => typeof s.level === 'number')
}

/** Inline form to change every part of an NPC by hand. */
export default function NpcEditor({ npc, onSave, onCancel, error, saveLabel }: NpcEditorProps) {
  const [draft, setDraft] = useState<Character>(npc)
  const classSpells = useAsync(npc.class.index, loadClassSpells)

  const set: SetField = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  function submit(event: FormEvent) {
    event.preventDefault()
    onSave(finishEdit(draft, npc))
  }

  return (
    <form className={ed.form} onSubmit={submit} aria-label={`Edit ${npc.name}`}>
      <h2 className={ed.heading}>Edit {npc.name}</h2>
      <p className={ed.intro}>
        {npc.subrace?.name ?? npc.race.name} {npc.class.name}. Change anything you like, then save.
      </p>

      <IdentitySection draft={draft} set={set} />
      <CombatSection draft={draft} set={set} />
      <AbilitySection draft={draft} set={set} />
      <SkillsSection draft={draft} set={set} />
      <ProficienciesSection draft={draft} set={set} />
      <EquipmentSection draft={draft} set={set} />
      <SpellsSection draft={draft} set={set} classSpells={classSpells} />

      <EditorActions onCancel={onCancel} error={error} saveLabel={saveLabel} />
    </form>
  )
}
