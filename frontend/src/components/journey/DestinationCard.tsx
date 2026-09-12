import { Check, Clock, Coins, Lightbulb, TrainFront } from 'lucide-react'
import type { Trip } from '../../types'
import { DESTINATION_INFO, CHECKLIST_ITEMS } from '../../data/destinationInfo'
import { useApp } from '../../store/AppContext'
import { ProgressBar } from '../common/States'
import { cn } from '../../utils/cn'

/** Destination intelligence: weather, local time, currency, arrival tips. */
export function DestinationInfoCard({ trip, compact }: { trip: Trip; compact?: boolean }) {
  const info = DESTINATION_INFO[trip.destination]
  const Weather = info.weather.icon
  return (
    <section className="card overflow-hidden">
      <div className="bg-gradient-to-br from-[#0C265D] to-[#1179B7] text-white px-4 py-3.5 flex items-center gap-3">
        <span className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center">
          <Weather className="h-6 w-6" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">Arriving in</p>
          <p className="text-[16px] font-bold leading-tight">{info.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[24px] font-bold leading-none">{info.weather.tempC}°</p>
          <p className="text-[11px] text-white/80">{info.weather.label}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-surface-line text-center text-[11px] text-ink-muted">
        <div className="py-2.5">
          <Clock className="h-3.5 w-3.5 mx-auto mb-1 text-brand-turquoise" />
          <span className="block font-semibold text-ink">{info.timezone}</span>
          {info.utcOffset}
        </div>
        <div className="py-2.5">
          <Coins className="h-3.5 w-3.5 mx-auto mb-1 text-brand-turquoise" />
          <span className="block font-semibold text-ink">{info.currency}</span>
          Currency
        </div>
        <div className="py-2.5 px-1">
          <TrainFront className="h-3.5 w-3.5 mx-auto mb-1 text-brand-turquoise" />
          <span className="block font-semibold text-ink truncate">Transfer</span>
          <span className="block truncate">{info.transfer.split(' · ')[1]}</span>
        </div>
      </div>
      {!compact && (
        <ul className="border-t border-surface-line px-4 py-3 space-y-1.5">
          {info.tips.map((t) => (
            <li key={t} className="flex items-start gap-2 text-[12.5px] text-ink-soft leading-snug">
              <Lightbulb className="h-3.5 w-3.5 text-brand-gold shrink-0 mt-0.5" />
              {t}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Pre-departure checklist, persisted per trip. */
export function TravelChecklist({ trip }: { trip: Trip }) {
  const { dispatch } = useApp()
  const done = trip.checklist ?? []
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[14px] font-bold text-ink">Travel checklist</p>
        <span className="text-[12px] font-semibold text-ink-muted">
          {done.length}/{CHECKLIST_ITEMS.length}
        </span>
      </div>
      <ProgressBar value={done.length} max={CHECKLIST_ITEMS.length} label="Checklist progress" />
      <ul className="mt-3 space-y-1">
        {CHECKLIST_ITEMS.map((item) => {
          const checked = done.includes(item.id)
          return (
            <li key={item.id}>
              <button type="button" role="checkbox" aria-checked={checked} onClick={() => dispatch({ type: 'TOGGLE_CHECKLIST', id: trip.id, item: item.id })} className="w-full flex items-center gap-3 py-2 text-left">
                <span className={cn('h-5 w-5 rounded-md border flex items-center justify-center transition-colors', checked ? 'bg-brand-turquoise border-brand-turquoise text-white' : 'border-surface-line bg-white')}>
                  {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className={cn('text-[13px]', checked ? 'text-ink-muted line-through' : 'text-ink')}>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {done.length === CHECKLIST_ITEMS.length && <p className="mt-2 text-[12px] font-semibold text-success">All set. Have a wonderful journey.</p>}
    </section>
  )
}
