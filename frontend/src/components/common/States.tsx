import type { ReactNode } from 'react'
import { RefreshCw, WifiOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './Button'
import { Mascot, type MascotName } from './Mascot'

export function EmptyState({
  title,
  description,
  mascot,
  icon: Icon,
  action,
  className,
  compact,
}: {
  title: string
  description?: string
  mascot?: MascotName
  icon?: LucideIcon
  action?: ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn('flex flex-col items-center text-center', compact ? 'py-8' : 'py-14', className)}>
      {mascot ? (
        <Mascot name={mascot} size={compact ? 96 : 140} className="mb-4" />
      ) : Icon ? (
        <span className="h-16 w-16 rounded-full bg-surface-soft text-brand-navy flex items-center justify-center mb-4">
          <Icon className="h-7 w-7" />
        </span>
      ) : null}
      <h3 className="t-h3 text-[16px]">{title}</h3>
      {description && <p className="t-body mt-1.5 max-w-[280px]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Unable to load your trip.', description = 'Please check your connection and try again.', onRetry }: { title?: string; description?: string; onRetry: () => void }) {
  return (
    <div className="card p-6 flex flex-col items-center text-center">
      <span className="h-14 w-14 rounded-full bg-error-soft text-error flex items-center justify-center mb-3">
        <RefreshCw className="h-6 w-6" />
      </span>
      <h3 className="t-h3">{title}</h3>
      <p className="t-caption mt-1 max-w-[260px]">{description}</p>
      <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
        Retry
      </Button>
    </div>
  )
}

export function OfflineBanner({ className }: { className?: string }) {
  return (
    <div role="status" className={cn('flex items-center gap-3 rounded-xl bg-warning-soft border border-warning/20 px-3.5 py-2.5', className)}>
      <WifiOff className="h-4 w-4 text-warning shrink-0" />
      <div className="text-[12.5px] leading-snug">
        <span className="font-semibold text-ink">You appear to be offline.</span>
        <span className="text-ink-soft"> Showing cached journey information.</span>
      </div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />
}

export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('card p-4 space-y-3', className)} aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i % 2 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function ProgressBar({ value, max = 100, tone = 'turquoise', className, label }: { value: number; max?: number; tone?: 'turquoise' | 'gold' | 'navy' | 'inverse'; className?: string; label?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const tones = { turquoise: 'bg-brand-turquoise', gold: 'bg-brand-gold', navy: 'bg-brand-navy', inverse: 'bg-white' }
  const track = tone === 'inverse' ? 'bg-white/20' : 'bg-surface-soft'
  return (
    <div className={cn('h-2 w-full rounded-full overflow-hidden', track, className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tones[tone])} style={{ width: `${pct}%` }} />
    </div>
  )
}
