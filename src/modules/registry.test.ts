import { describe, expect, it } from 'vitest'
import { moduleRoutes, modules } from './registry.ts'

describe('module registry', () => {
  it('gives every module a unique id and entry path', () => {
    expect(new Set(modules.map((m) => m.id)).size).toBe(modules.length)
    expect(new Set(modules.map((m) => m.path)).size).toBe(modules.length)
  })

  it('turns every module and sub-page into a unique absolute route', () => {
    const paths = moduleRoutes.map((r) => r.path)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths.every((p) => p.startsWith('/'))).toBe(true)
    expect(paths).toEqual(expect.arrayContaining(['/generate/character', '/characters/:id', '/characters/player/:id']))
  })
})
