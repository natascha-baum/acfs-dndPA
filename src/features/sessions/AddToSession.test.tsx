import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createCollection } from '../../lib/storage/storage.ts'
import { memoryStore } from '../../lib/testing.ts'
import type { Session, SessionEntry } from '../../types/models.ts'
import AddToSession, { buttonLabel } from './AddToSession.tsx'
import { addEntry, createSession } from './sessions.ts'

const goblin: SessionEntry = { kind: 'monster', ref: 'goblin', name: 'Goblin' }
const now = new Date('2026-10-16T10:00:00.000Z')

function collectionWith(sessionsWithGoblin: number) {
  const collection = createCollection<Session>('sessions', { store: memoryStore() })
  for (let i = 0; i < 3; i++) {
    const session = createSession(`Session ${i}`, now, `s${i}`)
    collection.save(i < sessionsWithGoblin ? addEntry(session, goblin, now) : session)
  }
  return collection
}

describe('buttonLabel', () => {
  it('says how many sessions an item is in', () => {
    expect(buttonLabel(0)).toBe('+ Add to session')
    expect(buttonLabel(1)).toBe('✓ In 1 session')
    expect(buttonLabel(2)).toBe('✓ In 2 sessions')
  })
})

describe('AddToSession', () => {
  it('shows "Add to session" for an item in no session', () => {
    const html = renderToStaticMarkup(<AddToSession entry={goblin} collection={collectionWith(0)} />)
    expect(html).toContain('+ Add to session')
    expect(html).not.toContain('<dialog')
  })

  it('shows "In 2 sessions" for an item in two sessions', () => {
    expect(renderToStaticMarkup(<AddToSession entry={goblin} collection={collectionWith(2)} />)).toContain(
      '✓ In 2 sessions',
    )
  })
})
