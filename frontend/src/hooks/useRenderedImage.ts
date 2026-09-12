import { useEffect, useState } from 'react'

/**
 * Renders an image blob (via the given async renderer) whenever `active` is true,
 * exposing an object URL for previews and the blob itself for saving / sharing.
 */
export function useRenderedImage(render: () => Promise<Blob>, active: boolean, deps: unknown[]) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    let objectUrl: string | null = null
    setLoading(true)
    setError(null)
    render()
      .then((b) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(b)
        setBlob(b)
        setUrl(objectUrl)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not render image')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps])

  return { blob, url, error, loading }
}
