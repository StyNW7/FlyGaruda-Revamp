import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Plane, User } from 'lucide-react'
import type { Trip } from '../../types'
import { cityOf } from '../../data/airports'
import { formatMediumDate } from '../../utils/format'
import { StatusBadge } from '../common/StatusBadge'
import { cn } from '../../utils/cn'

export function RouteLine({ origin, destination, tone = 'light', size = 'md' }: { origin: string; destination: string; tone?: 'light' | 'navy'; size?: 'md' | 'lg' }) {
  const dark = tone === 'navy'
  return (
    <div className="flex items-center gap-3">
      <span className={cn('font-bold tracking-tight', size === 'lg' ? 'text-[30px]' : 'text-[22px]', dark ? 'text-white' : 'text-ink')}>{origin}</span>
      <span className="flex-1 flex items-center gap-1.5 min-w-[40px]">
        <span className={cn('h-[2px] flex-1 rounded-full', dark ? 'bg-white/25' : 'bg-surface-line')} />
        <Plane className={cn('h-4 w-4 shrink-0', dark ? 'text-brand-turquoise-light' : 'text-brand-turquoise')} />
        <span className={cn('h-[2px] flex-1 rounded-full', dark ? 'bg-white/25' : 'bg-surface-line')} />
      </span>
      <span className={cn('font-bold tracking-tight', size === 'lg' ? 'text-[30px]' : 'text-[22px]', dark ? 'text-white' : 'text-ink')}>{destination}</span>
    </div>
  )
}

export function TripCard({ trip, className }: { trip: Trip; className?: string }) {
  const cancelled = trip.status === 'cancelled'
  const dep = trip.disruption ? trip.disruption.newDepartTime : trip.departTime
  const arr = trip.disruption ? trip.disruption.newArriveTime : trip.arriveTime
  return (
    <Link to={`/trips/${trip.id}`} className={cn('card block p-4 press', cancelled && 'opacity-80', className)}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-[12px] text-ink-muted">
          <span className="font-semibold text-ink">{trip.flightNumber}</span>
          <span aria-hidden>·</span>
          <span>{formatMediumDate(trip.date)}</span>
        </div>
        <StatusBadge status={trip.status} />
      </div>
      <RouteLine origin={trip.origin} destination={trip.destination} />
      <div className="flex items-center justify-between mt-1 text-[12px] text-ink-muted">
        <span>
          {cityOf(trip.origin)} · <span className="font-semibold text-ink-soft">{dep}</span>
        </span>
        <span className="text-right">
          {trip.destination === 'DPS' ? 'Bali' : cityOf(trip.destination)} · <span className="font-semibold text-ink-soft">{arr}</span>
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-surface-line flex items-center gap-3 text-[12px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          {trip.passengerName}
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          Booking <span className="font-mono font-semibold text-ink tracking-wider">{trip.bookingCode}</span>
        </span>
        <ChevronRight className="h-4 w-4 text-ink-faint" />
      </div>
    </Link>
  )
}

export function TripMiniCard({ trip }: { trip: Trip }) {
  return (
    <Link to={`/trips/${trip.id}`} className="card p-3.5 flex items-center gap-3 press">
      <span className="h-10 w-10 rounded-xl bg-surface-soft text-brand-navy flex items-center justify-center shrink-0">
        <Plane className="h-5 w-5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5 text-[14px] font-bold text-ink">
          {trip.origin}
          <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
          {trip.destination}
          <span className="text-[12px] font-medium text-ink-muted ml-1">{trip.flightNumber}</span>
        </span>
        <span className="block text-[12px] text-ink-muted mt-0.5">
          {formatMediumDate(trip.date)} · {trip.departTime}
        </span>
      </span>
      <StatusBadge status={trip.status} dot={false} />
    </Link>
  )
}
