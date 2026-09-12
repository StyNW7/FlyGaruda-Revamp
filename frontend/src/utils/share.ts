/** Small helpers for real device actions: downloads, native share sheet, clipboard and links. */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function downloadText(content: string, filename: string, mime = 'text/plain') {
  downloadBlob(new Blob([content], { type: `${mime};charset=utf-8` }), filename)
}

export type ShareOutcome = 'shared' | 'unsupported' | 'cancelled'

/** Opens the native share sheet with a file when the platform supports it. */
export async function shareFile(file: File, data: { title: string; text?: string }): Promise<ShareOutcome> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (!nav.share || !nav.canShare || !nav.canShare({ files: [file] })) return 'unsupported'
  try {
    await nav.share({ files: [file], title: data.title, text: data.text })
    return 'shared'
  } catch {
    return 'cancelled'
  }
}

/** Shares text through the native sheet; falls back to the clipboard. Returns what happened. */
export async function shareText(data: { title: string; text: string; url?: string }): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  if (navigator.share) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  const ok = await copyText([data.text, data.url].filter(Boolean).join('\n'))
  return ok ? 'copied' : 'failed'
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      el.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function vibrate(pattern: number | number[] = 12) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* not supported */
  }
}

/** Generates a short human-readable reference like LF-2026-04471. */
export function reference(prefix: string, seed?: string) {
  const base = seed ? [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) : Date.now()
  const n = String(base % 100000).padStart(5, '0')
  return `${prefix}-${new Date().getFullYear()}-${n}`
}

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
