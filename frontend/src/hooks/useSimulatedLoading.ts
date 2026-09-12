import { useEffect, useState } from 'react'

/** Simulates a network fetch so the prototype can demonstrate skeleton states. */
export function useSimulatedLoading(ms = 700, deps: unknown[] = []): boolean {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const id = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return loading
}
