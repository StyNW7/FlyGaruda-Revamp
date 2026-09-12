import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface AppHeaderProps {
  title?: ReactNode
  subtitle?: ReactNode
  back?: boolean | string
  close?: boolean | string
  right?: ReactNode
  tone?: 'light' | 'navy' | 'transparent'
  sticky?: boolean
  className?: string
  large?: boolean
}

export function AppHeader({ title, subtitle, back, close, right, tone = 'light', sticky = true, className, large }: AppHeaderProps) {
  const navigate = useNavigate()
  const goBack = () => (typeof back === 'string' ? navigate(back) : navigate(-1))
  const goClose = () => (typeof close === 'string' ? navigate(close) : navigate(-1))
  const isDark = tone === 'navy'

  return (
    <header
      className={cn(
        'safe-top z-30',
        sticky && 'sticky top-0',
        tone === 'light' && 'bg-white/90 backdrop-blur border-b border-surface-line',
        tone === 'navy' && 'bg-brand-navy text-white',
        tone === 'transparent' && 'bg-transparent',
        className,
      )}
    >
      <div className={cn('flex items-center gap-2 px-3', large ? 'h-16' : 'h-14')}>
        {back ? (
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors',
              isDark ? 'hover:bg-white/10 active:bg-white/15' : 'hover:bg-surface-soft active:bg-surface-line',
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-1" />
        )}
        <div className="flex-1 min-w-0">
          {typeof title === 'string' ? (
            <h1 className={cn('truncate font-bold tracking-[-0.01em]', large ? 'text-[20px]' : 'text-[16px]', isDark ? 'text-white' : 'text-ink')}>
              {title}
            </h1>
          ) : (
            title
          )}
          {subtitle && <p className={cn('truncate text-[12px] leading-tight', isDark ? 'text-white/70' : 'text-ink-muted')}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {right}
          {close && (
            <button
              type="button"
              onClick={goClose}
              aria-label="Close"
              className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center transition-colors',
                isDark ? 'hover:bg-white/10' : 'hover:bg-surface-soft',
              )}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
