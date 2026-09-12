import { useEffect, useState } from 'react'

/** Counts down from an initial number of seconds; ticks every second. Returns 'Xh Ym' style label. */
export function useCountdown(initialSeconds: number): string {
  const [remaining, setRemaining] = useState(initialSeconds)
  useEffect(() => {
    const id = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => window.clearInterval(id)
  }, [])
  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}
