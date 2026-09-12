import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpDown, Calculator } from 'lucide-react'
import type { AirportCode, CabinClass, FareId } from '../../types'
import { BottomSheet } from '../common/Overlays'
import { Button } from '../common/Button'
import { ProgressBar } from '../common/States'
import { AirportSheet } from '../booking/Sheets'
import { FieldRow } from '../common/Inputs'
import { getFlights, FARE_FAMILIES } from '../../data/flights'
import { getAirport } from '../../data/airports'
import { useApp } from '../../store/AppContext'
import { PlaneLanding, PlaneTakeoff } from 'lucide-react'
import { formatNumber } from '../../utils/format'
import { cn } from '../../utils/cn'

const FARE_MULT: Record<FareId, number> = { saver: 1, value: 1.25, flex: 1.5 }
const CABIN_MULT: Record<CabinClass, number> = { economy: 1, business: 2, first: 3 }

/** Estimates miles for any route, fare and cabin — and how it moves the member towards the next tier. */
export function MilesCalculator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { miles, dispatch } = useApp()
  const navigate = useNavigate()
  const [origin, setOrigin] = useState<AirportCode>('CGK')
  const [destination, setDestination] = useState<AirportCode>('HND')
  const [fare, setFare] = useState<FareId>('value')
  const [cabin, setCabin] = useState<CabinClass>('economy')
  const [pick, setPick] = useState<'origin' | 'destination' | null>(null)

  const result = useMemo(() => {
    const flights = getFlights(origin, destination, cabin, '2026-10-10')
    const base = flights[0]?.milesEarn ?? 0
    const flightMiles = Math.round(base * FARE_MULT[fare] * CABIN_MULT[cabin])
    const bonus = Math.round((flightMiles * miles.tier.bonus) / 100)
    const tierAfter = miles.tierMiles + flightMiles
    return { base, flightMiles, bonus, total: flightMiles + bonus, tierAfter }
  }, [origin, destination, fare, cabin, miles.tier.bonus, miles.tierMiles])

  const next = miles.nextTier
  const reachesNext = next ? result.tierAfter >= next.threshold : false

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title="Miles calculator"
        subtitle="Estimate what a flight earns at your tier"
        height="tall"
        footer={
          <Button
            full
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={() => {
              dispatch({ type: 'SET_SEARCH', search: { origin, destination, cabin, tripType: 'oneway' } })
              onClose()
              navigate('/book')
            }}
          >
            Book {getAirport(origin).city} → {getAirport(destination).city}
          </Button>
        }
      >
        <div className="card overflow-hidden relative">
          <FieldRow label="From" icon={PlaneTakeoff} value={`${getAirport(origin).city} (${origin})`} onClick={() => setPick('origin')} />
          <div className="border-t border-surface-line" />
          <FieldRow label="To" icon={PlaneLanding} value={`${getAirport(destination).city} (${destination})`} onClick={() => setPick('destination')} />
          <button
            type="button"
            aria-label="Swap airports"
            onClick={() => {
              setOrigin(destination)
              setDestination(origin)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border border-surface-line shadow-card flex items-center justify-center text-brand-navy"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        <p className="t-label mt-4 mb-2">Fare family</p>
        <div className="grid grid-cols-3 gap-2">
          {FARE_FAMILIES.map((f) => (
            <button key={f.id} type="button" onClick={() => setFare(f.id)} className={cn('h-11 rounded-xl border text-[12.5px] font-semibold', fare === f.id ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-surface-line text-ink-soft')}>
              {f.name.replace('Economy ', '')}
              <span className="block text-[10px] font-medium opacity-80">×{FARE_MULT[f.id]}</span>
            </button>
          ))}
        </div>
        <p className="t-label mt-4 mb-2">Cabin</p>
        <div className="grid grid-cols-3 gap-2">
          {(['economy', 'business', 'first'] as CabinClass[]).map((c) => (
            <button key={c} type="button" onClick={() => setCabin(c)} className={cn('h-10 rounded-xl border text-[12.5px] font-semibold capitalize', cabin === c ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-surface-line text-ink-soft')}>
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl card-navy p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-brand-turquoise-light">
            <Calculator className="h-3.5 w-3.5" /> Estimated earning
          </div>
          <p className="text-[34px] font-bold leading-none mt-2">{formatNumber(result.total)} <span className="text-[14px] font-semibold text-white/70">miles</span></p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-white/60">Flight miles</p>
              <p className="font-semibold">{formatNumber(result.flightMiles)}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-white/60">{miles.tier.name} bonus +{miles.tier.bonus}%</p>
              <p className="font-semibold">{formatNumber(result.bonus)}</p>
            </div>
          </div>
        </div>

        {next && (
          <div className="mt-3 card p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-ink">After this flight</span>
              <span className={cn('font-bold', reachesNext ? 'text-success' : 'text-ink-muted')}>{reachesNext ? `You reach ${next.name}` : `${formatNumber(Math.max(0, next.threshold - result.tierAfter))} to ${next.name}`}</span>
            </div>
            <ProgressBar value={result.tierAfter - miles.tier.threshold} max={next.threshold - miles.tier.threshold} tone="gold" className="mt-2" label="Projected tier progress" />
            <p className="text-[11.5px] text-ink-muted mt-1.5">
              {formatNumber(miles.tierMiles)} → <span className="font-semibold text-ink">{formatNumber(result.tierAfter)}</span> tier miles · Only flight miles count towards tier status.
            </p>
          </div>
        )}
        <p className="text-[11px] text-ink-faint mt-3 pb-2">Estimates use prototype earning rates. Partner and promotional miles are credited separately.</p>
      </BottomSheet>

      <AirportSheet open={pick === 'origin'} onClose={() => setPick(null)} title="From" value={origin} exclude={destination} onSelect={setOrigin} />
      <AirportSheet open={pick === 'destination'} onClose={() => setPick(null)} title="To" value={destination} exclude={origin} onSelect={setDestination} />
    </>
  )
}
