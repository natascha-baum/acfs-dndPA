// Reads what we can from an uploaded character sheet PDF. Fillable sheets (the
// official 5e sheet, D&D Beyond exports and most community sheets) keep their
// values in form fields, which we use to prefill name, race and class.

import type { ImportedSheet } from '../../types/models.ts'
import { normalize, parseSheet, type FormFields } from './parseSheet.ts'

export interface SheetDetails {
  name: string
  race: string
  classLevel: string
}

export const MAX_SHEET_BYTES = 25 * 1024 * 1024

// Form field names seen on common sheets, compared after `normalize`.
const FIELDS: Record<keyof SheetDetails, string[]> = {
  name: ['charactername', 'name'],
  race: ['race', 'species', 'racespecies'],
  classLevel: ['classlevel', 'class'],
}

export function isPdf(bytes: ArrayBuffer): boolean {
  const head = new TextDecoder().decode(bytes.slice(0, 1024))
  return head.includes('%PDF-')
}

/** "thorin_oakenshield-sheet.pdf" → "Thorin oakenshield sheet" */
export function nameFromFileName(fileName: string): string {
  const base = fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  return base ? base[0].toUpperCase() + base.slice(1) : 'My character'
}

/** Picks the first non-empty value for each detail from a field name → value map. */
export function detailsFromFields(fields: Map<string, string>): Partial<SheetDetails> {
  const byName = new Map<string, string>()
  for (const [fieldName, value] of fields) {
    const key = normalize(fieldName)
    if (value.trim() && !byName.has(key)) byName.set(key, value.trim())
  }
  const details: Partial<SheetDetails> = {}
  for (const [detail, candidates] of Object.entries(FIELDS) as [keyof SheetDetails, string[]][]) {
    const found = candidates.map((c) => byName.get(c)).find(Boolean)
    if (found) details[detail] = found
  }
  return details
}

/** All filled form fields in the PDF; empty when it has no form or cannot be read. */
export async function readFormFields(bytes: ArrayBuffer): Promise<FormFields> {
  const fields: FormFields = { text: new Map(), checked: new Set() }
  try {
    // Loaded on demand so the PDF library is only downloaded when someone uploads a sheet.
    const { PDFDocument, PDFTextField, PDFDropdown, PDFCheckBox } = await import('pdf-lib')
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
    for (const field of doc.getForm().getFields()) {
      let value: string | undefined
      if (field instanceof PDFTextField) value = field.getText()
      else if (field instanceof PDFDropdown) value = field.getSelected()[0]
      else if (field instanceof PDFCheckBox && field.isChecked()) fields.checked.add(field.getName())
      if (value) fields.text.set(field.getName(), value)
    }
  } catch {
    // Not fillable, damaged or unsupported: the user fills in the details instead.
  }
  return fields
}

export interface ReadResult extends SheetDetails {
  /** The full sheet, when the PDF is a filled-in fillable sheet. */
  sheet?: ImportedSheet
}

export async function readSheet(bytes: ArrayBuffer, fileName: string): Promise<ReadResult> {
  const fields = await readFormFields(bytes)
  const found = detailsFromFields(fields.text)
  return {
    name: found.name ?? nameFromFileName(fileName),
    race: found.race ?? '',
    classLevel: found.classLevel ?? '',
    sheet: parseSheet(fields),
  }
}
