import { describe, expect, it, vi } from 'vitest'
import { memoryStore } from '../testing.ts'
import { createApiClient } from './client.ts'

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status })
}

describe('createApiClient', () => {
  it('fetches from the 2014 SRD endpoint and caches the result', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ index: 'elf', name: 'Elf' }))
    const api = createApiClient({ fetchFn, store: memoryStore() })

    expect(await api.race('elf')).toMatchObject({ name: 'Elf' })
    expect(await api.race('elf')).toMatchObject({ name: 'Elf' })

    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(fetchFn).toHaveBeenCalledWith('https://www.dnd5eapi.co/api/2014/races/elf')
  })

  it('accepts the absolute urls used in API references', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ index: 'fireball' }))
    const api = createApiClient({ fetchFn, store: memoryStore() })

    await api.get('/api/2014/spells/fireball')
    expect(fetchFn).toHaveBeenCalledWith('https://www.dnd5eapi.co/api/2014/spells/fireball')
  })

  it('shares one request between concurrent calls', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ count: 0, results: [] }))
    const api = createApiClient({ fetchFn, store: memoryStore() })

    await Promise.all([api.classes(), api.classes(), api.classes()])
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('refetches once the cache has expired', async () => {
    let time = 0
    const fetchFn = vi.fn(async () => jsonResponse({ count: 0, results: [] }))
    const api = createApiClient({ fetchFn, store: memoryStore(), now: () => time })

    await api.races()
    time = 8 * 24 * 60 * 60 * 1000
    await api.races()
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('throws on error responses and does not cache them', async () => {
    const store = memoryStore()
    const fetchFn = vi.fn(async () => jsonResponse({ error: 'Not found' }, 404))
    const api = createApiClient({ fetchFn, store })

    await expect(api.spell('nope')).rejects.toThrow('404')
    expect(store.data.size).toBe(0)
  })
})
