import { describe, expect, it, vi } from 'vitest'
import type { PlayerSheet } from '../../types/models.ts'
import { emptySheet } from './editPlayer.ts'
import { loadSheetFile, upgradeOldSheet, type SheetFileDeps } from './loadSheetFile.ts'

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
  it('returns the stored file', async () => {
    const { d } = deps({ file: pdf })
    expect(await loadSheetFile('p1', d)).toBe(pdf)
  })

  it('has no file when none is stored', async () => {
    const { d } = deps({})
    expect(await loadSheetFile('p1', d)).toBeUndefined()
  })

  it('counts a failing file store as missing', async () => {
    const { d } = deps({ getFails: true })
    expect(await loadSheetFile('p1', d)).toBeUndefined()
  })
})

describe('upgradeOldSheet', () => {
  it('does nothing for a sheet that was already read', async () => {
    const { d, read, saved } = deps({ stored: player(emptySheet()), found: true })
    expect(await upgradeOldSheet('p1', pdf, d)).toBeUndefined()
    expect(read).not.toHaveBeenCalled()
    expect(saved).toHaveLength(0)
  })

  it('reads and saves the sheet of an old upload', async () => {
    const { d, read, saved } = deps({ stored: player(), found: true })
    const upgraded = await upgradeOldSheet('p1', pdf, d)
    expect(read).toHaveBeenCalledWith(expect.any(ArrayBuffer), 'mira.pdf')
    expect(upgraded?.sheet).toEqual(emptySheet())
    expect(upgraded?.updatedAt).toBe(now.toISOString())
    expect(saved).toEqual([upgraded])
  })

  it('leaves a PDF without form fields as it is', async () => {
    const { d, saved } = deps({ stored: player(), found: false })
    expect(await upgradeOldSheet('p1', pdf, d)).toBeUndefined()
    expect(saved).toHaveLength(0)
  })

  it('still returns the read sheet when saving fails', async () => {
    const { d } = deps({ stored: player(), found: true, saveFails: true })
    expect((await upgradeOldSheet('p1', pdf, d))?.sheet).toEqual(emptySheet())
  })
})
