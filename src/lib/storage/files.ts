// Binary files (e.g. uploaded PDFs) are too big for localStorage, so they live
// in IndexedDB. Like `Collection`, this interface can later be backed by a server.

export interface FileStore {
  put(id: string, file: Blob): Promise<void>
  get(id: string): Promise<Blob | undefined>
  remove(id: string): Promise<void>
}

const DB_NAME = 'dndpa'

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export function createFileStore(name: string, factory: () => IDBFactory = () => window.indexedDB): FileStore {
  let db: Promise<IDBDatabase> | undefined

  // Opened lazily, so importing the module never touches IndexedDB.
  function open(): Promise<IDBDatabase> {
    db ??= new Promise((resolve, reject) => {
      const req = factory().open(`${DB_NAME}:${name}`, 1)
      req.onupgradeneeded = () => req.result.createObjectStore('files')
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => {
        db = undefined
        reject(req.error ?? new Error('Could not open the file storage.'))
      }
    })
    return db
  }

  async function run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const tx = (await open()).transaction('files', mode)
    const result = await request(op(tx.objectStore('files')))
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error ?? new Error('Storage transaction aborted.'))
    })
    return result
  }

  return {
    async put(id, file) {
      await run('readwrite', (store) => store.put(file, id))
    },
    async get(id) {
      const value: unknown = await run('readonly', (store) => store.get(id))
      return value instanceof Blob ? value : undefined
    },
    async remove(id) {
      await run('readwrite', (store) => store.delete(id))
    },
  }
}
