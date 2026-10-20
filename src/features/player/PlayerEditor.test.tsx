import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PlayerSheet } from '../../types/models.ts'
import { OFFICIAL_SHEET_CHECKED, OFFICIAL_SHEET_TEXT } from './__fixtures__/officialSheet.ts'
import { parseSheet } from './parseSheet.ts'
import PlayerEditor from './PlayerEditor.tsx'

const sheet = parseSheet({
  text: new Map(Object.entries(OFFICIAL_SHEET_TEXT)),
  checked: new Set(OFFICIAL_SHEET_CHECKED),
})!

const player: PlayerSheet = {
  id: 'p1',
  name: 'Mira Thornwood',
  race: 'Wood Elf',
  classLevel: 'Ranger 3',
  fileName: 'mira.pdf',
  fileSize: 1000,
  sheet,
  createdAt: '2026-10-16T00:00:00Z',
  updatedAt: '2026-10-16T00:00:00Z',
}

const noop = () => {}
const render = (p: PlayerSheet) => renderToStaticMarkup(<PlayerEditor player={p} onSave={noop} onCancel={noop} />)

describe('PlayerEditor', () => {
  it('fills in the character and every section of the sheet', () => {
    const html = render(player)
    expect(html).toContain('value="Mira Thornwood"')
    expect(html).toContain('value="Wood Elf"')
    expect(html).toContain('value="Outlander"')
    expect(html).toContain('value="28"')
    expect(html).toContain('value="Longbow"')
    expect(html).toContain('value="1d8+3 piercing"')
    expect(html).toContain('Cure Wounds')
    expect(html).toContain('slow to trust')
    expect(html).toContain('value="Auburn"')
    expect(html).toContain('+ Add attack')
    expect(html).not.toContain('Fill in the full sheet')
  })

  it('offers to fill in the sheet by hand when there is none', () => {
    const html = render({ ...player, sheet: undefined })
    expect(html).toContain('Fill in the full sheet')
    expect(html).not.toContain('Ability scores')
  })
})
