import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CalendarClock, Check, Headphones, HelpCircle, MessageCircle, RefreshCw, Route, Sofa, Undo2 } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, StickyCTA } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { ListRow } from '../components/common/ListRow'
import { BottomSheet } from '../components/common/Overlays'
import { EmptyState } from '../components/common/States'
import { Mascot } from '../components/common/Mascot'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { cityOf } from '../data/airports'

export function FlightUpdatePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getTrip, dispatch } = useApp()
  const trip = getTrip(id)
  const [options, setOptions] = useState(false)

  if (!trip || !trip.disruption) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/trips" title="Flight update" />
        <EmptyState mascot="chill" title="No updates for this flight" description="Everything is running as planned. We will notify you the moment anything changes." action={<Button onClick={() => navigate(trip ? `/trips/${trip.id}` : '/trips')}>Back to trip</Button>} />
      </div>
    )
  }

  const d = trip.disruption
  const gateChange = d.type === 'gate-change'
  const changes = [
    { label: 'Departure', from: trip.departTime, to: d.newDepartTime },
    { label: 'Boarding', from: trip.boardingTime, to: d.newBoardingTime },
    { label: 'Arrival', from: trip.arriveTime, to: d.newArriveTime },
    { label: 'Gate', from: d.previousGate ?? trip.gate, to: trip.gate },
  ]
  const headline = gateChange ? `${trip.flightNumber} now boards from Gate ${d.newGate}.` : `${trip.flightNumber} is delayed by ${d.delayMin} minutes.`
  const whatHappened = gateChange
    ? `${d.reason}. Gate ${d.newGate} is in the same pier, about a 4-minute walk from Gate ${d.previousGate}.`
    : `${d.reason}. The aircraft is now on the ground at ${cityOf(trip.origin)} and being prepared for departure.`
  const todo = gateChange
    ? [`Head to Gate ${d.newGate} instead of Gate ${d.previousGate} — follow signs for Gates 10 – 16.`, `Boarding still begins at ${trip.boardingTime}. No need to rush.`, 'Your boarding pass updates itself. Nothing to reissue.']
    : [`Arrive at ${trip.terminal} by 06:50 instead of 06:15 — no need to rush.`, `Be at Gate ${trip.gate} by ${d.newBoardingTime} for boarding.`, 'Your boarding pass updates itself. Nothing to reissue.']

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <div className="bg-white safe-top">
        <AppHeader back={`/trips/${trip.id}`} title="Flight update" sticky={false} className="border-b-0" />
        <div className="px-5 pb-6 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft text-warning text-[11px] font-bold uppercase tracking-[0.08em] px-2.5 py-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Flight update
            </span>
            <h1 className="t-display mt-3">{headline}</h1>
            <p className="t-body mt-2">Your trip has been updated automatically. Your seat, baggage and boarding pass remain valid.</p>
          </div>
          <Mascot name="respect" size={96} className="shrink-0 -mr-2" />
        </div>
      </div>

      <PageContainer className="py-4 space-y-4">
        <section className="card p-4">
          <p className="t-label mb-2">What happened</p>
          <p className="text-[14px] text-ink leading-snug">{whatHappened}</p>
          <p className="text-[11.5px] text-ink-faint mt-2">Issued {d.issuedAt} · Garuda Operations Control</p>
        </section>

        <section className="card overflow-hidden">
          <p className="t-label px-4 pt-4 pb-2">What changes</p>
          <div className="divide-y divide-surface-line">
            {changes.map((c) => {
              const changed = c.from !== c.to
              return (
                <div key={c.label} className="px-4 py-3 flex items-center gap-3 text-[13px]">
                  <span className="w-20 text-ink-muted">{c.label}</span>
                  <span className={changed ? 'line-through text-ink-faint' : 'text-ink-soft'}>{c.from}</span>
                  {changed ? (
                    <>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
                      <span className="font-bold text-ink">{c.to}</span>
                      <span className="ml-auto text-[11px] font-semibold text-warning">{c.label === 'Gate' ? 'Changed' : `+${d.delayMin} min`}</span>
                    </>
                  ) : (
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                      <Check className="h-3 w-3" /> Unchanged
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="card-navy p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-turquoise-light mb-2">What you should do</p>
          <ul className="space-y-2.5">
            {todo.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-snug">
                <span className="h-5 w-5 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <p className="text-[11.5px] text-white/60 mt-3">Premium means worrying less. We keep you informed at every step.</p>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" leftIcon={<HelpCircle className="h-4 w-4" />} onClick={() => setOptions(true)}>
            See Options
          </Button>
          <Button variant="secondary" leftIcon={<Headphones className="h-4 w-4" />} onClick={() => navigate('/help')}>
            Contact Support
          </Button>
        </div>

        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'CLEAR_DISRUPTION', id: trip.id })
            toast('Flight update cleared · back on schedule', 'info')
            navigate(`/trips/${trip.id}`, { replace: true })
          }}
          className="w-full rounded-xl border border-dashed border-ink-faint/40 px-4 py-3 flex items-center gap-3 text-left text-ink-muted hover:bg-white"
        >
          <Undo2 className="h-4 w-4 shrink-0" />
          <span className="text-[12px] leading-snug">
            <span className="font-semibold text-ink-soft">Prototype:</span> clear this update and return the flight to schedule.
          </span>
        </button>
      </PageContainer>

      <StickyCTA>
        <Button size="lg" full onClick={() => navigate(`/trips/${trip.id}/companion`)} leftIcon={<Route className="h-4 w-4" />}>
          View Updated Journey
        </Button>
      </StickyCTA>

      <BottomSheet open={options} onClose={() => setOptions(false)} title="Your options" subtitle={gateChange ? 'A gate change does not affect your booking. Here is what you can still do.' : 'Because this delay is under 2 hours, your flight remains the best option.'}>
        <div className="card divide-y divide-surface-line overflow-hidden mb-2">
          <ListRow icon={RefreshCw} title="Keep this flight" description={`Departs ${d.newDepartTime} from Gate ${trip.gate} · recommended`} onClick={() => { setOptions(false); toast('You are all set on ' + trip.flightNumber) }} badge="Recommended" />
          <ListRow icon={CalendarClock} title="Move to a later flight" description="Free of charge during a disruption" onClick={() => { setOptions(false); dispatch({ type: 'SET_SEARCH', search: { origin: trip.origin, destination: trip.destination, departDate: trip.date, tripType: 'oneway' } }); navigate('/search-results') }} />
          <ListRow icon={Sofa} title="Lounge access while you wait" description="Complimentary for delays over 2 hours · discounted today" onClick={() => { setOptions(false); toast('Lounge voucher added to your trip') }} />
          <ListRow icon={MessageCircle} title="Chat with Garuda" description="Average reply time 2 minutes" onClick={() => { setOptions(false); navigate('/help') }} />
        </div>
      </BottomSheet>
    </div>
  )
}
