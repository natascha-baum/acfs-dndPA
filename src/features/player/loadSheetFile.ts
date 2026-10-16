import type { Collection, FileStore } from '../../lib/storage/index.ts'
import type { ImportedSheet, PlayerSheet } from '../../types/models.ts'

export interface SheetFileDeps {
  /** Where the PDFs are stored; `playerSheetFiles` in the app. */
  files: Pick<FileStore, 'get'>
  /** The saved player characters; `playerSheets` in the app. */
  sheets: Pick<Collection<PlayerSheet>, 'get' | 'save'>
  /** Reads a PDF's form fields; `readSheet` in the app. */
  read: (bytes: ArrayBuffer, fileName: string) => Promise<{ sheet?: ImportedSheet }>
  now: () => Date
}

/** The stored PDF of a player character, or undefined when it is missing or cannot be read. */
export async function loadSheetFile(id: string, deps: SheetFileDeps): Promise<Blob | undefined> {
  try {
    return await deps.files.get(id)
  } catch {
    return undefined
  }
}

/**
 * Players saved before the app could read PDFs have no `sheet`. Reads it from
 * the PDF once and saves it; returns the updated player, or undefined when
 * there is nothing to do or the PDF has no form fields.
 */
export async function upgradeOldSheet(id: string, file: Blob, deps: SheetFileDeps): Promise<PlayerSheet | undefined> {
  const stored = deps.sheets.get(id)
  if (!stored || stored.sheet) return undefined

  const { sheet } = await deps.read(await file.arrayBuffer(), stored.fileName)
  if (!sheet) return undefined
  const upgraded: PlayerSheet = { ...stored, sheet, updatedAt: deps.now().toISOString() }
  try {
    deps.sheets.save(upgraded)
  } catch {
    // Still shown for this visit; it is read again next time.
  }
  return upgraded
}
