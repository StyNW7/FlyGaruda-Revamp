import { ArrowRight, BadgeCheck, Clock, Plane, Sparkles, Zap } from 'lucide-react'
import type { Flight } from '../../types'
import { VALUE_ITEMS } from '../../data/flights'
import { formatDuration, formatRupiah } from '../../utils/format'
import { Button } from '../common/Button'
import { Pill } from '../common/StatusBadge'
import { cn } from '../../utils/cn'

/** Garuda Value Card: schedule + price + what the fare already includes. */
export function FlightCard({
  flight,
  onSelect,
  onViewValue,
  className,
}: {
  flight: Flight
  onSelect: () => void
  onViewValue: () => void
  className?: string
}) {
  const best = flight.tags?.includes('best-value')
  return (
    <article className={cn('card overflow-hidden', best && 'border-brand-turquoise/40 ring-1 ring-brand-turquoise/20', className)}>
      {best && (
        <div className="bg-brand-turquoise-soft text-brand-turquoise text-[11px] font-bold uppercase tracking-[0.08em] px-4 py-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Recommended · Best value
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between text-[12px] text-ink-muted mb-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-6 w-6 rounded-md bg-brand-navy flex items-center justify-center">
              <img src="/brand/mark-white.png" alt="" className="h-2.5 w-auto" />
            </span>
            <span className="font-semibold text-ink">{flight.number}</span>
            <span aria-hidden>·</span>
            <span>{flight.aircraft}</span>
          </span>
          <div className="flex items-center gap-1.5">
            {flight.tags?.includes('earliest') && (
              <Pill tone="blue">
                <Zap className="h-3 w-3" /> Earliest
              </Pill>
            )}
            {flight.tags?.includes('lowest-fare') && <Pill tone="neutral">Lowest fare</Pill>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-[24px] font-bold leading-none tracking-tight text-ink">{flight.departTime}</p>
            <p className="text-[12px] text-ink-muted mt-1">{flight.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center px-1">
            <span className="text-[11px] text-ink-muted inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(flight.durationMin)}
            </span>
            <span className="w-full flex items-center gap-1 my-1">
              <span className="h-[2px] flex-1 bg-surface-line rounded-full" />
              <Plane className="h-3.5 w-3.5 text-brand-turquoise" />
              <span className="h-[2px] flex-1 bg-surface-line rounded-full" />
            </span>
            <span className="text-[11px] font-semibold text-success">Direct</span>
          </div>
          <div className="text-right">
            <p className="text-[24px] font-bold leading-none tracking-tight text-ink">{flight.arriveTime}</p>
            <p className="text-[12px] text-ink-muted mt-1">{flight.destination}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-surface-off border border-surface-line p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-navy">
              <BadgeCheck className="h-4 w-4 text-brand-turquoise" />
              Full-service value
            </span>
            <button type="button" onClick={onViewValue} className="text-[12px] font-semibold text-brand-blue inline-flex items-center gap-0.5 hover:underline">
              View Value <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="grid grid-cols-3 gap-x-2 gap-y-2">
            {VALUE_ITEMS.map(({ key, short, icon: Icon }) => (
              <li key={key} className="flex items-center gap-1.5 text-[11.5px] text-ink-soft leading-tight min-w-0">
                <Icon className="h-3.5 w-3.5 text-brand-turquoise shrink-0" strokeWidth={2} />
                <span className="truncate">{short}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-ink-muted">Economy from</p>
            <p className="text-[20px] font-bold text-brand-navy leading-tight tracking-tight">{formatRupiah(flight.prices.saver)}</p>
            <p className="text-[11px] text-ink-muted">
              per adult · earn <span className="font-semibold text-ink-soft">{flight.milesEarn.toLocaleString()} miles</span>
              {flight.seatsLeft && <span className="text-warning font-semibold"> · {flight.seatsLeft} seats left</span>}
            </p>
          </div>
          <Button onClick={onSelect} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Select
          </Button>
        </div>
      </div>
    </article>
  )
}
