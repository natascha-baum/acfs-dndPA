// All persistence goes through this interface so the local browser storage
// can later be swapped for an account-based backend without touching features.

export interface Entity {
  id: string
}

export interface Collection<T extends Entity> {
  list(): T[]
  get(id: string): T | undefined
  /** Throws `StorageFullError` when the browser has no space left. */
  save(item: T): void
  remove(id: string): void
}

/** The subset of the Web Storage API we rely on (makes testing easy). */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

const PREFIX = 'dndpa:'
/** Keys below this prefix only hold cached data that can be fetched again. */
export const CACHE_PREFIX = `${PREFIX}api:`

/** Thrown when an item cannot be saved because browser storage is full. */
export class StorageFullError extends Error {
  constructor() {
    super('Browser storage is full.')
    this.name = 'StorageFullError'
  }
}

export function cacheKeys(store: KeyValueStore): string[] {
  const keys: string[] = []
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i)
    if (key?.startsWith(CACHE_PREFIX)) keys.push(key)
  }
  return keys
}

/** Removes every cache entry (see `CACHE_PREFIX`). Returns how many were removed. */
export function clearCache(store: KeyValueStore): number {
  const keys = cacheKeys(store)
  keys.forEach((key) => store.removeItem(key))
  return keys.length
}

/**
 * Writes a value; if storage is full, drops the cache and tries once more.
 * Saved user data always wins over cached API responses.
 */
export function setItemSafely(store: KeyValueStore, key: string, value: string): void {
  try {
    store.setItem(key, value)
  } catch {
    if (clearCache(store) === 0) throw new StorageFullError()
    try {
      store.setItem(key, value)
    } catch {
      throw new StorageFullError()
    }
  }
}

export interface CollectionOptions<T> {
  store?: KeyValueStore
  /**
   * Version of the item shape. Raise it whenever a stored model changes and
   * teach `migrate` how to turn older items into the current shape.
   */
  version?: number
  /** Upgrades one stored item from `fromVersion` to the current version. */
  migrate?: (item: unknown, fromVersion: number) => T
}

/** What is written to storage. Version 0 is the old format: a bare array. */
interface StoredCollection {
  version: number
  items: unknown[]
}

export function createCollection<T extends Entity>(name: string, options: CollectionOptions<T> = {}): Collection<T> {
  const store = options.store ?? window.localStorage
  const version = options.version ?? 1
  const migrate = options.migrate ?? ((item: unknown) => item as T)
  const key = `${PREFIX}${name}`

  function parse(raw: string | null): StoredCollection | undefined {
    if (!raw) return undefined
    try {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) return { version: 0, items: parsed }
      if (parsed && typeof parsed === 'object' && Array.isArray((parsed as StoredCollection).items)) {
        return parsed as StoredCollection
      }
    } catch {
      // Corrupt data reads as an empty collection.
    }
    return undefined
  }

  function read(): T[] {
    const stored = parse(store.getItem(key))
    if (!stored) return []
    if (stored.version >= version) return stored.items as T[]
    const items = stored.items.map((item) => migrate(item, stored.version))
    try {
      write(items)
    } catch {
      // Could not store the upgrade; it is simply repeated on the next read.
    }
    return items
  }

  function write(items: T[]): void {
    setItemSafely(store, key, JSON.stringify({ version, items } satisfies StoredCollection))
  }

  return {
    list: read,
    get: (id) => read().find((item) => item.id === id),
    save(item) {
      const items = read()
      const index = items.findIndex((existing) => existing.id === item.id)
      if (index === -1) items.push(item)
      else items[index] = item
      write(items)
    },
    remove(id) {
      write(read().filter((item) => item.id !== id))
    },
  }
}

export function newId(): string {
  return crypto.randomUUID()
}
