import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'
import { formatBytes } from '../features/player/format.ts'
import { playerSheetFiles, playerSheets } from '../lib/storage/index.ts'
import styles from './PlayerSheetView.module.css'

type FileState = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; url: string }

const BACK = '/characters?tab=players'

// Most phones have no built-in PDF viewer for embedded files; they get buttons instead.
const canShowPdf = typeof navigator === 'undefined' || navigator.pdfViewerEnabled !== false

export default function PlayerSheetView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [sheet] = useState(() => playerSheets.get(id))
  const [file, setFile] = useState<FileState>({ status: 'loading' })

  useEffect(() => {
    let url: string | undefined
    let cancelled = false
    playerSheetFiles
      .get(id)
      .then((blob) => {
        if (cancelled) return
        if (!blob) return setFile({ status: 'missing' })
        url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
        setFile({ status: 'ready', url })
      })
      .catch(() => !cancelled && setFile({ status: 'missing' }))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [id])

  if (!sheet) {
    return (
      <>
        <PageHeader title="Character not found" icon="characters">
          This page of the book is blank.
        </PageHeader>
        <p className={styles.center}>
          <Link to={BACK} className="btn">
            Back to My Characters
          </Link>
        </p>
      </>
    )
  }

  function remove() {
    if (!sheet || !window.confirm(`Delete ${sheet.name} and the uploaded sheet? This cannot be undone.`)) return
    playerSheets.remove(sheet.id)
    void playerSheetFiles.remove(sheet.id)
    void navigate(BACK)
  }

  const meta = [sheet.race, sheet.classLevel].filter(Boolean).join(' · ')

  return (
    <>
      <div className={styles.toolbar}>
        <Link to={BACK} className="btn">
          ← My Characters
        </Link>
        <div className={styles.actions}>
          {file.status === 'ready' && (
            <>
              <a href={file.url} target="_blank" rel="noreferrer" className="btn">
                Open in new tab
              </a>
              <a href={file.url} download={sheet.fileName} className="btn">
                Download
              </a>
            </>
          )}
          <button type="button" className="btn" onClick={remove}>
            Delete
          </button>
        </div>
      </div>

      <header className={styles.heading}>
        <span className={styles.badge}>Player character</span>
        <h1 className={styles.name}>{sheet.name}</h1>
        {meta && <p className={styles.meta}>{meta}</p>}
        <p className={styles.file}>
          {sheet.fileName} · {formatBytes(sheet.fileSize)}
        </p>
      </header>

      {file.status === 'loading' && <p className={styles.center}>Unrolling the parchment…</p>}
      {file.status === 'missing' && (
        <p className={styles.center}>
          The PDF for this character is no longer stored in this browser. Delete the entry and upload the sheet again.
        </p>
      )}
      {file.status === 'ready' && !canShowPdf && (
        <p className={styles.center}>
          Your browser cannot show PDFs inside the page. Use <strong>Open in new tab</strong> or{' '}
          <strong>Download</strong> above to read the sheet.
        </p>
      )}
      {file.status === 'ready' && canShowPdf && (
        <object data={file.url} type="application/pdf" className={styles.pdf} aria-label={`Character sheet of ${sheet.name}`}>
          <p className={styles.fallback}>
            Your browser cannot show the PDF here.{' '}
            <a href={file.url} target="_blank" rel="noreferrer">
              Open the sheet in a new tab
            </a>{' '}
            instead.
          </p>
        </object>
      )}
    </>
  )
}
