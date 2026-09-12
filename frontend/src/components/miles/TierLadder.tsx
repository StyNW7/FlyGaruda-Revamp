import { Check, Crown } from 'lucide-react'
import { TIERS } from '../../data/miles'
import { useApp } from '../../store/AppContext'
import { formatNumber } from '../../utils/format'
import { cn } from '../../utils/cn'

/** Four-step tier ladder with the member's current position and miles to the next tier. */
export function TierLadder({ className }: { className?: string }) {
  const { miles } = useApp()
  const currentIndex = TIERS.findIndex((t) => t.name === miles.tier.name)
  const maxThreshold = TIERS[TIERS.length - 1].threshold
  const pos = Math.min(100, (miles.tierMiles / maxThreshold) * 100)
  return (
    <section className={cn('card p-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="t-label">Tier progress</p>
          <p className="text-[15px] font-bold text-ink mt-0.5">
            {miles.tier.name}
            {miles.nextTier && <span className="text-ink-muted font-medium"> → {miles.nextTier.name}</span>}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[22px] font-bold text-brand-navy leading-none">{miles.progressPct}%</span>
          <p className="text-[11px] text-ink-muted">to {miles.nextTier?.name ?? 'top tier'}</p>
        </div>
      </div>

      <div className="relative mt-5 mb-2 h-2 rounded-full bg-surface-soft">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-turquoise to-brand-gold transition-[width] duration-700" style={{ width: `${pos}%` }} />
        {TIERS.map((t, i) => {
          const left = (t.threshold / maxThreshold) * 100
          const reached = i <= currentIndex
          return (
            <span
              key={t.name}
              className={cn('absolute -top-[7px] h-[22px] w-[22px] -translate-x-1/2 rounded-full border-2 flex items-center justify-center', reached ? 'bg-white' : 'bg-surface-soft border-surface-line')}
              style={{ left: `${Math.max(left, 1.2)}%`, borderColor: reached ? t.color : undefined }}
              aria-hidden
            >
              {reached ? <Check className="h-3 w-3" strokeWidth={3} style={{ color: t.color }} /> : <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />}
            </span>
          )
        })}
      </div>
      <div className="relative h-9">
        {TIERS.map((t, i) => {
          const left = (t.threshold / maxThreshold) * 100
          return (
            <div
              key={t.name}
              className={cn('absolute top-2 text-center', i === 0 ? 'left-0' : i === TIERS.length - 1 ? 'right-0' : '-translate-x-1/2')}
              style={i > 0 && i < TIERS.length - 1 ? { left: `${left}%` } : undefined}
            >
              <p className={cn('text-[11px] font-bold leading-tight inline-flex items-center gap-1', i === currentIndex ? 'text-ink' : 'text-ink-muted')}>
                {i === currentIndex && <Crown className="h-3 w-3" style={{ color: t.color }} />}
                {t.name}
              </p>
              <p className="text-[10px] text-ink-faint leading-tight">{t.threshold === 0 ? 'Start' : `${formatNumber(t.threshold / 1000)}k`}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[12px] text-ink-muted">
        <span>
          <span className="font-semibold text-ink">{formatNumber(miles.tierMiles)}</span> tier miles this year
        </span>
        {miles.nextTier ? (
          <span>
            <span className="font-semibold text-ink">{formatNumber(miles.milesToNextTier)}</span> to {miles.nextTier.name}
          </span>
        ) : (
          <span className="font-semibold text-brand-gold">Top tier reached</span>
        )}
      </div>
    </section>
  )
}
