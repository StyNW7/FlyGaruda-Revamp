/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'

type ToastTone = 'success' | 'info' | 'warning'
interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

const ToastContext = createContext<{ toast: (message: string, tone?: ToastTone) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.random()
    setItems((list) => [...list.slice(-2), { id, message, tone }])
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 2800)
  }, [])
  const value = useMemo(() => ({ toast }), [toast])
  const root = typeof document !== 'undefined' ? document.getElementById('app-frame') : null

  return (
    <ToastContext.Provider value={value}>
      {children}
      {root &&
        createPortal(
          <div className="absolute left-0 right-0 bottom-[calc(var(--nav-height)+16px)] z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
            {items.map((t) => {
              const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'warning' ? AlertTriangle : Info
              return (
                <div
                  key={t.id}
                  role="status"
                  className={cn(
                    'pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-float text-[13px] font-medium animate-fade-up max-w-full',
                    'bg-ink text-white',
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', t.tone === 'success' ? 'text-brand-turquoise-light' : t.tone === 'warning' ? 'text-[#F1C266]' : 'text-[#7CC4F0]')} />
                  <span>{t.message}</span>
                </div>
              )
            })}
          </div>,
          root,
        )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
