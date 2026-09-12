import type { TripStatus } from '../../types'
import { cn } from '../../utils/cn'

const STYLES: Record<TripStatus, { label: string; className: string }> = {
  'on-time': { label: 'On Time', className: 'bg-success-soft text-success' },
  scheduled: { label: 'Scheduled', className: 'bg-brand-blue-light text-brand-blue' },
  delayed: { label: 'Delayed', className: 'bg-warning-soft text-warning' },
  boarding: { label: 'Boarding', className: 'bg-brand-turquoise-soft text-brand-turquoise' },
  completed: { label: 'Completed', className: 'bg-surface-soft text-ink-muted' },
  cancelled: { label: 'Cancelled', className: 'bg-error-soft text-error' },
}

export function StatusBadge({ status, className, dot = true }: { status: TripStatus; className?: string; dot?: boolean }) {
  const s = STYLES[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', s.className, className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {s.label}
    </span>
  )
}

export function Pill({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'navy' | 'blue' | 'turquoise' | 'gold' | 'success' | 'warning' | 'error' | 'inverse'
  className?: string
}) {
  const tones = {
    neutral: 'bg-surface-soft text-ink-soft',
    navy: 'bg-brand-navy text-white',
    blue: 'bg-brand-blue-light text-brand-blue',
    turquoise: 'bg-brand-turquoise-soft text-brand-turquoise',
    gold: 'bg-brand-gold-soft text-[#8A6A1F]',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    error: 'bg-error-soft text-error',
    inverse: 'bg-white/15 text-white',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap', tones[tone], className)}>
      {children}
    </span>
  )
}
