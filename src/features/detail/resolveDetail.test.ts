import { describe, expect, it } from 'vitest'
import srd from './__fixtures__/srd-details.json'
import { refFromUrl, resolveDetail, type DetailApi } from './resolveDetail.ts'

const data = srd as Record<string, unknown>
const api: DetailApi = {
  async get<T>(path: string) {
    if (!(path in data)) throw new Error(`No fixture for ${path}`)
    return data[path] as T
  },
}

describe('resolveDetail', () => {
  it('describes a spell', async () => {
    const d = await resolveDetail({ kind: 'spell', index: 'fireball', name: 'Fireball' }, api)
    expect(d.title).toBe('Fireball')
    expect(d.subtitle).toBe('3rd-level evocation')
    expect(d.facts).toContainEqual({ label: 'Range', value: '150 feet' })
    expect(d.paragraphs.at(-1)).toMatch(/^At higher levels:/)
  })

  it('calls level 0 spells cantrips', async () => {
    const d = await resolveDetail({ kind: 'spell', index: 'mage-hand', name: 'Mage Hand' }, api)
    expect(d.subtitle).toBe('Conjuration cantrip')
  })

  it('describes weapons, armor and packs', async () => {
    const sword = await resolveDetail({ kind: 'equipment', index: 'longsword', name: 'Longsword' }, api)
    expect(sword.subtitle).toBe('Martial Melee')
    expect(sword.facts).toContainEqual({ label: 'Damage', value: '1d8 slashing' })
    expect(sword.facts).toContainEqual({ label: 'Two-handed', value: '1d10 slashing' })

    const bow = await resolveDetail({ kind: 'equipment', index: 'longbow', name: 'Longbow' }, api)
    expect(bow.facts).toContainEqual({ label: 'Range', value: '150/600 ft' })

    const mail = await resolveDetail({ kind: 'equipment', index: 'chain-mail', name: 'Chain Mail' }, api)
    expect(mail.subtitle).toBe('Heavy armor')
    expect(mail.facts).toContainEqual({ label: 'Armor class', value: '16' })
    expect(mail.facts).toContainEqual({ label: 'Stealth', value: 'Disadvantage' })

    const pack = await resolveDetail({ kind: 'equipment', index: 'explorers-pack', name: "Explorer's Pack" }, api)
    expect(pack.links[0].label).toBe('Contains')
    expect(pack.links[0].items).toContainEqual({ kind: 'equipment', index: 'torch', name: '10× Torch' })
  })

  it('follows proficiencies to the skill, item or category they cover', async () => {
    const skill = await resolveDetail({ kind: 'proficiency', index: 'skill-stealth', name: 'Skill: Stealth' }, api)
    expect(skill).toMatchObject({ title: 'Skill: Stealth', subtitle: 'Skill · DEX' })
    expect(skill.paragraphs[0]).toMatch(/Stealth/)

    const weapons = await resolveDetail({ kind: 'proficiency', index: 'simple-weapons', name: 'Simple Weapons' }, api)
    expect(weapons.links[0].items.map((i) => i.index)).toContain('dagger')

    const sword = await resolveDetail({ kind: 'proficiency', index: 'longswords', name: 'Longswords' }, api)
    expect(sword).toMatchObject({ title: 'Longswords', subtitle: 'Martial Melee' })
  })

  it('describes racial traits and class features', async () => {
    const trait = await resolveDetail({ kind: 'trait', index: 'darkvision', name: 'Darkvision' }, api)
    expect(trait.subtitle).toBe('Racial trait')
    const feature = await resolveDetail({ kind: 'feature', index: 'action-surge-1-use', name: 'Action Surge' }, api)
    expect(feature.subtitle).toBe('Fighter feature · level 2')
  })

  it('maps API urls to lookups', () => {
    expect(refFromUrl({ index: 'x', name: 'X', url: '/api/2014/equipment-categories/simple-weapons' })).toEqual({
      kind: 'category',
      index: 'simple-weapons',
      name: 'X',
    })
    expect(refFromUrl({ index: 'x', name: 'X', url: '/api/2014/monsters/goblin' })).toBeUndefined()
  })
})
