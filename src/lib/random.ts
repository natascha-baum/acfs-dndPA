/** A source of random numbers in [0, 1); injectable so tests are deterministic. */
export type Rng = () => number

export const defaultRng: Rng = Math.random

export function randomInt(max: number, rng: Rng = defaultRng): number {
  return Math.floor(rng() * max)
}

export function pick<T>(items: readonly T[], rng: Rng = defaultRng): T {
  if (items.length === 0) throw new Error('Cannot pick from an empty list')
  return items[randomInt(items.length, rng)]
}

export function shuffle<T>(items: readonly T[], rng: Rng = defaultRng): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Picks `count` distinct items (or all of them if there are fewer). */
export function pickMany<T>(items: readonly T[], count: number, rng: Rng = defaultRng): T[] {
  return shuffle(items, rng).slice(0, Math.max(0, count))
}

/** A seeded generator (mulberry32) for reproducible tests. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
