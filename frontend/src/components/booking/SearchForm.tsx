import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpDown, CalendarDays, PlaneLanding, PlaneTakeoff, Plus, Search, Tag, Users } from 'lucide-react'
import type { AirportCode, TripType } from '../../types'
import { getAirport } from '../../data/airports'
import { useApp } from '../../store/AppContext'
import { Button } from '../common/Button'
import { FieldRow } from '../common/Inputs'
import { AirportSheet, DateSheet, PassengerSheet } from './Sheets'
import { passengerLabel } from '../../utils/passengers'
import { formatMediumDate, addDays } from '../../utils/format'
import { PROMO_CODES } from '../../data/miles'
import { cn } from '../../utils/cn'

type SheetKey = 'origin' | 'destination' | 'depart' | 'return' | 'passengers' | null

const TRIP_TYPES: { id: TripType; label: string }[] = [
  { id: 'round', label: 'Round Trip' },
  { id: 'oneway', label: 'One Way' },
  { id: 'multi', label: 'Multi-city' },
]

export function SearchForm({ compact, className }: { compact?: boolean; className?: string }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const s = state.search
  const [sheet, setSheet] = useState<SheetKey>(null)
  const [promo, setPromo] = useState(Boolean(s.promoCode))
  const [promoCode, setPromoCode] = useState(s.promoCode ?? '')
  const promoInfo = promoCode.trim() ? PROMO_CODES[promoCode.trim().toUpperCase()] : undefined
  const [secondLeg, setSecondLeg] = useState<{ origin: AirportCode; destination: AirportCode }>({ origin: 'DPS', destination: 'SUB' })

  const set = (patch: Partial<typeof s>) => dispatch({ type: 'SET_SEARCH', search: patch })

  const swap = () => set({ origin: s.destination, destination: s.origin })

  const submit = () => {
    set({ promoCode: promoCode.trim() || undefined, outboundFlightId: undefined })
    navigate('/search-results')
  }

  const origin = getAirport(s.origin)
  const destination = getAirport(s.destination)

  return (
    <div className={cn('card overflow-hidden', className)}>
      {!compact && (
        <div className="flex gap-1.5 p-2 pb-0">
          {TRIP_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set({ tripType: t.id })}
              className={cn(
                'h-9 px-3.5 rounded-full text-[13px] font-semibold transition-colors',
                s.tripType === t.id ? 'bg-brand-navy text-white' : 'text-ink-muted hover:bg-surface-soft',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <FieldRow label="From" icon={PlaneTakeoff} value={`${origin.city} (${origin.code})`} onClick={() => setSheet('origin')} trailing={<span />} />
        <div className="mx-4 border-t border-surface-line" />
        <FieldRow label="To" icon={PlaneLanding} value={`${destination.city} (${destination.code})`} onClick={() => setSheet('destination')} trailing={<span />} />
        <button
          type="button"
          onClick={swap}
          aria-label="Swap origin and destination"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-surface-line shadow-card flex items-center justify-center text-brand-blue hover:bg-surface-off press"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      {s.tripType === 'multi' && (
        <div className="mx-4 mb-2 rounded-xl border border-dashed border-surface-line bg-surface-off px-3.5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Flight 2</p>
            <button type="button" className="text-[12px] font-semibold text-brand-blue inline-flex items-center gap-1" onClick={() => setSecondLeg({ origin: s.destination, destination: 'SUB' })}>
              <Plus className="h-3.5 w-3.5" /> Add flight
            </button>
          </div>
          <p className="text-[14px] font-semibold text-ink mt-1">
            {getAirport(secondLeg.origin).city} ({secondLeg.origin}) → {getAirport(secondLeg.destination).city} ({secondLeg.destination})
          </p>
          <p className="text-[11.5px] text-ink-muted mt-0.5">Prototype searches the first flight; multi-city pricing follows the same value card.</p>
        </div>
      )}

      <div className="mx-4 border-t border-surface-line" />
      <div className={cn('grid', s.tripType === 'round' ? 'grid-cols-2' : 'grid-cols-1')}>
        <FieldRow label="Departure" icon={CalendarDays} value={s.tripType === 'round' ? formatMediumDate(s.departDate).replace(/ \d{4}$/, '') : formatMediumDate(s.departDate)} onClick={() => setSheet('depart')} trailing={<span />} compact={s.tripType === 'round'} />
        {s.tripType === 'round' && (
          <FieldRow label="Return" icon={CalendarDays} value={formatMediumDate(s.returnDate).replace(/ \d{4}$/, '')} onClick={() => setSheet('return')} trailing={<span />} className="border-l border-surface-line" compact />
        )}
      </div>
      <div className="mx-4 border-t border-surface-line" />
      <FieldRow label="Passengers & cabin" icon={Users} value={passengerLabel(s.passengers, s.cabin)} onClick={() => setSheet('passengers')} />

      <div className="mx-4 border-t border-surface-line" />
      {promo ? (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Tag className={cn('h-4 w-4', promoInfo ? 'text-success' : 'text-ink-faint')} />
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              aria-label="Promo code"
              className="flex-1 bg-transparent outline-none text-[14px] font-semibold uppercase placeholder:font-medium placeholder:normal-case placeholder:text-ink-faint"
              autoFocus={!s.promoCode}
            />
            <button type="button" onClick={() => { setPromo(false); setPromoCode(''); set({ promoCode: undefined }) }} className="text-[12px] font-semibold text-ink-muted">
              Remove
            </button>
          </div>
          {promoCode.trim() && (
            <p className={cn('text-[11.5px] mt-1 pl-6', promoInfo ? 'text-success font-semibold' : 'text-ink-muted')}>
              {promoInfo ? `${promoInfo.label} · applied at checkout` : 'Code will be validated at checkout · try GARUDA10, BALI15 or MILES2026'}
            </p>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => setPromo(true)} className="w-full px-4 py-3 flex items-center gap-2 text-[13px] text-ink-soft tap">
          <Tag className="h-4 w-4 text-ink-faint" />
          Have a promo code?
          <span className="ml-auto text-brand-blue font-semibold">Add</span>
        </button>
      )}

      <div className="p-4 pt-2">
        <Button size="lg" full onClick={submit} leftIcon={<Search className="h-[18px] w-[18px]" />}>
          Search Flights
        </Button>
      </div>

      <AirportSheet open={sheet === 'origin'} onClose={() => setSheet(null)} title="Flying from" value={s.origin} exclude={s.destination} onSelect={(code) => set({ origin: code })} />
      <AirportSheet open={sheet === 'destination'} onClose={() => setSheet(null)} title="Flying to" value={s.destination} exclude={s.origin} onSelect={(code) => set({ destination: code })} />
      <DateSheet
        open={sheet === 'depart'}
        onClose={() => setSheet(null)}
        title="Departure date"
        value={s.departDate}
        onSelect={(iso) => set({ departDate: iso, returnDate: s.returnDate < iso ? addDays(iso, 4) : s.returnDate })}
      />
      <DateSheet open={sheet === 'return'} onClose={() => setSheet(null)} title="Return date" value={s.returnDate} min={s.departDate} onSelect={(iso) => set({ returnDate: iso })} />
      <PassengerSheet open={sheet === 'passengers'} onClose={() => setSheet(null)} passengers={s.passengers} cabin={s.cabin} onChange={(p, c) => set({ passengers: p, cabin: c })} />
    </div>
  )
}
