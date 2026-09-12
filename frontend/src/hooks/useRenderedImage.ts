import { useEffect, useRef, useState } from 'react'

/**
 * Renders an image blob (via the given async renderer) whenever `active` is true,
 * exposing an object URL for previews and the blob itself for saving / sharing.
 * The previous preview stays visible while a new one renders, so option changes feel live.
 */
export function useRenderedImage(render: () => Promise<Blob>, active: boolean, deps: unknown[], debounceMs = 0) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    setLoading(true)
    setError(null)
    const timer = window.setTimeout(() => {
      render()
        .then((b) => {
          if (cancelled) return
          const next = URL.createObjectURL(b)
          if (urlRef.current) URL.revokeObjectURL(urlRef.current)
          urlRef.current = next
          setBlob(b)
          setUrl(next)
        })
        .catch((e: unknown) => {
          if (!cancelled) setError(e instanceof Error ? e.message : 'Could not render image')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, debounceMs)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps])

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    },
    [],
  )

  return { blob, url, error, loading }
}
