import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

function useLockScroll(open: boolean) {
  useEffect(() => {
    if (!open) return
    const scroller = document.getElementById('app-scroll')
    const prev = scroller?.style.overflow
    if (scroller) scroller.style.overflow = 'hidden'
    return () => {
      if (scroller) scroller.style.overflow = prev ?? ''
    }
  }, [open])
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
}

/**
 * Overlay root is the phone frame so sheets/modals stay inside the mobile viewport.
 * Resolved after mount so an overlay that is open on first render doesn't get portalled
 * into <body> and then re-mounted (which would drop focus from its inputs).
 */
function useOverlayRoot(): HTMLElement | null {
  const [root, setRoot] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setRoot(document.getElementById('app-frame') ?? document.body)
  }, [])
  return root
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  height = 'auto',
  className,
}: {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  height?: 'auto' | 'tall' | 'full'
  className?: string
}) {
  useLockScroll(open)
  useEscape(open, onClose)
  const panelRef = useRef<HTMLDivElement>(null)
  const root = useOverlayRoot()
  if (!open || !root) return null

  return createPortal(
    <div className="absolute inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 animate-fade-in cursor-default" />
      <div
        ref={panelRef}
        className={cn(
          'relative bg-white rounded-t-[24px] shadow-sheet animate-sheet-up flex flex-col safe-bottom',
          height === 'auto' && 'max-h-[88%]',
          height === 'tall' && 'h-[88%]',
          height === 'full' && 'h-[96%]',
          className,
        )}
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="h-1.5 w-10 rounded-full bg-surface-line" />
        </div>
        {(title || subtitle) && (
          <div className="px-5 pt-1 pb-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {title && <h2 className="t-h2">{title}</h2>}
              {subtitle && <p className="t-caption mt-0.5">{subtitle}</p>}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="h-9 w-9 -mr-2 -mt-1 rounded-full hover:bg-surface-soft flex items-center justify-center text-ink-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-surface-line bg-white">{footer}</div>}
      </div>
    </div>,
    root,
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  dismissible = true,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  dismissible?: boolean
}) {
  useLockScroll(open)
  useEscape(open, dismissible ? onClose : () => undefined)
  const root = useOverlayRoot()
  if (!open || !root) return null
  return createPortal(
    <div className="absolute inset-0 z-50 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={dismissible ? onClose : undefined} className="absolute inset-0 bg-ink/45 animate-fade-in cursor-default" />
      <div className={cn('relative w-full max-w-[360px] bg-white rounded-2xl shadow-float animate-scale-in overflow-hidden', className)}>
        {title && (
          <div className="px-5 pt-5 pb-2 flex items-start gap-3">
            <h2 className="t-h2 flex-1">{title}</h2>
            {dismissible && (
              <button type="button" onClick={onClose} aria-label="Close" className="h-8 w-8 -mr-2 -mt-1 rounded-full hover:bg-surface-soft flex items-center justify-center text-ink-muted">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-5 pb-5">{children}</div>
        {footer && <div className="px-5 pb-5">{footer}</div>}
      </div>
    </div>,
    root,
  )
}
