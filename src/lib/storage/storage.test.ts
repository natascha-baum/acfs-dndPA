import { describe, expect, it } from 'vitest'
import { memoryStore } from '../testing.ts'
import { createCollection } from './storage.ts'

interface Item {
  id: string
  name: string
}

describe('createCollection', () => {
  it('saves, updates, lists and removes items', () => {
    const items = createCollection<Item>('items', memoryStore())

    items.save({ id: 'a', name: 'Goblin' })
    items.save({ id: 'b', name: 'Orc' })
    items.save({ id: 'a', name: 'Hobgoblin' })

    expect(items.list()).toEqual([
      { id: 'a', name: 'Hobgoblin' },
      { id: 'b', name: 'Orc' },
    ])
    expect(items.get('b')?.name).toBe('Orc')

    items.remove('a')
    expect(items.list()).toEqual([{ id: 'b', name: 'Orc' }])
  })

  it('persists across collection instances using the same store', () => {
    const store = memoryStore()
    createCollection<Item>('items', store).save({ id: 'a', name: 'Goblin' })
    expect(createCollection<Item>('items', store).get('a')).toEqual({ id: 'a', name: 'Goblin' })
  })

  it('returns an empty list for missing or corrupt data', () => {
    const store = memoryStore()
    expect(createCollection<Item>('items', store).list()).toEqual([])
    store.setItem('dndpa:items', '{not json')
    expect(createCollection<Item>('items', store).list()).toEqual([])
  })
})
