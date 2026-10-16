import type { Character, PlayerSheet, Scene, Session, SessionEntry, SessionEntryKind } from '../../types/models.ts'

// A session points to saved items (NPCs, player characters, scenes) and SRD
// monsters; it never copies them. Every change returns a new session object.

const UNTITLED = 'Untitled session'

const cleanName = (name: string) => name.trim() || UNTITLED

export function createSession(name: string, now: Date, id: string): Session {
  const at = now.toISOString()
  return { id, name: cleanName(name), notes: '', entries: [], createdAt: at, updatedAt: at }
}

export function editSession(session: Session, changes: { name: string; notes: string }, now: Date): Session {
  return { ...session, name: cleanName(changes.name), notes: changes.notes, updatedAt: now.toISOString() }
}

export function hasEntry(session: Session, kind: SessionEntryKind, ref: string): boolean {
  return session.entries.some((e) => e.kind === kind && e.ref === ref)
}

/** Adds the entry; a session that already has it is returned unchanged. */
export function addEntry(session: Session, entry: SessionEntry, now: Date): Session {
  if (hasEntry(session, entry.kind, entry.ref)) return session
  return { ...session, entries: [...session.entries, entry], updatedAt: now.toISOString() }
}

export function removeEntry(session: Session, kind: SessionEntryKind, ref: string, now: Date): Session {
  const entries = session.entries.filter((e) => !(e.kind === kind && e.ref === ref))
  return { ...session, entries, updatedAt: now.toISOString() }
}

export function toggleEntry(session: Session, entry: SessionEntry, now: Date): Session {
  return hasEntry(session, entry.kind, entry.ref)
    ? removeEntry(session, entry.kind, entry.ref, now)
    : addEntry(session, entry, now)
}

export function countSessionsWith(sessions: Session[], kind: SessionEntryKind, ref: string): number {
  return sessions.filter((s) => hasEntry(s, kind, ref)).length
}

/** Where the saved items come from; the storage collections in the app, plain lists in tests. */
export interface SessionLookup {
  npc(id: string): Character | undefined
  player(id: string): PlayerSheet | undefined
  scene(id: string): Scene | undefined
}

/** One line of the session page: the entry, its item as it is now, and the name to show. */
export type SessionLine =
  | { kind: 'npc'; entry: SessionEntry; name: string; npc: Character }
  | { kind: 'player'; entry: SessionEntry; name: string; player: PlayerSheet }
  | { kind: 'scene'; entry: SessionEntry; name: string; scene: Scene }
  | { kind: 'monster'; entry: SessionEntry; name: string }
  /** The item was deleted after it was added. */
  | { kind: 'missing'; entry: SessionEntry; name: string }

export interface SessionGroups {
  players: SessionLine[]
  /** Enemy NPCs and monsters. */
  enemies: SessionLine[]
  /** All other NPCs, e.g. encounters. */
  npcs: SessionLine[]
  scenes: SessionLine[]
}

function resolve(entry: SessionEntry, lookup: SessionLookup): SessionLine {
  const missing: SessionLine = { kind: 'missing', entry, name: entry.name }
  switch (entry.kind) {
    case 'npc': {
      const npc = lookup.npc(entry.ref)
      return npc ? { kind: 'npc', entry, name: npc.name, npc } : missing
    }
    case 'player': {
      const player = lookup.player(entry.ref)
      return player ? { kind: 'player', entry, name: player.name, player } : missing
    }
    case 'scene': {
      const scene = lookup.scene(entry.ref)
      return scene ? { kind: 'scene', entry, name: scene.title, scene } : missing
    }
    case 'monster':
      return { kind: 'monster', entry, name: entry.name }
  }
}

function groupOf(line: SessionLine): keyof SessionGroups {
  if (line.kind === 'npc') return line.npc.role === 'enemy' ? 'enemies' : 'npcs'
  if (line.kind === 'monster') return 'enemies'
  return line.entry.kind === 'player' ? 'players' : line.entry.kind === 'scene' ? 'scenes' : 'npcs'
}

/** Resolves every entry to its current item and sorts the lines into the groups of the session page. */
export function groupEntries(session: Session, lookup: SessionLookup): SessionGroups {
  const groups: SessionGroups = { players: [], enemies: [], npcs: [], scenes: [] }
  for (const entry of session.entries) {
    const line = resolve(entry, lookup)
    groups[groupOf(line)].push(line)
  }
  for (const lines of [groups.players, groups.enemies, groups.npcs, groups.scenes]) {
    lines.sort((a, b) => a.name.localeCompare(b.name))
  }
  return groups
}
