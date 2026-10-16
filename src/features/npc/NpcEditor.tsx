import { useState, type FormEvent } from 'react'
import {
  CheckField,
  Chip,
  ChipList,
  EditSection,
  EditorActions,
  NumberField,
  TextField,
} from '../../components/editor/fields.tsx'
import ed from '../../components/editor/editor.module.css'
import { api } from '../../lib/api/index.ts'
import { useAsync } from '../../hooks/useAsync.ts'
import type { Character, SpellRef } from '../../types/models.ts'
import { customRef, finishEdit, SKILL_REFS } from './editNpc.ts'
import { ABILITY_LABELS, skillName, spellLevelLabel } from './format.ts'
import { ABILITIES } from './rules.ts'
import { GENDERS, ROLE_LABELS, ROLES } from './tables.ts'

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
  const [newSkill, setNewSkill] = useState('')
  const [newProficiency, setNewProficiency] = useState('')
  const [newItem, setNewItem] = useState('')
  const [newSpell, setNewSpell] = useState('')
  const classSpells = useAsync(npc.class.index, loadClassSpells)

  const set = <K extends keyof Character>(key: K, value: Character[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const without = <T extends { index: string }>(items: T[], index: string) => items.filter((i) => i.index !== index)

  const missingSkills = SKILL_REFS.filter((s) => !draft.skills.some((k) => k.index === s.index))
  const learnable =
    classSpells.status === 'ready'
      ? classSpells.data.filter((s) => !draft.spells.some((k) => k.index === s.index))
      : []

  function submit(event: FormEvent) {
    event.preventDefault()
    onSave(finishEdit(draft, npc))
  }

  function addSkill() {
    const skill = SKILL_REFS.find((s) => s.index === newSkill)
    if (skill) set('skills', [...draft.skills, skill])
    setNewSkill('')
  }

  function addProficiency() {
    if (newProficiency.trim()) set('proficiencies', [...draft.proficiencies, customRef(newProficiency)])
    setNewProficiency('')
  }

  function addItem() {
    if (newItem.trim()) set('equipment', [...draft.equipment, { item: customRef(newItem), quantity: 1 }])
    setNewItem('')
  }

  function addSpell() {
    const spell = learnable.find((s) => s.index === newSpell)
    if (spell) {
      const { index, name, url, level } = spell
      set('spells', [...draft.spells, { index, name, url, level }].sort((a, b) => a.level - b.level))
    }
    setNewSpell('')
  }

  return (
    <form className={ed.form} onSubmit={submit} aria-label={`Edit ${npc.name}`}>
      <h2 className={ed.heading}>Edit {npc.name}</h2>
      <p className={ed.intro}>
        {npc.subrace?.name ?? npc.race.name} {npc.class.name}. Change anything you like, then save.
      </p>

      <EditSection title="Who they are">
        <TextField label="Name" value={draft.name} onChange={(v) => set('name', v)} required />
        <div className="field">
          <label htmlFor="edit-gender">Gender</label>
          <input
            id="edit-gender"
            list="edit-genders"
            value={draft.gender}
            onChange={(e) => set('gender', e.target.value)}
          />
          <datalist id="edit-genders">
            {GENDERS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>
        {draft.role !== 'player' && (
          <div className="field">
            <label htmlFor="edit-role">Role</label>
            <select id="edit-role" value={draft.role} onChange={(e) => set('role', e.target.value as Character['role'])}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        )}
        <NumberField label="Level" value={draft.level} min={1} max={20} onChange={(v) => set('level', v)} />
        <TextField label="Story hook" value={draft.hook} onChange={(v) => set('hook', v)} multiline={2} />
        <TextField label="Appearance" value={draft.appearance} onChange={(v) => set('appearance', v)} multiline={2} />
        <TextField label="Personality" value={draft.personality} onChange={(v) => set('personality', v)} multiline={2} />
        <TextField
          label="Notes"
          value={draft.notes}
          onChange={(v) => set('notes', v)}
          multiline={3}
          placeholder="Anything you want to remember about them"
        />
      </EditSection>

      <EditSection title="Combat">
        <NumberField label="Hit points" value={draft.hitPoints} min={1} onChange={(v) => set('hitPoints', v)} />
        <NumberField label="Armor class" value={draft.armorClass} min={0} onChange={(v) => set('armorClass', v)} />
        <NumberField label="Speed (ft)" value={draft.speed} min={0} onChange={(v) => set('speed', v)} />
        <NumberField
          label="Proficiency bonus"
          value={draft.proficiencyBonus}
          min={0}
          onChange={(v) => set('proficiencyBonus', v)}
        />
      </EditSection>

      <EditSection title="Ability scores">
        {ABILITIES.map((ability) => (
          <NumberField
            key={ability}
            label={ABILITY_LABELS[ability]}
            value={draft.abilityScores[ability]}
            min={1}
            max={30}
            onChange={(v) => set('abilityScores', { ...draft.abilityScores, [ability]: v })}
          />
        ))}
        <div className={`${ed.full} ${ed.chips}`} role="group" aria-label="Saving throw proficiencies">
          {ABILITIES.map((ability) => (
            <CheckField
              key={ability}
              label={`${ability.toUpperCase()} save`}
              checked={draft.savingThrows.includes(ability)}
              onChange={(on) =>
                set(
                  'savingThrows',
                  on
                    ? ABILITIES.filter((a) => a === ability || draft.savingThrows.includes(a))
                    : draft.savingThrows.filter((a) => a !== ability),
                )
              }
            />
          ))}
        </div>
      </EditSection>

      <EditSection title="Skills">
        <ChipList empty="No skill proficiencies.">
          {draft.skills.map((s) => (
            <Chip key={s.index} label={skillName(s.name)} onRemove={() => set('skills', without(draft.skills, s.index))}>
              {skillName(s.name)}
            </Chip>
          ))}
        </ChipList>
        {missingSkills.length > 0 && (
          <div className={`${ed.adder} ${ed.full}`}>
            <div className="field">
              <label htmlFor="edit-add-skill">Add skill</label>
              <select id="edit-add-skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}>
                <option value="">Choose a skill…</option>
                {missingSkills.map((s) => (
                  <option key={s.index} value={s.index}>
                    {skillName(s.name)}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn" onClick={addSkill} disabled={!newSkill}>
              Add
            </button>
          </div>
        )}
      </EditSection>

      <EditSection title="Proficiencies">
        <ChipList empty="No proficiencies.">
          {draft.proficiencies.map((p) => (
            <Chip key={p.index} label={p.name} onRemove={() => set('proficiencies', without(draft.proficiencies, p.index))}>
              {p.name}
            </Chip>
          ))}
        </ChipList>
        <Adder
          id="edit-add-proficiency"
          label="Add proficiency"
          placeholder="e.g. Thieves' Tools"
          value={newProficiency}
          onChange={setNewProficiency}
          onAdd={addProficiency}
        />
      </EditSection>

      <EditSection title="Equipment">
        <ChipList empty="No equipment.">
          {draft.equipment.map((e) => (
            <Chip
              key={e.item.index}
              label={e.item.name}
              onRemove={() => set('equipment', draft.equipment.filter((x) => x.item.index !== e.item.index))}
            >
              <input
                type="number"
                min={1}
                value={e.quantity}
                aria-label={`Quantity of ${e.item.name}`}
                onChange={(ev) =>
                  set(
                    'equipment',
                    draft.equipment.map((x) =>
                      x.item.index === e.item.index ? { ...x, quantity: Math.max(1, ev.target.valueAsNumber || 1) } : x,
                    ),
                  )
                }
              />{' '}
              {e.item.name}
            </Chip>
          ))}
        </ChipList>
        <Adder
          id="edit-add-item"
          label="Add item"
          placeholder="e.g. Lucky coin"
          value={newItem}
          onChange={setNewItem}
          onAdd={addItem}
        />
      </EditSection>

      <EditSection title="Spells">
        <ChipList empty="No spells.">
          {draft.spells.map((s) => (
            <Chip key={s.index} label={s.name} onRemove={() => set('spells', without(draft.spells, s.index))}>
              {s.name} <span className={ed.empty}>{s.level === 0 ? 'cantrip' : `lv ${s.level}`}</span>
            </Chip>
          ))}
        </ChipList>
        {learnable.length > 0 && (
          <div className={`${ed.adder} ${ed.full}`}>
            <div className="field">
              <label htmlFor="edit-add-spell">Add {npc.class.name} spell</label>
              <select id="edit-add-spell" value={newSpell} onChange={(e) => setNewSpell(e.target.value)}>
                <option value="">Choose a spell…</option>
                {[...new Set(learnable.map((s) => s.level))].map((level) => (
                  <optgroup key={level} label={spellLevelLabel(level)}>
                    {learnable
                      .filter((s) => s.level === level)
                      .map((s) => (
                        <option key={s.index} value={s.index}>
                          {s.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <button type="button" className="btn" onClick={addSpell} disabled={!newSpell}>
              Add
            </button>
          </div>
        )}
      </EditSection>

      <EditorActions onCancel={onCancel} error={error} saveLabel={saveLabel} />
    </form>
  )
}

interface AdderProps {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onAdd: () => void
}

/** A text box that adds an entry on "Add" or Enter (without submitting the form). */
function Adder({ id, label, placeholder, value, onChange, onAdd }: AdderProps) {
  return (
    <div className={`${ed.adder} ${ed.full}`}>
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd()
            }
          }}
        />
      </div>
      <button type="button" className="btn" onClick={onAdd} disabled={!value.trim()}>
        Add
      </button>
    </div>
  )
}

