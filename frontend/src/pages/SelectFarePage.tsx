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
import type { FareId } from '../types'

export function SelectFarePage() {
  const { flightId = '' } = useParams()
  const navigate = useNavigate()
  const { state, dispatch, user, isMember } = useApp()
  const flight = findFlight(flightId)
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

  const adults = state.search.passengers.adults + state.search.passengers.children
  const price = flight.prices[fare]
  const total = price * Math.max(1, adults)

  const continueToCheckout = () => {
    dispatch({
      type: 'SET_DRAFT',
      draft: {
        flightId: flight.id,
        fareId: fare,
        passenger: isMember
          ? { title: 'Mr', firstName: 'Raka', lastName: 'Wijaya', email: user.email, phone: user.phone, milesId: user.milesId }
          : { title: 'Mr', firstName: '', lastName: '', email: '', phone: '' },
        seat: null,
        addOns: [],
        paymentMethod: null,
      },
    })
    navigate('/checkout')
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back title="Select fare" subtitle={`${flight.number} · ${formatMediumDate(state.search.departDate)}`} />
      <PageContainer className="py-4 space-y-4">
        <section className="card p-4">
          <div className="flex items-center justify-between text-[12px] text-ink-muted mb-2">
            <span className="font-semibold text-ink">{flight.number}</span>
            <span>{flight.aircraft}</span>
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
              <span className="text-success font-semibold">Direct</span>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-bold text-ink leading-none">{flight.arriveTime}</p>
              <p className="text-[12px] text-ink-muted mt-1">
                {getAirport(flight.destination).city} ({flight.destination})
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setValue(true)} className="mt-3 w-full flex items-center gap-2 rounded-xl bg-brand-turquoise-soft px-3 py-2.5 text-[12.5px] text-brand-turquoise font-semibold">
            <Info className="h-4 w-4" />
            Every fare below includes baggage, meal, entertainment and miles
            <ArrowRight className="h-4 w-4 ml-auto" />
          </button>
        </section>

        <div>
          <h2 className="t-h2 mb-1">Choose your fare</h2>
          <p className="t-caption mb-3">Fare families are prototype concepts. Prices per adult.</p>
          <div className="space-y-3">
            {FARE_FAMILIES.map((f) => (
              <FareCard key={f.id} fare={f} price={flight.prices[f.id]} selected={fare === f.id} onSelect={() => setFare(f.id)} recommended={f.id === 'value'} />
            ))}
          </div>
        </div>
      </PageContainer>

      <StickyCTA>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-ink-muted">Total for {Math.max(1, adults)} passenger{adults > 1 ? 's' : ''}</p>
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
