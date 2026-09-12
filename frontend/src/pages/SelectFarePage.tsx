import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Clock, Info } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, StickyCTA } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { FareCard } from '../components/booking/FareCard'
import { ValueBreakdownSheet } from '../components/booking/ValueCard'
import { EmptyState } from '../components/common/States'
import { FARE_FAMILIES, findFlight } from '../data/flights'
import { getAirport } from '../data/airports'
import { useApp } from '../store/AppContext'
import { formatDuration, formatMediumDate, formatRupiah } from '../utils/format'
import type { DraftPassenger, FareId, Flight } from '../types'

function LegSummary({ flight, label, date }: { flight: Flight; label?: string; date: string }) {
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between text-[12px] text-ink-muted mb-2">
        <span className="font-semibold text-ink">
          {label && <span className="mr-2 rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">{label}</span>}
          {flight.number}
        </span>
        <span>{formatMediumDate(date)}</span>
      </div>
      <div className="flex items-center gap-3">
        <div>
          <p className="text-[22px] font-bold text-ink leading-none">{flight.departTime}</p>
          <p className="text-[12px] text-ink-muted mt-1">
            {getAirport(flight.origin).city} ({flight.origin})
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatDuration(flight.durationMin)}
          </span>
          <span className="w-full h-[2px] bg-surface-line rounded-full my-1" />
          <span className="text-success font-semibold">Direct · {flight.aircraft}</span>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-bold text-ink leading-none">{flight.arriveTime}</p>
          <p className="text-[12px] text-ink-muted mt-1">
            {getAirport(flight.destination).city} ({flight.destination})
          </p>
        </div>
      </div>
    </section>
  )
}

export function SelectFarePage() {
  const { flightId = '' } = useParams()
  const navigate = useNavigate()
  const { state, dispatch, user, isMember } = useApp()
  const s = state.search
  const flight = findFlight(flightId)
  const outbound = s.tripType === 'round' && s.outboundFlightId && s.outboundFlightId !== flightId ? findFlight(s.outboundFlightId) : undefined
  const legs = [outbound, flight].filter((f): f is Flight => Boolean(f))
  const [fare, setFare] = useState<FareId>('value')
  const [value, setValue] = useState(false)

  if (!flight) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/book" title="Select fare" />
        <EmptyState mascot="think" title="Flight not found" description="This flight is no longer available. Please search again." action={<Button onClick={() => navigate('/book')}>Search flights</Button>} />
      </div>
    )
  }

  const paying = Math.max(1, s.passengers.adults + s.passengers.children)
  const priceFor = (id: FareId) => legs.reduce((sum, f) => sum + f.prices[id], 0)
  const total = priceFor(fare) * paying

  const continueToCheckout = () => {
    const passengers: DraftPassenger[] = []
    for (let i = 0; i < s.passengers.adults; i++) {
      passengers.push(
        i === 0 && isMember
          ? { id: 'a1', type: 'adult', title: 'Mr', firstName: user.firstName, lastName: 'Wijaya', milesId: user.milesId }
          : { id: `a${i + 1}`, type: 'adult', title: 'Mr', firstName: '', lastName: '' },
      )
    }
    for (let i = 0; i < s.passengers.children; i++) passengers.push({ id: `c${i + 1}`, type: 'child', title: 'Miss', firstName: '', lastName: '' })
    for (let i = 0; i < s.passengers.infants; i++) passengers.push({ id: `i${i + 1}`, type: 'infant', title: 'Miss', firstName: '', lastName: '' })
    dispatch({
      type: 'SET_DRAFT',
      draft: {
        legIds: legs.map((f) => f.id),
        fareId: fare,
        passengers,
        contact: isMember ? { email: user.email, phone: user.phone } : { email: '', phone: '' },
        seat: null,
        addOns: [],
        paymentMethod: null,
      },
    })
    navigate('/checkout')
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back title="Select fare" subtitle={legs.length > 1 ? `Round trip · ${legs.map((l) => l.number).join(' + ')}` : `${flight.number} · ${formatMediumDate(s.departDate)}`} />
      <PageContainer className="py-4 space-y-4">
        {legs.length > 1 ? (
          <>
            <LegSummary flight={legs[0]} label="Outbound" date={s.departDate} />
            <LegSummary flight={legs[1]} label="Return" date={s.returnDate} />
          </>
        ) : (
          <LegSummary flight={flight} date={s.departDate} />
        )}

        <button type="button" onClick={() => setValue(true)} className="w-full flex items-center gap-2 rounded-xl bg-brand-turquoise-soft px-3.5 py-3 text-[12.5px] text-brand-turquoise font-semibold text-left">
          <Info className="h-4 w-4 shrink-0" />
          Every fare below includes baggage, meal, entertainment and miles
          <ArrowRight className="h-4 w-4 ml-auto shrink-0" />
        </button>

        <div>
          <h2 className="t-h2 mb-1">Choose your fare</h2>
          <p className="t-caption mb-3">{legs.length > 1 ? 'Fare applies to both flights. ' : ''}Fare families are prototype concepts. Prices per adult.</p>
          <div className="space-y-3">
            {FARE_FAMILIES.map((f) => (
              <FareCard key={f.id} fare={f} price={priceFor(f.id)} selected={fare === f.id} onSelect={() => setFare(f.id)} recommended={f.id === 'value'} />
            ))}
          </div>
        </div>
      </PageContainer>

      <StickyCTA>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-ink-muted">
            Total for {paying} passenger{paying > 1 ? 's' : ''}
            {legs.length > 1 ? ' · round trip' : ''}
          </p>
          <p className="text-[18px] font-bold text-brand-navy leading-tight">{formatRupiah(total)}</p>
        </div>
        <Button size="lg" onClick={continueToCheckout} rightIcon={<ArrowRight className="h-4 w-4" />} className="px-6">
          Continue
        </Button>
      </StickyCTA>

      <ValueBreakdownSheet open={value} flight={flight} onClose={() => setValue(false)} onContinue={() => setValue(false)} />
    </div>
  )
}
