import { useNavigate, useParams } from 'react-router-dom'
import { BellRing, CalendarPlus, Check, MapPin, Share2, TicketCheck } from 'lucide-react'
import { PageContainer, StickyCTA } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Mascot } from '../components/common/Mascot'
import { EmptyState } from '../components/common/States'
import { RouteLine } from '../components/trips/TripCard'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { formatLongDate, formatRupiah } from '../utils/format'
import { cityOf } from '../data/airports'
import { downloadTripICS, itineraryText } from '../utils/ics'
import { shareText } from '../utils/share'

export function ConfirmationPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getTrip } = useApp()
  const trip = getTrip(tripId)

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <EmptyState mascot="think" title="Booking not found" description="We could not find this booking." action={<Button onClick={() => navigate('/trips')}>Go to Trips</Button>} />
      </div>
    )
  }

  const next = [
    trip.checkInOpen
      ? { icon: TicketCheck, title: 'Check-in is open now', body: 'Confirm your details and choose a seat from My Trip' }
      : { icon: TicketCheck, title: 'Check-in opens', body: `24 hours before departure · ${trip.departTime} on the day before` },
    { icon: MapPin, title: 'Airport reminder', body: 'Recommended arrival time based on live traffic to ' + trip.terminal },
    { icon: BellRing, title: 'Boarding notification', body: 'Gate, boarding time and walking distance sent to you' },
  ]

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="card-navy rounded-none rounded-b-[32px] safe-top px-5 pt-8 pb-8 relative overflow-hidden text-center">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/5" aria-hidden />
        <div className="absolute right-6 top-8 h-20 w-20 rounded-full bg-brand-turquoise/25 blur-2xl" aria-hidden />
        <div className="mx-auto h-16 w-16 rounded-full bg-brand-turquoise text-white flex items-center justify-center animate-check-pop shadow-float">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h1 className="text-[26px] font-bold mt-4 leading-tight">Your journey is ready.</h1>
        <p className="text-white/75 text-[13.5px] mt-1.5">Booking confirmed. Your e-ticket has been sent to your email.</p>
        <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/10 border border-white/15 px-5 py-3">
          <span className="text-[11px] uppercase tracking-[0.12em] text-white/70">Booking code</span>
          <span className="font-mono text-[22px] font-bold tracking-[0.2em]">{trip.bookingCode}</span>
        </div>
      </div>

      <PageContainer className="py-5 space-y-5">
        <section className="card p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-[12px] text-ink-muted mb-2">
            <span className="font-semibold text-ink">{trip.flightNumber}</span>
            <span>{formatLongDate(trip.date)}</span>
          </div>
          <RouteLine origin={trip.origin} destination={trip.destination} />
          <div className="flex items-center justify-between text-[12px] text-ink-muted mt-0.5">
            <span>
              {cityOf(trip.origin)} · <span className="font-semibold text-ink">{trip.departTime}</span>
            </span>
            <span>
              {trip.destination === 'DPS' ? 'Bali' : cityOf(trip.destination)} · <span className="font-semibold text-ink">{trip.arriveTime}</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-line grid grid-cols-3 text-[12px]">
            <div>
              <p className="text-ink-muted">Passenger</p>
              <p className="font-semibold text-ink truncate">{trip.passengerName}</p>
            </div>
            <div>
              <p className="text-ink-muted">Seat</p>
              <p className="font-semibold text-ink">{trip.seat ?? 'At check-in'}</p>
            </div>
            <div className="text-right">
              <p className="text-ink-muted">Paid</p>
              <p className="font-semibold text-ink">{trip.totalPaid ? formatRupiah(trip.totalPaid) : '—'}</p>
            </div>
          </div>
        </section>

        <div className="flex gap-2">
          <Button variant="secondary" full leftIcon={<CalendarPlus className="h-4 w-4" />} onClick={() => { downloadTripICS(trip); toast('Calendar event downloaded (.ics) · open it to add') }}>
            Add to Calendar
          </Button>
          <Button
            variant="secondary"
            full
            leftIcon={<Share2 className="h-4 w-4" />}
            onClick={async () => {
              const r = await shareText({ title: `${trip.flightNumber} · ${trip.origin} → ${trip.destination}`, text: itineraryText(trip) })
              if (r === 'shared') toast('Itinerary shared')
              else if (r === 'copied') toast('Itinerary copied to clipboard')
              else if (r === 'failed') toast('Could not share on this device', 'warning')
            }}
          >
            Share Itinerary
          </Button>
        </div>

        <section className="rounded-2xl bg-surface-off border border-surface-line p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="t-label text-brand-turquoise">Journey Companion</p>
              <h2 className="t-h2 mt-1">What happens next</h2>
              <p className="t-caption mt-0.5">We will guide you step by step until you land.</p>
            </div>
            <Mascot name="love" size={80} />
          </div>
          <ol className="mt-4 space-y-3">
            {next.map((n, i) => (
              <li key={n.title} className="flex items-start gap-3">
                <span className="relative h-9 w-9 rounded-full bg-white border border-surface-line text-brand-navy flex items-center justify-center shrink-0">
                  <n.icon className="h-4 w-4" />
                  <span className="absolute -top-1.5 -left-1.5 h-[18px] w-[18px] min-h-[18px] min-w-[18px] rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold text-ink">{n.title}</span>
                  <span className="block text-[12px] text-ink-muted leading-snug">{n.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </PageContainer>

      <StickyCTA>
        <Button size="lg" full onClick={() => navigate(`/trips/${trip.id}`, { replace: true })}>
          View My Trip
        </Button>
      </StickyCTA>
    </div>
  )
}
