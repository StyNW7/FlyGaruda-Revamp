import { useState, type ReactNode } from 'react'
import { Check, Download, Share2 } from 'lucide-react'
import { BottomSheet } from './Overlays'
import { Button } from './Button'
import { useToast } from './Toast'
import { useRenderedImage } from '../../hooks/useRenderedImage'
import { downloadBlob, shareFile } from '../../utils/share'
import { cn } from '../../utils/cn'

/**
 * Shows a real, rendered PNG (Instagram-story size) with Save and Share actions.
 * The preview is the exact image that gets saved to the device.
 */
export function ShareImageSheet({
  open,
  onClose,
  title,
  subtitle,
  filename,
  shareTitle,
  shareText,
  render,
  deps = [],
  controls,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  filename: string
  shareTitle: string
  shareText?: string
  render: () => Promise<Blob>
  deps?: unknown[]
  /** Optional controls rendered above the preview (theme picker, etc.). */
  controls?: ReactNode
  onSaved?: () => void
}) {
  const toast = useToast()
  const { blob, url, loading, error } = useRenderedImage(render, open, deps)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const save = () => {
    if (!blob) return
    downloadBlob(blob, filename)
    setSaved(true)
    onSaved?.()
    toast('Image saved · 1080 × 1920 PNG')
    window.setTimeout(() => setSaved(false), 2500)
  }

  const share = async () => {
    if (!blob) return
    setBusy(true)
    const file = new File([blob], filename, { type: 'image/png' })
    const result = await shareFile(file, { title: shareTitle, text: shareText })
    setBusy(false)
    if (result === 'shared') toast('Shared')
    else if (result === 'unsupported') {
      downloadBlob(blob, filename)
      toast('Sharing is not available here · image downloaded instead', 'info')
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      height="tall"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" full leftIcon={saved ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />} disabled={!blob} onClick={save}>
            {saved ? 'Saved' : 'Save image'}
          </Button>
          <Button full leftIcon={<Share2 className="h-4 w-4" />} disabled={!blob} loading={busy} onClick={share}>
            Share
          </Button>
        </div>
      }
    >
      {controls && <div className="mb-3">{controls}</div>}
      <div className="mx-auto w-[236px] aspect-[9/16] rounded-[22px] overflow-hidden bg-brand-navy shadow-float relative">
        {url && !loading ? (
          <img src={url} alt={`${title} preview`} className="h-full w-full object-cover animate-fade-in" />
        ) : (
          <div className={cn('absolute inset-0 flex flex-col items-center justify-center text-white/80 text-[12px] gap-3', error && 'text-error')}>
            {error ? (
              <span className="px-6 text-center">{error}</span>
            ) : (
              <>
                <span className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Rendering your story…
              </>
            )}
          </div>
        )}
      </div>
      <p className="text-[11px] text-ink-faint text-center mt-3">Instagram story size · 1080 × 1920 px · the preview is the exact image you save.</p>
    </BottomSheet>
  )
}
