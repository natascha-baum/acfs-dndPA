import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'
import DetailDialog from '../features/detail/DetailDialog.tsx'
import type { LookupRef } from '../features/detail/resolveDetail.ts'
import PlayerEditor from '../features/player/PlayerEditor.tsx'
import PlayerSheetCard from '../features/player/PlayerSheetCard.tsx'
import { formatBytes } from '../features/player/format.ts'
import { matchSpells } from '../features/player/matchSpells.ts'
import { readSheet } from '../features/player/readSheet.ts'
import { api } from '../lib/api/index.ts'
import { playerSheetFiles, playerSheets, SAVE_FAILED_MESSAGE } from '../lib/storage/index.ts'
import { useAsync } from '../lib/useAsync.ts'
import type { PlayerSheet } from '../types/models.ts'
import styles from './PlayerSheetView.module.css'

type FileState = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; url: string }

const BACK = '/characters?tab=players'

// Most phones have no built-in PDF viewer for embedded files; they get buttons instead.
const canShowPdf = typeof navigator === 'undefined' || navigator.pdfViewerEnabled !== false

const loadSpells = (spells: string[]) => matchSpells(spells, api)
const NO_SPELLS: string[] = []

export default function PlayerSheetView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(() => playerSheets.get(id))
  const [file, setFile] = useState<FileState>({ status: 'loading' })
  const [showPdf, setShowPdf] = useState(false)
  const [lookup, setLookup] = useState<LookupRef | null>(null)
  const [editing, setEditing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const spells = useAsync(player?.sheet?.spells ?? NO_SPELLS, loadSpells)

  useEffect(() => {
    let url: string | undefined
    let cancelled = false
    playerSheetFiles
      .get(id)
      .then(async (blob) => {
        if (cancelled) return
        if (!blob) return setFile({ status: 'missing' })
        url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
        setFile({ status: 'ready', url })
        // Sheets uploaded before the app could read them get read now, once.
        const stored = playerSheets.get(id)
        if (stored && !stored.sheet) {
          const { sheet } = await readSheet(await blob.arrayBuffer(), stored.fileName)
          if (sheet && !cancelled) {
            const updated: PlayerSheet = { ...stored, sheet, updatedAt: new Date().toISOString() }
            try {
              playerSheets.save(updated)
            } catch {
              // Still shown for this visit; it is read again next time.
            }
            setPlayer(updated)
          }
        }
      })
      .catch(() => !cancelled && setFile({ status: 'missing' }))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [id])

  if (!player) {
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
    if (!player || !window.confirm(`Delete ${player.name} and the uploaded sheet? This cannot be undone.`)) return
    playerSheets.remove(player.id)
    void playerSheetFiles.remove(player.id)
    void navigate(BACK)
  }

  function saveEdit(edited: PlayerSheet) {
    try {
      playerSheets.save(edited)
    } catch {
      setSaveError(SAVE_FAILED_MESSAGE)
      return
    }
    setSaveError(null)
    setPlayer(edited)
    setEditing(false)
  }

  if (editing) {
    return (
      <PlayerEditor
        player={player}
        error={saveError}
        onSave={saveEdit}
        onCancel={() => {
          setSaveError(null)
          setEditing(false)
        }}
      />
    )
  }

  const meta = [player.race, player.classLevel].filter(Boolean).join(' · ')
  const sheet = player.sheet

  const pdf =
    file.status === 'ready' &&
    (canShowPdf ? (
      <object
        data={file.url}
        type="application/pdf"
        className={styles.pdf}
        aria-label={`Character sheet of ${player.name}`}
      >
        <p className={styles.fallback}>
          Your browser cannot show the PDF here.{' '}
          <a href={file.url} target="_blank" rel="noreferrer">
            Open the sheet in a new tab
          </a>{' '}
          instead.
        </p>
      </object>
    ) : (
      <p className={styles.center}>
        Your browser cannot show PDFs inside the page. Use <strong>Open in new tab</strong> or{' '}
        <strong>Download</strong> to read the sheet.
      </p>
    ))

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
                Open PDF
              </a>
              <a href={file.url} download={player.fileName} className="btn">
                Download
              </a>
            </>
          )}
          <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
            ✎ Edit
          </button>
          <button type="button" className="btn" onClick={remove}>
            Delete
          </button>
        </div>
      </div>

      {sheet ? (
        <>
          <p className={styles.hint}>Tip: click a skill or spell to read its full description.</p>
          <PlayerSheetCard
            player={{ ...player, sheet }}
            spells={spells.status === 'ready' ? spells.data : undefined}
            onLookup={setLookup}
          />
          <section className={styles.original}>
            <p className={styles.file}>
              Imported from {player.fileName} · {formatBytes(player.fileSize)}
            </p>
            {file.status === 'ready' && canShowPdf && (
              <button type="button" className="btn" onClick={() => setShowPdf((v) => !v)} aria-expanded={showPdf}>
                {showPdf ? 'Hide original PDF' : 'Show original PDF'}
              </button>
            )}
            {showPdf && pdf}
          </section>
        </>
      ) : (
        <>
          <header className={styles.heading}>
            <span className={styles.badge}>Player character</span>
            <h1 className={styles.name}>{player.name}</h1>
            {meta && <p className={styles.meta}>{meta}</p>}
            <p className={styles.file}>
              {player.fileName} · {formatBytes(player.fileSize)}
            </p>
          </header>
          {file.status === 'loading' && <p className={styles.center}>Unrolling the parchment…</p>}
          {file.status === 'missing' && (
            <p className={styles.center}>
              The PDF for this character is no longer stored in this browser. Delete the entry and upload the sheet
              again.
            </p>
          )}
          {file.status === 'ready' && (
            <p className={styles.note}>
              This PDF has no filled-in form fields, so it is shown as it is. Fillable sheets (like the official 5e
              sheet or a D&amp;D Beyond export) are shown in the app’s own layout.
            </p>
          )}
          {pdf}
        </>
      )}

      {lookup && <DetailDialog key={`${lookup.kind}-${lookup.index}`} lookup={lookup} onClose={() => setLookup(null)} />}
    </>
  )
}
