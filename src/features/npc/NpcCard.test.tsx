import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Character } from '../../types/models.ts'
import NpcCard from './NpcCard.tsx'

const ref = (index: string, name: string) => ({ index, name, url: `/api/2014/x/${index}` })

const npc: Character = {
  id: 'a',
  name: 'Orla',
  role: 'enemy',
  gender: 'Female',
  race: ref('human', 'Human'),
  class: ref('wizard', 'Wizard'),
  level: 3,
  abilityScores: { str: 8, dex: 14, con: 13, int: 16, wis: 12, cha: 10 },
  hitPoints: 17,
  armorClass: 12,
  speed: 30,
  proficiencyBonus: 2,
  savingThrows: ['int', 'wis'],
  skills: [ref('skill-arcana', 'Skill: Arcana')],
  proficiencies: [ref('daggers', 'Daggers')],
  spells: [{ ...ref('magic-missile', 'Magic Missile'), level: 1 }],
  equipment: [{ item: ref('dagger', 'Dagger'), quantity: 2 }],
  appearance: 'Tall',
  personality: 'Grim',
  hook: 'Hunts the party',
  notes: '',
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-15T00:00:00.000Z',
}

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('NpcCard', () => {
  it('shows who the character is and their vitals', () => {
    const t = text(renderToStaticMarkup(<NpcCard npc={npc} />))
    expect(t).toContain('Enemy')
    expect(t).toContain('Orla')
    expect(t).toContain('Female Human Wizard · Level 3')
    expect(t).toContain('Hit Points 17')
    expect(t).toContain('Armor Class 12')
    expect(t).toContain('Speed 30 ft')
    expect(t).toContain('Proficiency +2')
  })

  it('shows the ability scores with modifiers and marks saving throws', () => {
    const t = text(renderToStaticMarkup(<NpcCard npc={npc} />))
    expect(t).toContain('STR -1 8')
    expect(t).toContain('INT +3 16 ◆ Save')
    expect(t.match(/◆ Save/g)).toHaveLength(2)
  })

  it('shows skills with their bonus, proficiencies, equipment and spells', () => {
    const t = text(renderToStaticMarkup(<NpcCard npc={npc} />))
    expect(t).toContain('Arcana +5')
    expect(t).toContain('Daggers')
    expect(t).toContain('2× Dagger')
    expect(t).toContain('1st level Magic Missile')
  })

  it('makes entries buttons only when lookups are possible', () => {
    expect(renderToStaticMarkup(<NpcCard npc={npc} />)).not.toContain('<button')
    const html = renderToStaticMarkup(<NpcCard npc={npc} onLookup={() => {}} />)
    expect(html).toContain('>Magic Missile</button>')
    expect(html).toContain('>Dagger</button>')
  })
})
