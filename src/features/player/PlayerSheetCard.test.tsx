import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PlayerSheet } from '../../types/models.ts'
import { OFFICIAL_SHEET_CHECKED, OFFICIAL_SHEET_TEXT } from './__fixtures__/officialSheet.ts'
import { emptySheet } from './editPlayer.ts'
import type { SpellGroups } from './matchSpells.ts'
import { parseSheet } from './parseSheet.ts'
import PlayerSheetCard from './PlayerSheetCard.tsx'

type SheetPlayer = PlayerSheet & { sheet: NonNullable<PlayerSheet['sheet']> }

const sheet = parseSheet({
  text: new Map(Object.entries(OFFICIAL_SHEET_TEXT)),
  checked: new Set(OFFICIAL_SHEET_CHECKED),
})!

const player = (s = sheet): SheetPlayer => ({
  id: 'p1',
  name: 'Mira Thornwood',
  race: 'Wood Elf',
  classLevel: 'Ranger 3',
  fileName: 'mira.pdf',
  fileSize: 1000,
  sheet: s,
  createdAt: '2026-10-16T00:00:00Z',
  updatedAt: '2026-10-16T00:00:00Z',
})

const spells: SpellGroups = {
  byLevel: [{ level: 1, spells: [{ index: 'cure-wounds', name: 'Cure Wounds', level: 1, url: '/api/spells/cure-wounds' }] }],
  other: ['Homebrew Volley'],
}

// Static HTML in the Node test environment: enough to check what the card shows.
const render = (props: Partial<Parameters<typeof PlayerSheetCard>[0]> = {}) =>
  renderToStaticMarkup(<PlayerSheetCard player={player()} {...props} />)

/** The text of the HTML without tags, so assertions do not depend on markup or CSS classes. */
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('PlayerSheetCard', () => {
  it('shows the header', () => {
    const t = text(render())
    expect(t).toContain('Mira Thornwood')
    expect(t).toContain('Wood Elf · Ranger 3')
    expect(t).toContain('Outlander · Neutral Good · 900 XP')
  })

  it('shows vitals, ability scores and saving throws', () => {
    const t = text(render())
    expect(t).toContain('Hit Points 28')
    expect(t).toContain('Armor Class 15')
    expect(t).toContain('Hit Dice 3d10')
    expect(t).toContain('STR +1 12')
    expect(t).toContain('CHA -1 8')
    expect(t).toContain('◆ Save +3')
    expect(t).toContain('◆ Save +5')
    expect(t.match(/◆ Save/g)).toHaveLength(2)
  })

  it('shows skills, attacks, proficiencies and equipment', () => {
    const t = text(render())
    expect(t).toContain('Perception +4')
    expect(t).toContain('Animal Handling +2')
    expect(t).toContain('Longbow +7 1d8+3 piercing')
    expect(t).toContain('Proficiencies &amp; Languages')
    expect(t).toContain('Explorer’s pack')
    expect(t).toContain('12 GP')
  })

  it('shows spellcasting, features, personality, appearance and backstory', () => {
    const t = text(render())
    expect(t).toContain('Ranger · Ability WIS · Save DC 12 · Attack +4')
    expect(t).toContain('Hunter’s Mark, Cure Wounds, Speak with Animals')
    expect(t).toContain('Fighting Style: Archery')
    expect(t).toContain('Flaws I am slow to trust members of other races.')
    expect(t).toContain('Eyes Green')
    expect(t).toContain('burning of her grove')
  })

  it('groups matched spells by level and lists the rest as other spells', () => {
    const t = text(render({ spells }))
    expect(t).toContain('1st level Cure Wounds')
    expect(t).toContain('Other spells Homebrew Volley')
  })

  it('makes skills and spells buttons only when lookups are possible', () => {
    expect(render({ spells })).not.toContain('<button')
    const html = render({ spells, onLookup: () => {} })
    expect(html).toContain('>Perception</button>')
    expect(html).toContain('>Cure Wounds</button>')
  })

  it('renders no empty sections for a sheet without content', () => {
    const html = render({ player: player(emptySheet()) })
    expect(html).not.toContain('<h3')
    expect(html).not.toContain('<dl')
    expect(text(html)).toContain('STR — —')
  })
})
