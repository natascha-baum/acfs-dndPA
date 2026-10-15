import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { detailsFromFields, isPdf, nameFromFileName, readSheet } from './readSheet.ts'

async function fillableSheet(fields: Record<string, string>): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create()
  const page = doc.addPage()
  const form = doc.getForm()
  Object.entries(fields).forEach(([name, value], i) => {
    const field = form.createTextField(name)
    field.setText(value)
    field.addToPage(page, { x: 20, y: 700 - i * 40, width: 200, height: 24 })
  })
  const bytes = await doc.save()
  return bytes.slice().buffer
}

describe('readSheet', () => {
  it('reads name, race and class from the official sheet field names', async () => {
    // The official 5e sheet really names its race field "Race " (with a space).
    const pdf = await fillableSheet({ CharacterName: 'Mira Thornwood', 'Race ': 'Wood Elf', ClassLevel: 'Ranger 3' })
    expect(isPdf(pdf)).toBe(true)
    expect(await readSheet(pdf, 'mira.pdf')).toEqual({ name: 'Mira Thornwood', race: 'Wood Elf', classLevel: 'Ranger 3' })
  })

  it('falls back to the file name when the PDF has no form', async () => {
    const doc = await PDFDocument.create()
    doc.addPage()
    const pdf = (await doc.save()).slice().buffer
    expect(await readSheet(pdf, 'thorin_sheet.pdf')).toEqual({ name: 'Thorin sheet', race: '', classLevel: '' })
  })

  it('falls back when the bytes are not a readable PDF', async () => {
    const junk = new TextEncoder().encode('%PDF-1.7 but broken').buffer
    expect((await readSheet(junk, 'broken.pdf')).name).toBe('Broken')
  })
})

describe('detailsFromFields', () => {
  it('matches D&D Beyond style names and skips empty fields', () => {
    const fields = new Map([
      ['CharacterName', ''],
      ['CharacterName 2', 'ignored'],
      ['CLASS  LEVEL', 'Wizard 5'],
      ['RACE', 'Gnome'],
      ['Name', 'Pip'],
    ])
    expect(detailsFromFields(fields)).toEqual({ name: 'Pip', race: 'Gnome', classLevel: 'Wizard 5' })
  })
})

describe('isPdf', () => {
  it('rejects other files', () => {
    expect(isPdf(new TextEncoder().encode('hello').buffer)).toBe(false)
  })
})

describe('nameFromFileName', () => {
  it('turns a file name into a readable name', () => {
    expect(nameFromFileName('grog-the-barbarian.PDF')).toBe('Grog the barbarian')
    expect(nameFromFileName('.pdf')).toBe('My character')
  })
})
