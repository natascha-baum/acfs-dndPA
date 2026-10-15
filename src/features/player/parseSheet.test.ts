import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { OFFICIAL_SHEET_CHECKED, OFFICIAL_SHEET_TEXT } from './__fixtures__/officialSheet.ts'
import { parseSheet, scoreAndModifier } from './parseSheet.ts'
import { readSheet } from './readSheet.ts'

const fields = () => ({ text: new Map(Object.entries(OFFICIAL_SHEET_TEXT)), checked: new Set(OFFICIAL_SHEET_CHECKED) })

describe('parseSheet', () => {
  it('reads the official sheet layout', () => {
    const sheet = parseSheet(fields())!
    expect(sheet.abilityScores).toEqual({ str: 12, dex: 17, con: 13, int: 10, wis: 15, cha: 8 })
    expect(sheet.abilityModifiers.cha).toBe('-1')
    expect([sheet.armorClass, sheet.hitPoints, sheet.speed, sheet.proficiencyBonus]).toEqual(['15', '28', '35 ft', '+2'])
    expect(sheet.savingThrows.filter((s) => s.proficient).map((s) => s.ability)).toEqual(['str', 'dex'])
    expect(sheet.skills.filter((s) => s.proficient).map((s) => `${s.name} ${s.value}`)).toEqual([
      'Perception +4',
      'Stealth +5',
      'Survival +4',
    ])
    expect(sheet.skills.find((s) => s.name === 'Animal Handling')?.value).toBe('+2')
    expect(sheet.attacks).toEqual([
      { name: 'Longbow', bonus: '+7', damage: '1d8+3 piercing' },
      { name: 'Shortsword', bonus: '+5', damage: '1d6+3 piercing' },
    ])
    expect(sheet.spellcasting).toEqual({ class: 'Ranger', ability: 'WIS', saveDc: '12', attackBonus: '+4' })
    expect(sheet.spells).toEqual(['Hunter’s Mark', 'Cure Wounds', 'Speak with Animals'])
    expect(sheet.coins).toEqual({ sp: '5', gp: '12' })
    expect(sheet.personality.flaws).toMatch(/slow to trust/)
    expect(sheet.appearance).toEqual({ age: '112', height: '5\'7"', eyes: 'Green', hair: 'Auburn' })
  })

  it('ignores PDFs with (almost) no filled fields', () => {
    expect(parseSheet({ text: new Map([['CharacterName', 'Pip']]), checked: new Set() })).toBeUndefined()
  })

  it('reads a real fillable PDF end to end', async () => {
    const doc = await PDFDocument.create()
    const page = doc.addPage()
    const form = doc.getForm()
    Object.entries(OFFICIAL_SHEET_TEXT).forEach(([name, value], i) => {
      const field = form.createTextField(name)
      field.setText(value)
      field.addToPage(page, { x: 10 + (i % 4) * 140, y: 760 - Math.floor(i / 4) * 30, width: 130, height: 20 })
    })
    OFFICIAL_SHEET_CHECKED.forEach((name, i) => {
      const box = form.createCheckBox(name)
      box.addToPage(page, { x: 10 + i * 20, y: 20, width: 12, height: 12 })
      box.check()
    })
    form.createCheckBox('Check Box 23').addToPage(page, { x: 200, y: 20, width: 12, height: 12 })
    const bytes = (await doc.save()).slice().buffer

    const result = await readSheet(bytes, 'mira.pdf')
    expect(result.name).toBe('Mira Thornwood')
    expect(result.sheet?.abilityScores.dex).toBe(17)
    expect(result.sheet?.skills.find((s) => s.name === 'Acrobatics')?.proficient).toBe(false)
    expect(result.sheet?.skills.find((s) => s.name === 'Stealth')?.proficient).toBe(true)
  })
})

describe('scoreAndModifier', () => {
  it('tells the score from the modifier whichever box holds it', () => {
    expect(scoreAndModifier('+3', '17')).toEqual({ score: 17, modifier: '+3' })
    expect(scoreAndModifier('17', '+3')).toEqual({ score: 17, modifier: '+3' })
    expect(scoreAndModifier('16', '3')).toEqual({ score: 16, modifier: '3' })
    expect(scoreAndModifier('', '14')).toEqual({ score: 14, modifier: '+2' })
    expect(scoreAndModifier('', '')).toEqual({})
  })
})
