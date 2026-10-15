// All persistence goes through this interface so the local browser storage
// can later be swapped for an account-based backend without touching features.

export interface Entity {
  id: string
}

export interface Collection<T extends Entity> {
  list(): T[]
  get(id: string): T | undefined
  save(item: T): void
  remove(id: string): void
}

/** The subset of the Web Storage API we rely on (makes testing easy). */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const PREFIX = 'dndpa:'

export function createCollection<T extends Entity>(
  name: string,
  store: KeyValueStore = window.localStorage,
): Collection<T> {
  const key = `${PREFIX}${name}`

  function read(): T[] {
    const raw = store.getItem(key)
    if (!raw) return []
    try {
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }

  function write(items: T[]): void {
    store.setItem(key, JSON.stringify(items))
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
