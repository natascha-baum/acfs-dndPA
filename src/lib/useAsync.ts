import { useEffect, useState } from 'react'

export type AsyncState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T }

interface Settled<I, T> {
  input: I
  attempt: number
  state: AsyncState<T>
}

/**
 * Runs `load(input)` and tracks its result; it runs again whenever `input`
 * changes or `retry` is called. Results of outdated runs are ignored.
 * Pass a `load` function defined outside the component so it stays the same.
 */
export function useAsync<I, T>(input: I, load: (input: I) => Promise<T>): AsyncState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<I, T> | null>(null)

  useEffect(() => {
    let cancelled = false
    load(input)
      .then((data) => !cancelled && setSettled({ input, attempt, state: { status: 'ready', data } }))
      .catch(() => !cancelled && setSettled({ input, attempt, state: { status: 'error' } }))
    return () => {
      cancelled = true
    }
  }, [input, load, attempt])

  const current = settled && settled.input === input && settled.attempt === attempt
  const state: AsyncState<T> = current ? settled.state : { status: 'loading' }
  return { ...state, retry: () => setAttempt((n) => n + 1) }
}
