import { useId, useRef, useState, type ChangeEvent } from 'react'
import {
  BackupError,
  backupFileName,
  createBackup,
  parseBackup,
  restoreBackup,
  summarizeBackup,
} from '../../lib/backup.ts'
import { backupSources, SAVE_FAILED_MESSAGE, StorageFullError } from '../../lib/storage/index.ts'
import { describeSummary } from './describe.ts'
import styles from './BackupPanel.module.css'

interface BackupPanelProps {
  /** Called after a backup was loaded, so the page can reload its lists. */
  onImported: () => void
}

type Status = { kind: 'idle' } | { kind: 'busy' } | { kind: 'done' | 'error'; message: string }

/** Download all saved data as one file, or load such a file again. */
export default function BackupPanel({ onImported }: BackupPanelProps) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const fileInput = useRef<HTMLInputElement>(null)
  const titleId = useId()

  async function download() {
    setStatus({ kind: 'busy' })
    try {
      const now = new Date()
      const backup = await createBackup(backupSources, () => now)
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = backupFileName(now)
      link.click()
      URL.revokeObjectURL(url)
      setStatus({ kind: 'done', message: `Backup downloaded: ${describeSummary(summarizeBackup(backup))}.` })
    } catch {
      setStatus({ kind: 'error', message: 'The backup could not be created. Please try again.' })
    }
  }

  async function load(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setStatus({ kind: 'busy' })
    try {
      const backup = parseBackup(await file.text())
      const what = describeSummary(summarizeBackup(backup))
      if (!window.confirm(`This adds ${what}. Items that already exist are replaced.`)) {
        setStatus({ kind: 'idle' })
        return
      }
      await restoreBackup(backup, backupSources)
      onImported()
      setStatus({ kind: 'done', message: `Backup loaded: ${what}.` })
    } catch (error) {
      const message =
        error instanceof BackupError
          ? error.message
          : error instanceof StorageFullError
            ? SAVE_FAILED_MESSAGE
            : 'The backup could not be loaded.'
      setStatus({ kind: 'error', message })
    }
  }

  const busy = status.kind === 'busy'

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Backup
      </h2>
      <p className={styles.hint}>
        Everything you saved lives only in this browser. Download a backup of all NPCs, scenes and player characters
        (with their PDFs) to keep it safe or move it to another device.
      </p>
      <div className={styles.actions}>
        <button type="button" className="btn btn-primary" onClick={() => void download()} disabled={busy}>
          Download backup
        </button>
        <button type="button" className="btn" onClick={() => fileInput.current?.click()} disabled={busy}>
          Load backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className={styles.file}
          onChange={(e) => void load(e)}
          aria-label="Backup file"
        />
      </div>
      <p
        className={`${styles.status} ${status.kind === 'error' ? 'notice-error' : styles.muted}`}
        role="status"
        aria-live="polite"
      >
        {status.kind === 'busy' ? 'Working…' : status.kind === 'idle' ? '' : status.message}
      </p>
    </section>
  )
}
