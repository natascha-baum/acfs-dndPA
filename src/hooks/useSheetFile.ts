import { useEffect, useState } from 'react'
import { loadSheetFile, upgradeOldSheet, type SheetFileDeps } from '../features/player/loadSheetFile.ts'
import type { PlayerSheet } from '../types/models.ts'

export type SheetFileState = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; url: string }

/**
 * The stored PDF of a player character as an object URL, revoked when the page
 * closes. The PDF is shown first; an old upload is then read once and passed
 * to `onUpgrade`. Pass `deps` and `onUpgrade` that do not change between renders.
 */
export function useSheetFile(id: string, deps: SheetFileDeps, onUpgrade: (player: PlayerSheet) => void): SheetFileState {
  const [state, setState] = useState<SheetFileState>({ status: 'loading' })

  useEffect(() => {
    let url: string | undefined
    let cancelled = false
    loadSheetFile(id, deps)
      .then(async (file) => {
        if (cancelled) return
        if (!file) return setState({ status: 'missing' })
        url = URL.createObjectURL(new Blob([file], { type: 'application/pdf' }))
        setState({ status: 'ready', url })
        const upgraded = await upgradeOldSheet(id, file, deps)
        if (upgraded && !cancelled) onUpgrade(upgraded)
      })
      .catch(() => !cancelled && setState({ status: 'missing' }))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [id, deps, onUpgrade])

  return state
}
