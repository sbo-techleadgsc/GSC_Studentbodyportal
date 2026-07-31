import { useCallback, useEffect, useState } from 'react'
import { bus } from './store'

/**
 * Subscribes to the store's change bus and re-runs `fetcher` whenever
 * any table changes, so every open tab/page reflects admin edits
 * immediately — the same behavior you'd get from a Supabase Realtime
 * subscription, just running in-memory for now.
 */
export function useLiveData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): [T | null, () => void] {
  const [data, setData] = useState<T | null>(null)

  const reload = useCallback(() => {
    fetcher().then(setData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    reload()
    const handler = () => reload()
    bus.addEventListener('change', handler)
    return () => bus.removeEventListener('change', handler)
  }, [reload])

  return [data, reload]
}
