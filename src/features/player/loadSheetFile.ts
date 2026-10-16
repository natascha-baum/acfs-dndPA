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

export interface SheetFile {
  /** The stored PDF, or undefined when it is missing or cannot be read. */
  file?: Blob
  /** Set when the player was saved before the app could read PDFs and the sheet was read now. */
  upgraded?: PlayerSheet
}

/** Loads the PDF of a player character and reads its contents once if that was never done. */
export async function loadSheetFile(id: string, deps: SheetFileDeps): Promise<SheetFile> {
  let file: Blob | undefined
  try {
    file = await deps.files.get(id)
  } catch {
    return {}
  }
  if (!file) return {}

  const stored = deps.sheets.get(id)
  if (!stored || stored.sheet) return { file }

  const { sheet } = await deps.read(await file.arrayBuffer(), stored.fileName)
  if (!sheet) return { file }
  const upgraded: PlayerSheet = { ...stored, sheet, updatedAt: deps.now().toISOString() }
  try {
    deps.sheets.save(upgraded)
  } catch {
    // Still shown for this visit; it is read again next time.
  }
  return { file, upgraded }
}
