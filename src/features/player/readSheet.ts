// Reads what we can from an uploaded character sheet PDF. Fillable sheets (the
// official 5e sheet, D&D Beyond exports and most community sheets) keep their
// values in form fields, which we use to prefill name, race and class.

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

const normalize = (fieldName: string) => fieldName.toLowerCase().replace(/[^a-z0-9]/g, '')

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

/** Text values of all form fields in the PDF; empty when it has no form or cannot be read. */
export async function readFormFields(bytes: ArrayBuffer): Promise<Map<string, string>> {
  const values = new Map<string, string>()
  try {
    // Loaded on demand so the PDF library is only downloaded when someone uploads a sheet.
    const { PDFDocument, PDFTextField, PDFDropdown } = await import('pdf-lib')
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
    for (const field of doc.getForm().getFields()) {
      let value: string | undefined
      if (field instanceof PDFTextField) value = field.getText()
      else if (field instanceof PDFDropdown) value = field.getSelected()[0]
      if (value) values.set(field.getName(), value)
    }
  } catch {
    // Not fillable, damaged or unsupported: the user fills in the details instead.
  }
  return values
}

export async function readSheet(bytes: ArrayBuffer, fileName: string): Promise<SheetDetails> {
  const found = detailsFromFields(await readFormFields(bytes))
  return {
    name: found.name ?? nameFromFileName(fileName),
    race: found.race ?? '',
    classLevel: found.classLevel ?? '',
  }
}
