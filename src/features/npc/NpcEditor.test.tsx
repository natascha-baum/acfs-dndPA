import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { Character } from '../../types/models.ts'
import { SKILL_REFS } from './editNpc.ts'
import NpcEditor from './NpcEditor.tsx'

// The app's API client needs a browser; the class spell list is never loaded during a static render.
vi.mock('../../lib/api/index.ts', () => ({ api: {} }))

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
  notes: 'Owes the guild',
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-15T00:00:00.000Z',
}

const noop = () => {}
// Static HTML in the Node test environment; the class spell list is still loading here.
const render = (character: Character) => renderToStaticMarkup(<NpcEditor npc={character} onSave={noop} onCancel={noop} />)

describe('NpcEditor', () => {
  it('fills in who the character is', () => {
    const html = render(npc)
    expect(html).toContain('Edit Orla')
    expect(html).toContain('value="Orla"')
    expect(html).toContain('value="Female"')
    expect(html).toContain('Owes the guild')
    expect(html).toContain('id="edit-role"')
  })

  it('fills in combat values, ability scores and saves', () => {
    const html = render(npc)
    expect(html).toContain('value="17"')
    expect(html).toContain('value="12"')
    expect(html).toContain('value="16"')
    expect(html.match(/type="checkbox"[^>]*checked=""/g)).toHaveLength(2)
  })

  it('lists skills, proficiencies, equipment with quantity and spells', () => {
    const html = render(npc)
    expect(html).toContain('Arcana')
    expect(html).toContain('Daggers')
    expect(html).toContain('aria-label="Quantity of Dagger"')
    expect(html).toContain('Magic Missile')
    expect(html).toContain('lv 1')
    expect(html).toContain('id="edit-add-proficiency"')
    expect(html).toContain('id="edit-add-item"')
  })

  it('hides the role for player characters and "Add skill" when every skill is taken', () => {
    const html = render({ ...npc, role: 'player', skills: SKILL_REFS })
    expect(html).not.toContain('id="edit-role"')
    expect(html).not.toContain('id="edit-add-skill"')
    expect(render(npc)).toContain('id="edit-add-skill"')
  })
})
