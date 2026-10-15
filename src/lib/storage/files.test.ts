import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { createFileStore } from './files.ts'

describe('createFileStore', () => {
  it('stores, reads and removes blobs', async () => {
    const files = createFileStore('test-files', () => indexedDB)
    const pdf = new Blob(['%PDF-1.7 hello'], { type: 'application/pdf' })

    await files.put('a', pdf)
    const read = await files.get('a')
    expect(read?.type).toBe('application/pdf')
    expect(await read?.text()).toBe('%PDF-1.7 hello')

    await files.remove('a')
    expect(await files.get('a')).toBeUndefined()
  })

  it('returns undefined for unknown ids', async () => {
    expect(await createFileStore('empty', () => indexedDB).get('nope')).toBeUndefined()
  })
})
