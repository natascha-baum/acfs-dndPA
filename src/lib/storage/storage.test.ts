import { describe, expect, it } from 'vitest'
import { memoryStore } from '../testing.ts'
import { CACHE_PREFIX, StorageFullError, createCollection } from './storage.ts'

interface Item {
  id: string
  name: string
}

describe('createCollection', () => {
  it('saves, updates, lists and removes items', () => {
    const items = createCollection<Item>('items', { store: memoryStore() })

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
    createCollection<Item>('items', { store }).save({ id: 'a', name: 'Goblin' })
    expect(createCollection<Item>('items', { store }).get('a')).toEqual({ id: 'a', name: 'Goblin' })
  })

  it('returns an empty list for missing or corrupt data', () => {
    const store = memoryStore()
    expect(createCollection<Item>('items', { store }).list()).toEqual([])
    store.setItem('dndpa:items', '{not json')
    expect(createCollection<Item>('items', { store }).list()).toEqual([])
  })

  it('stores items together with their schema version', () => {
    const store = memoryStore()
    createCollection<Item>('items', { store, version: 2 }).save({ id: 'a', name: 'Goblin' })
    expect(JSON.parse(store.getItem('dndpa:items')!)).toEqual({ version: 2, items: [{ id: 'a', name: 'Goblin' }] })
  })

  it('migrates older items, including the old bare-array format', () => {
    const store = memoryStore()
    store.setItem('dndpa:items', JSON.stringify([{ id: 'a', title: 'Goblin' }]))
    const migrate = (item: unknown, fromVersion: number) => {
      expect(fromVersion).toBe(0)
      const old = item as { id: string; title: string }
      return { id: old.id, name: old.title }
    }

    const items = createCollection<Item>('items', { store, version: 1, migrate })
    expect(items.list()).toEqual([{ id: 'a', name: 'Goblin' }])
    // The upgrade is written back, so it only runs once.
    expect(JSON.parse(store.getItem('dndpa:items')!)).toEqual({ version: 1, items: [{ id: 'a', name: 'Goblin' }] })
  })

  it('drops cached API data when storage is full, then saves', () => {
    const store = memoryStore()
    store.setItem(`${CACHE_PREFIX}spells/fireball`, '{}')
    const setItem = store.setItem
    let full = true
    store.setItem = (key, value) => {
      if (full && key === 'dndpa:items') {
        full = false
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      }
      setItem(key, value)
    }

    createCollection<Item>('items', { store }).save({ id: 'a', name: 'Goblin' })
    expect(store.getItem(`${CACHE_PREFIX}spells/fireball`)).toBeNull()
    expect(createCollection<Item>('items', { store }).get('a')).toEqual({ id: 'a', name: 'Goblin' })
  })

  it('throws StorageFullError when there is nothing left to free', () => {
    const store = memoryStore()
    store.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    }
    expect(() => createCollection<Item>('items', { store }).save({ id: 'a', name: 'Goblin' })).toThrow(
      StorageFullError,
    )
  })
})
