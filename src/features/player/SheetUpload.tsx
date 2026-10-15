import { useId, useState, type DragEvent, type FormEvent } from 'react'
import { newId, playerSheetFiles, playerSheets } from '../../lib/storage/index.ts'
import type { PlayerSheet } from '../../types/models.ts'
import { formatBytes } from './format.ts'
import { MAX_SHEET_BYTES, isPdf, readSheet, type SheetDetails } from './readSheet.ts'
import styles from './SheetUpload.module.css'

interface Draft extends SheetDetails {
  file: File
}

interface SheetUploadProps {
  onSaved: (sheet: PlayerSheet) => void
}

export default function SheetUpload({ onSaved }: SheetUploadProps) {
  const inputId = useId()
  const [draft, setDraft] = useState<Draft>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [dragging, setDragging] = useState(false)

  async function choose(file: File | undefined) {
    if (!file) return
    setError(undefined)
    if (file.size > MAX_SHEET_BYTES) {
      setError(`That file is ${formatBytes(file.size)}. Please pick a PDF under ${formatBytes(MAX_SHEET_BYTES)}.`)
      return
    }
    setBusy(true)
    try {
      const bytes = await file.arrayBuffer()
      if (!isPdf(bytes)) {
        setError('That file is not a PDF. Please pick your character sheet as a PDF.')
        return
      }
      setDraft({ file, ...(await readSheet(bytes, file.name)) })
    } finally {
      setBusy(false)
    }
  }

  function drop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    void choose(event.dataTransfer.files[0])
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!draft) return
    setBusy(true)
    setError(undefined)
    const now = new Date().toISOString()
    const sheet: PlayerSheet = {
      id: newId(),
      name: draft.name.trim() || 'My character',
      race: draft.race.trim(),
      classLevel: draft.classLevel.trim(),
      fileName: draft.file.name,
      fileSize: draft.file.size,
      createdAt: now,
      updatedAt: now,
    }
    try {
      await playerSheetFiles.put(sheet.id, draft.file)
      playerSheets.save(sheet)
      setDraft(undefined)
      onSaved(sheet)
    } catch {
      setError('The sheet could not be saved. Your browser may be out of storage space or blocking it.')
    } finally {
      setBusy(false)
    }
  }

  const edit = (field: keyof SheetDetails) => (event: { target: { value: string } }) =>
    setDraft((d) => d && { ...d, [field]: event.target.value })

  if (draft) {
    return (
      <form className={styles.panel} onSubmit={save}>
        <h3 className={styles.title}>Check the details</h3>
        <p className={styles.file}>
          {draft.file.name} · {formatBytes(draft.file.size)}
        </p>
        <div className={styles.fields}>
          <div className="field">
            <label htmlFor={`${inputId}-name`}>Name</label>
            <input id={`${inputId}-name`} value={draft.name} onChange={edit('name')} required />
          </div>
          <div className="field">
            <label htmlFor={`${inputId}-race`}>Race</label>
            <input id={`${inputId}-race`} value={draft.race} onChange={edit('race')} placeholder="e.g. Half-Elf" />
          </div>
          <div className="field">
            <label htmlFor={`${inputId}-class`}>Class &amp; level</label>
            <input
              id={`${inputId}-class`}
              value={draft.classLevel}
              onChange={edit('classLevel')}
              placeholder="e.g. Bard 3"
            />
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button type="button" className="btn" onClick={() => setDraft(undefined)} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Save to My Characters
          </button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <input
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        className={styles.input}
        disabled={busy}
        onChange={(e) => {
          void choose(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <label
        htmlFor={inputId}
        className={`${styles.drop} ${dragging ? styles.dragging : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
      >
        <span className={styles.scroll} aria-hidden="true">
          📜
        </span>
        <span className={styles.dropTitle}>{busy ? 'Reading your sheet…' : 'Upload a character sheet'}</span>
        <span className={styles.dropHint}>Drop a PDF here or click to choose one. Fillable sheets fill in the details for you.</span>
      </label>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
