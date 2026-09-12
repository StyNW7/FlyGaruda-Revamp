import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpCircle, Check, Leaf, Plane, Sofa } from 'lucide-react'
import type { Trip } from '../../types'
import { BottomSheet } from '../common/Overlays'
import { Button } from '../common/Button'
import { EmptyState } from '../common/States'
import { useToast } from '../common/Toast'
import { useApp } from '../../store/AppContext'
import { distanceKm } from '../../utils/geo'
import { formatMediumDate, formatRupiah } from '../../utils/format'
import { todayISO } from '../../utils/share'
import { cn } from '../../utils/cn'

function TripPicker({ trips, value, onChange, label }: { trips: Trip[]; value: string | null; onChange: (id: string) => void; label: (t: Trip) => string }) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Choose a flight">
      {trips.map((t) => (
        <button key={t.id} type="button" role="radio" aria-checked={value === t.id} onClick={() => onChange(t.id)} className={cn('w-full flex items-center gap-3 rounded-xl border p-3.5 text-left', value === t.id ? 'border-brand-blue bg-brand-blue-light/60' : 'border-surface-line bg-white')}>
          <span className="h-10 w-10 rounded-xl bg-surface-soft text-brand-navy flex items-center justify-center shrink-0">
            <Plane className="h-5 w-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[14px] font-semibold text-ink">{t.flightNumber} · {t.origin} → {t.destination}</span>
            <span className="block text-[12px] text-ink-muted">{formatMediumDate(t.date)} · {label(t)}</span>
          </span>
          <span className={cn('h-5 w-5 rounded-full border-2 flex items-center justify-center', value === t.id ? 'border-brand-blue' : 'border-surface-line')}>{value === t.id && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}</span>
        </button>
      ))}
    </div>
  )
}

/* ---------- BidUpgrade ---------- */

function minBid(t: Trip) {
  return t.destination === 'SIN' || t.origin === 'SIN' ? 2400000 : 1250000
}

export function BidUpgrade() {
  const { upcomingTrips, dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const eligible = upcomingTrips.filter((t) => t.status !== 'cancelled' && t.cabin === 'economy')
  const [tripId, setTripId] = useState<string | null>(null)
  const trip = eligible.find((t) => t.id === tripId)
  const [amount, setAmount] = useState(0)
  const [done, setDone] = useState(false)

  const open = (id: string) => {
    const t = eligible.find((x) => x.id === id)!
    setTripId(id)
    setAmount(t.upgradeBid ?? minBid(t))
    setDone(false)
  }
  const chance = trip ? Math.min(92, Math.round(((amount - minBid(trip)) / minBid(trip)) * 90 + 35)) : 0

  const place = () => {
    if (!trip) return
    dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { upgradeBid: amount } })
    dispatch({ type: 'ADD_PURCHASE', purchase: { id: `bid-${trip.id}`, kind: 'bid', title: `BidUpgrade · ${trip.flightNumber}`, detail: `Business Class · result 48h before departure`, price: amount, date: todayISO(), status: 'pending' } })
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `bid-${trip.id}`, category: 'travel', title: `Bid placed · ${trip.flightNumber}`, body: `${formatRupiah(amount)} for a Business Class upgrade. We will let you know 48 hours before departure.`, time: 'Just now', to: `/trips/${trip.id}`, iconKey: 'award' } })
    setDone(true)
    toast('Bid placed')
  }

  if (eligible.length === 0) return <EmptyState mascot="think" title="No eligible flights" description="BidUpgrade is available on upcoming Economy bookings." compact action={<Button onClick={() => navigate('/book')}>Search flights</Button>} />

  return (
    <>
      <section>
        <p className="t-label mb-2">Eligible flights</p>
        <div className="card divide-y divide-surface-line overflow-hidden">
          {eligible.map((t) => (
            <button key={t.id} type="button" onClick={() => open(t.id)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left tap">
              <span className="h-10 w-10 rounded-xl bg-brand-gold-soft text-[#8A6A1F] flex items-center justify-center shrink-0"><ArrowUpCircle className="h-5 w-5" /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold text-ink">{t.flightNumber} · {t.origin} → {t.destination}</span>
                <span className="block text-[12px] text-ink-muted">{formatMediumDate(t.date)} · {t.upgradeBid ? `Your bid ${formatRupiah(t.upgradeBid)} · pending` : `Bids open · minimum ${formatRupiah(minBid(t))}`}</span>
              </span>
              <span className={cn('text-[11px] font-semibold rounded-full px-2 py-1', t.upgradeBid ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success')}>{t.upgradeBid ? 'Pending' : 'Open'}</span>
            </button>
          ))}
        </div>
      </section>

      <BottomSheet open={trip !== undefined} onClose={() => setTripId(null)} title={done ? undefined : `Bid for ${trip?.flightNumber}`} subtitle={done ? undefined : 'Economy → Business Class'} footer={done ? <Button full onClick={() => setTripId(null)}>Done</Button> : <Button full size="lg" onClick={place}>{trip?.upgradeBid ? 'Update bid' : 'Place bid'} · {formatRupiah(amount)}</Button>}>
        {trip && (
          done ? (
            <div className="flex flex-col items-center text-center py-3 animate-fade-up">
              <span className="h-14 w-14 rounded-full bg-success-soft text-success flex items-center justify-center mb-3 animate-check-pop"><Check className="h-7 w-7" strokeWidth={3} /></span>
              <p className="t-h3">Bid placed</p>
              <p className="t-caption mt-1 max-w-[280px]">{formatRupiah(amount)} for {trip.flightNumber}. Your card is only charged if the bid is accepted, 48 hours before departure.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-ink">Your bid</span>
                  <span className="text-[20px] font-bold text-brand-navy tabular-nums">{formatRupiah(amount)}</span>
                </div>
                <input type="range" min={minBid(trip)} max={minBid(trip) * 2.5} step={50000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} aria-label="Bid amount" className="w-full accent-brand-gold mt-2" />
                <div className="flex justify-between text-[11px] text-ink-muted">
                  <span>Min {formatRupiah(minBid(trip))}</span>
                  <span>Max {formatRupiah(minBid(trip) * 2.5)}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-surface-soft overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', chance < 50 ? 'bg-warning' : chance < 75 ? 'bg-brand-turquoise' : 'bg-success')} style={{ width: `${chance}%` }} />
                </div>
                <p className="text-[12px] text-ink-soft mt-1.5">Acceptance likelihood: <span className="font-semibold text-ink">{chance < 50 ? 'Low' : chance < 75 ? 'Fair' : 'Good'}</span> · based on cabin demand for this date</p>
              </div>
              <ul className="space-y-1.5 text-[12.5px] text-ink-soft">
                {['Lie-flat or premium recliner seat', 'Priority check-in, boarding and baggage', 'Garuda Lounge access', 'Fine dining menu with Indonesian specialities'].map((t) => (
                  <li key={t} className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-brand-turquoise shrink-0 mt-0.5" strokeWidth={2.5} /> {t}</li>
                ))}
              </ul>
            </div>
          )
        )}
      </BottomSheet>
    </>
  )
}

/* ---------- Lounge access & Carbon offset (per-trip services) ---------- */

export function TripService({ kind }: { kind: 'lounge' | 'offset' }) {
  const { upcomingTrips, miles, dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const trips = upcomingTrips.filter((t) => t.status !== 'cancelled')
  const [tripId, setTripId] = useState<string | null>(trips[0]?.id ?? null)
  const trip = trips.find((t) => t.id === tripId)
  const applied = trip ? (kind === 'lounge' ? trip.addOns?.includes('lounge') : trip.carbonOffset) : false

  const price = (t: Trip) => {
    if (kind === 'lounge') return miles.tier.name === 'Gold' || miles.tier.name === 'Platinum' ? 0 : miles.tier.name === 'Silver' ? 175000 : 250000
    const km = t.distanceKm ?? distanceKm(t.origin, t.destination)
    return Math.round((km * 15) / 1000) * 1000
  }
  const co2 = (t: Trip) => ((t.distanceKm ?? distanceKm(t.origin, t.destination)) * 0.115 / 1000).toFixed(2)

  const apply = () => {
    if (!trip) return
    const p = price(trip)
    if (kind === 'lounge') {
      dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { addOns: [...(trip.addOns ?? []), 'lounge'] } })
      dispatch({ type: 'ADD_PURCHASE', purchase: { id: `pu-${Date.now()}`, kind: 'lounge', title: `Lounge access · ${trip.flightNumber}`, detail: `Garuda Indonesia Lounge · ${trip.terminal} · ${miles.tier.name} rate`, price: p, date: todayISO(), status: 'confirmed' } })
      toast(`Lounge access added to ${trip.flightNumber}`)
    } else {
      dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { carbonOffset: true } })
      dispatch({ type: 'ADD_PURCHASE', purchase: { id: `pu-${Date.now()}`, kind: 'offset', title: `Carbon offset · ${trip.flightNumber}`, detail: `${co2(trip)} t CO₂ · Mangrove restoration, East Kalimantan`, price: p, date: todayISO(), status: 'confirmed' } })
      toast(`Thank you · ${co2(trip)} t CO₂ offset for ${trip.flightNumber}`)
    }
  }

  if (trips.length === 0) return <EmptyState mascot="think" title="No upcoming flights" description={kind === 'lounge' ? 'Lounge access can be added to any upcoming booking.' : 'Offset the emissions of an upcoming flight.'} compact action={<Button onClick={() => navigate('/book')}>Search flights</Button>} />

  return (
    <section className="card p-4 space-y-4">
      <TripPicker trips={trips} value={tripId} onChange={setTripId} label={(t) => (kind === 'lounge' ? (t.addOns?.includes('lounge') ? 'Lounge access added' : `${price(t) === 0 ? 'Complimentary' : formatRupiah(price(t))} · ${miles.tier.name} rate`) : t.carbonOffset ? 'Already offset' : `${co2(t)} t CO₂ · ${formatRupiah(price(t))}`)} />
      {trip && (
        applied ? (
          <div className="rounded-xl bg-success-soft text-success px-3.5 py-3 text-[13px] font-semibold inline-flex items-center gap-2 w-full">
            {kind === 'lounge' ? <Sofa className="h-4 w-4" /> : <Leaf className="h-4 w-4" />}
            {kind === 'lounge' ? `Lounge access is active on ${trip.flightNumber}. Show your boarding pass at reception.` : `${trip.flightNumber} is carbon-neutral. Thank you.`}
          </div>
        ) : (
          <Button full size="lg" onClick={apply} leftIcon={kind === 'lounge' ? <Sofa className="h-4 w-4" /> : <Leaf className="h-4 w-4" />}>
            {kind === 'lounge' ? `Add lounge access${price(trip) === 0 ? ' · complimentary' : ` · ${formatRupiah(price(trip))}`}` : `Offset ${co2(trip)} t CO₂ · ${formatRupiah(price(trip))}`}
          </Button>
        )
      )}
    </section>
  )
}
