import { useId, type ReactNode } from 'react'
import styles from './editor.module.css'

// Small building blocks shared by every edit form (NPCs, scenes, player sheets).

export function EditSection({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <fieldset className={`${styles.section} ${wide ? styles.wide : ''}`}>
      <legend>{title}</legend>
      <div className={styles.grid}>{children}</div>
    </fieldset>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /** Renders a textarea; the number is its row count. */
  multiline?: number
  /** Spans the whole row of the section grid. */
  full?: boolean
  required?: boolean
  placeholder?: string
}

export function TextField({ label, value, onChange, multiline, full, required, placeholder }: TextFieldProps) {
  const id = useId()
  return (
    <div className={`field ${full || multiline ? styles.full : ''}`}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={multiline}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  const id = useId()
  return (
    <div className={`field ${styles.number}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={Number.isNaN(value) ? '' : value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
    </div>
  )
}

export function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

/** A removable entry in an edited list, e.g. a spell or an item. */
export function Chip({ children, onRemove, label }: { children: ReactNode; onRemove: () => void; label: string }) {
  return (
    <li className={styles.chip}>
      <span>{children}</span>
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} title="Remove">
        ✕
      </button>
    </li>
  )
}

export function ChipList({ children, empty }: { children: ReactNode[]; empty: string }) {
  return children.length ? (
    <ul className={`${styles.chips} ${styles.full}`}>{children}</ul>
  ) : (
    <p className={`${styles.empty} ${styles.full}`}>{empty}</p>
  )
}

interface EditorActionsProps {
  onCancel: () => void
  error?: string | null
  saveLabel?: string
}

export function EditorActions({ onCancel, error, saveLabel = 'Save changes' }: EditorActionsProps) {
  return (
    <div className={styles.actionsWrap}>
      {error && (
        <p className="notice-error" role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {saveLabel}
        </button>
      </div>
    </div>
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
export function Adder({ id, label, placeholder, value, onChange, onAdd }: AdderProps) {
  return (
    <div className={`${styles.adder} ${styles.full}`}>
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

