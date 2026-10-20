import { describe, expect, it } from 'vitest'
import { formatBytes } from './format.ts'

describe('formatBytes', () => {
  it('shows bytes below 1 KB', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1023)).toBe('1023 B')
  })

  it('shows whole kilobytes below 1 MB', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('2 KB')
  })

  it('shows megabytes with one decimal', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB')
    expect(formatBytes(25 * 1024 * 1024)).toBe('25.0 MB')
  })
})
