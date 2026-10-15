import { CACHE_PREFIX, cacheKeys, setItemSafely, type KeyValueStore } from '../storage/storage.ts'
import type { ApiList, Class, Equipment, Race, Spell } from './types.ts'

export const API_ORIGIN = 'https://www.dnd5eapi.co'
const API_BASE = `${API_ORIGIN}/api/2014`
/** SRD data rarely changes, so cached responses stay valid for a week. */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface CacheEntry {
  storedAt: number
  data: unknown
}

export interface ApiClientOptions {
  fetchFn?: typeof fetch
  store?: KeyValueStore
  now?: () => number
}

export function createApiClient(options: ApiClientOptions = {}) {
  const fetchFn = options.fetchFn ?? ((...args: Parameters<typeof fetch>) => fetch(...args))
  const store = options.store ?? window.localStorage
  const now = options.now ?? Date.now
  // Concurrent requests for the same path share one fetch.
  const inFlight = new Map<string, Promise<unknown>>()
  let pruned = false

  /** Reads a cache entry by its full key; expired or corrupt entries are removed. */
  function readEntry(key: string): unknown {
    const raw = store.getItem(key)
    if (!raw) return undefined
    try {
      const entry = JSON.parse(raw) as CacheEntry
      if (now() - entry.storedAt < CACHE_TTL_MS) return entry.data
    } catch {
      // Corrupt entry: dropped below.
    }
    store.removeItem(key)
    return undefined
  }

  /** Once per client: drop expired entries so the cache does not grow forever. */
  function pruneExpired(): void {
    if (pruned) return
    pruned = true
    cacheKeys(store).forEach(readEntry)
  }

  function writeCache(path: string, data: unknown): void {
    try {
      // Frees the whole cache if storage is full, so newer entries replace older ones.
      setItemSafely(store, CACHE_PREFIX + path, JSON.stringify({ storedAt: now(), data }))
    } catch {
      // Still no space: the app works, just without caching this response.
    }
  }

  /**
   * GET a path below /api/2014, e.g. "spells/fireball". Also accepts the
   * absolute "/api/2014/..." urls that the API puts into references.
   */
  async function get<T>(path: string): Promise<T> {
    const normalized = path.replace(/^\/api\/2014\//, '').replace(/^\//, '')
    pruneExpired()
    const cached = readEntry(CACHE_PREFIX + normalized)
    if (cached !== undefined) return cached as T

    let request = inFlight.get(normalized)
    if (!request) {
      request = fetchFn(`${API_BASE}/${normalized}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`D&D 5e API ${res.status} for ${normalized}`)
          const data: unknown = await res.json()
          writeCache(normalized, data)
          return data
        })
        .finally(() => inFlight.delete(normalized))
      inFlight.set(normalized, request)
    }
    return request as Promise<T>
  }

  return {
    get,
    races: () => get<ApiList>('races'),
    race: (index: string) => get<Race>(`races/${index}`),
    classes: () => get<ApiList>('classes'),
    class: (index: string) => get<Class>(`classes/${index}`),
    classSpells: (index: string) => get<ApiList>(`classes/${index}/spells`),
    spell: (index: string) => get<Spell>(`spells/${index}`),
    equipment: (index: string) => get<Equipment>(`equipment/${index}`),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
