import { describe, expect, it, vi } from 'vitest'
import type { PlayerSheet } from '../../types/models.ts'
import { emptySheet } from './editPlayer.ts'
import { loadSheetFile, type SheetFileDeps } from './loadSheetFile.ts'

const now = new Date('2026-10-16T12:00:00.000Z')
const pdf = new Blob(['%PDF-1.7'], { type: 'application/pdf' })

const player = (sheet?: PlayerSheet['sheet']): PlayerSheet => ({
  id: 'p1',
  name: 'Mira',
  race: 'Wood Elf',
  classLevel: 'Ranger 3',
  fileName: 'mira.pdf',
  fileSize: 8,
  sheet,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
})

function deps(options: { file?: Blob; stored?: PlayerSheet; found?: boolean; saveFails?: boolean; getFails?: boolean }) {
  const saved: PlayerSheet[] = []
  const read = vi.fn(async () => ({ sheet: options.found ? emptySheet() : undefined }))
  const d: SheetFileDeps = {
    files: { get: async () => (options.getFails ? Promise.reject(new Error('blocked')) : options.file) },
    sheets: {
      get: () => options.stored,
      save: (item) => {
        if (options.saveFails) throw new Error('full')
        saved.push(item)
      },
    },
    read,
    now: () => now,
  }
  return { d, saved, read }
}

describe('loadSheetFile', () => {
  it('returns the file of an already read sheet without reading it again', async () => {
    const { d, read, saved } = deps({ file: pdf, stored: player(emptySheet()) })
    expect(await loadSheetFile('p1', d)).toEqual({ file: pdf })
    expect(read).not.toHaveBeenCalled()
    expect(saved).toHaveLength(0)
  })

  it('has no file when none is stored', async () => {
    const { d } = deps({ stored: player() })
    expect(await loadSheetFile('p1', d)).toEqual({})
  })

  it('counts a failing file store as missing', async () => {
    const { d } = deps({ getFails: true, stored: player() })
    expect(await loadSheetFile('p1', d)).toEqual({})
  })

  it('reads and saves the sheet of an old upload once', async () => {
    const { d, read, saved } = deps({ file: pdf, stored: player(), found: true })
    const result = await loadSheetFile('p1', d)
    expect(read).toHaveBeenCalledWith(expect.any(ArrayBuffer), 'mira.pdf')
    expect(result.file).toBe(pdf)
    expect(result.upgraded?.sheet).toEqual(emptySheet())
    expect(result.upgraded?.updatedAt).toBe(now.toISOString())
    expect(saved).toEqual([result.upgraded])
  })

  it('leaves a PDF without form fields as it is', async () => {
    const { d, saved } = deps({ file: pdf, stored: player(), found: false })
    expect(await loadSheetFile('p1', d)).toEqual({ file: pdf })
    expect(saved).toHaveLength(0)
  })

  it('still returns the read sheet when saving fails', async () => {
    const { d } = deps({ file: pdf, stored: player(), found: true, saveFails: true })
    const result = await loadSheetFile('p1', d)
    expect(result.upgraded?.sheet).toEqual(emptySheet())
  })
})
