import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Armchair,
  ArrowRight,
  Award,
  CalendarPlus,
  ClipboardList,
  Clock,
  Copy,
  Headphones,
  Leaf,
  Luggage,
  MessageCircle,
  Plane,
  QrCode,
  Radar,
  Route,
  Share2,
  ShieldCheck,
  Sofa,
  Sparkles,
  TicketCheck,
  User,
  UtensilsCrossed,
} from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, InfoRow } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { IconTile } from '../components/common/ListRow'
import { StatusBadge, Pill } from '../components/common/StatusBadge'
import { ErrorState, OfflineBanner, SkeletonCard } from '../components/common/States'
import { MascotBanner } from '../components/common/Mascot'
import { JourneyTimeline } from '../components/journey/JourneyTimeline'
import { WhatsAppPreview } from '../components/journey/WhatsAppPreview'
import { RouteLine } from '../components/trips/TripCard'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { useOnline } from '../hooks/useOnline'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading'
import { nextActionFor, STAGES } from '../data/trips'
import { FARE_FAMILIES } from '../data/flights'
import { cityOf, getAirport } from '../data/airports'
import { daysLabel, daysUntil, formatLongDate, formatNumber, formatRupiah } from '../utils/format'
import { DestinationInfoCard } from '../components/journey/DestinationCard'
import { downloadTripICS, itineraryText } from '../utils/ics'
import { shareText } from '../utils/share'

const EXTRA_LABELS: Record<string, { label: string; icon: typeof Luggage }> = {
  baggage10: { label: 'Extra baggage +10 kg', icon: Luggage },
  priority: { label: 'Priority boarding', icon: Sparkles },
  insurance: { label: 'Travel protection', icon: ShieldCheck },
  lounge: { label: 'Lounge access · Terminal 3', icon: Sofa },
  'preferred-seat': { label: 'Preferred seat voucher', icon: Armchair },
  wifi: { label: 'In-flight Wi-Fi pass', icon: Sparkles },
}

export function TripDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getTrip, isMember, miles } = useApp()
  const online = useOnline()
  const trip = getTrip(id)
  const loading = useSimulatedLoading(500, [id])
  const [wa, setWa] = useState(false)

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/trips" title="Trip" />
        <PageContainer className="py-4 space-y-3">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={3} />
        </PageContainer>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/trips" title="Trip" />
        <PageContainer className="py-6">
          <ErrorState
            title="Unable to load your trip."
            description={isMember ? 'This booking could not be found. It may have been removed from your account.' : 'Sign in to view your journeys, or add a trip with your booking code.'}
            onRetry={() => navigate('/trips')}
          />
        </PageContainer>
      </div>
    )
  }

  const next = nextActionFor(trip)
  const dep = trip.disruption ? trip.disruption.newDepartTime : trip.departTime
  const arr = trip.disruption ? trip.disruption.newArriveTime : trip.arriveTime
  const boarding = trip.disruption ? trip.disruption.newBoardingTime : trip.boardingTime
  const fare = FARE_FAMILIES.find((f) => f.id === trip.fare)
  const isPast = trip.category !== 'upcoming'
  const stageLabel = STAGES.find((s) => s.id === trip.stage)?.label

  const actions = [
    {
      icon: TicketCheck,
      label: trip.checkedIn ? 'Checked In' : 'Check In',
      sublabel: trip.checkedIn ? 'Done' : trip.checkInOpen ? undefined : 'Opens 24h before',
      to: `/checkin/${trip.id}`,
      disabled: isPast || trip.checkedIn || !trip.checkInOpen,
    },
    { icon: Armchair, label: 'Change Seat', to: `/seat/${trip.id}`, disabled: isPast },
    { icon: ClipboardList, label: 'Manage', to: `/manage/${trip.id}`, disabled: trip.status === 'cancelled' },
    { icon: Radar, label: 'Flight Status', to: '/flight-status' },
    { icon: Headphones, label: 'Get Help', to: '/help' },
  ]

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <div className="card-navy rounded-none rounded-b-[28px] safe-top relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" aria-hidden />
        <AppHeader tone="navy" back="/trips" sticky={false} className="bg-transparent" title={<span className="text-[13px] font-semibold text-white/80">{trip.flightNumber} · {formatLongDate(trip.date)}</span>} right={<StatusBadge status={trip.status} className="bg-white/15 text-white mr-1" />} />
        <div className="px-5 pb-5">
          <RouteLine origin={trip.origin} destination={trip.destination} tone="navy" size="lg" />
          <div className="flex items-center justify-between text-[12px] text-white/70 -mt-0.5">
            <span>{getAirport(trip.origin).city}</span>
            <span>{trip.destination === 'DPS' ? 'Bali' : getAirport(trip.destination).city}</span>
          </div>
          <div className="mt-4 flex items-center gap-3 text-[13px] flex-wrap">
            <span className="rounded-lg bg-white/10 px-2.5 py-1.5 font-semibold tabular-nums">
              {dep} – {arr}
            </span>
            {!isPast && trip.status !== 'cancelled' && <span className="rounded-lg bg-brand-turquoise/30 text-white px-2.5 py-1.5 font-semibold">{daysLabel(daysUntil(trip.date))}</span>}
            <span className="text-white/75">{trip.terminal}</span>
            <span className="text-white/75">Gate {trip.gate}</span>
            {trip.seat && <span className="text-white/75">Seat {trip.seat}</span>}
          </div>
          {trip.status !== 'cancelled' && (
            <div className="mt-5">
              <JourneyTimeline stage={trip.stage} tone="navy" />
            </div>
          )}
        </div>
      </div>

      <PageContainer className="py-4 space-y-4">
        {!online && <OfflineBanner />}

        {trip.disruption && (
          <button type="button" onClick={() => navigate(`/flight-update/${trip.id}`)} className="w-full flex items-center gap-3 rounded-2xl bg-warning-soft border border-warning/30 p-3.5 text-left press">
            <span className="h-10 w-10 rounded-xl bg-white text-warning flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13.5px] font-bold text-ink">
                {trip.disruption.type === 'gate-change' ? `Gate changed to ${trip.disruption.newGate}` : `Delayed ${trip.disruption.delayMin} minutes`} · updated automatically
              </span>
              <span className="block text-[12px] text-ink-soft">
                {trip.disruption.type === 'gate-change' ? `Previously Gate ${trip.disruption.previousGate} · boarding ${trip.boardingTime} unchanged` : `New departure ${trip.disruption.newDepartTime} · boarding ${trip.disruption.newBoardingTime}`}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-ink-muted" />
          </button>
        )}

        {trip.status === 'cancelled' ? (
          <section className="card p-4 flex items-start gap-3">
            <span className="h-10 w-10 rounded-xl bg-error-soft text-error flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-ink">This booking was cancelled</p>
              <p className="text-[12.5px] text-ink-muted mt-0.5">Refund of the eligible amount is being processed to the original payment method.</p>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => navigate('/more/refund-request')}>
                Track refund
              </Button>
            </div>
          </section>
        ) : (
          <section className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="t-label text-brand-turquoise">{isPast ? 'Journey complete' : 'Next step'}</span>
              <Pill tone="neutral">
                <Clock className="h-3 w-3" /> {stageLabel}
              </Pill>
            </div>
            <p className="text-[16px] font-bold text-ink leading-snug">{next.title}</p>
            <p className="text-[13px] text-ink-muted mt-1 leading-snug">{next.description}</p>
            <div className="mt-3 flex gap-2">
              {next.cta && !isPast && (
                <Button full onClick={() => navigate(next.cta!.to)} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  {next.cta.label}
                </Button>
              )}
              <Button variant="secondary" full leftIcon={<Route className="h-4 w-4" />} onClick={() => navigate(`/trips/${trip.id}/companion`)}>
                Journey Companion
              </Button>
            </div>
          </section>
        )}

        <section className="card px-1 py-3">
          <div className="grid grid-cols-5">
            {actions.map((a) => (
              <IconTile key={a.label} icon={a.icon} label={a.label} sublabel={a.sublabel} to={a.to} disabled={a.disabled} onClick={a.disabled ? () => toast(a.sublabel ? `${a.label}: ${a.sublabel.toLowerCase()}` : 'Not available for this trip', 'info') : undefined} />
            ))}
          </div>
        </section>

        {trip.checkedIn && !isPast && (
          <button type="button" onClick={() => navigate(`/boarding-pass/${trip.id}`)} className="w-full card-navy p-4 flex items-center gap-3 text-left press">
            <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-brand-turquoise-light" />
            </span>
            <span className="flex-1">
              <span className="block text-[14px] font-bold">Boarding pass ready</span>
              <span className="block text-[12px] text-white/70">
                Seat {trip.seat} · Gate {trip.gate} · Boarding {boarding}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-white/70" />
          </button>
        )}

        <section className="card">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
            <Plane className="h-4 w-4 text-brand-turquoise" /> Flight
          </div>
          <div className="px-4 pb-2 divide-y divide-surface-line">
            <InfoRow label="Date" value={formatLongDate(trip.date)} />
            <InfoRow
              label="Departure"
              value={
                <>
                  {dep !== trip.departTime && <span className="line-through text-ink-faint font-normal mr-1.5">{trip.departTime}</span>}
                  {dep} · {cityOf(trip.origin)} ({trip.origin})
                </>
              }
            />
            <InfoRow label="Arrival" value={`${arr} · ${cityOf(trip.destination)} (${trip.destination})`} />
            <InfoRow label="Terminal" value={`${trip.terminal} → ${trip.arrivalTerminal}`} />
            <InfoRow label="Gate" value={trip.gate} />
            <InfoRow label="Boarding" value={`${boarding} · Zone ${trip.zone}`} />
            <InfoRow label="Seat" value={trip.seat ?? 'Select at check-in'} />
            <InfoRow label="Aircraft" value={trip.aircraft} />
            <InfoRow label="Fare" value={fare?.name ?? 'Economy'} />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <section className="card p-4">
            <User className="h-5 w-5 text-brand-navy" />
            <p className="t-label mt-3">Passenger</p>
            <p className="text-[14px] font-semibold text-ink mt-1">{trip.passengerName}</p>
            <p className="text-[11.5px] text-ink-muted">GarudaMiles {miles.tier.name}{trip.passengerCount && trip.passengerCount > 1 ? ` · ${trip.passengerCount} travellers` : ''}</p>
          </section>
          <section className="card p-4">
            <Luggage className="h-5 w-5 text-brand-navy" />
            <p className="t-label mt-3">Baggage</p>
            <p className="text-[14px] font-semibold text-ink mt-1">1 checked bag</p>
            <p className="text-[11.5px] text-ink-muted">{trip.baggageChecked} allowance · {trip.baggageCabin} cabin</p>
          </section>
          <section className="card p-4">
            <UtensilsCrossed className="h-5 w-5 text-brand-navy" />
            <p className="t-label mt-3">Meal</p>
            <p className="text-[14px] font-semibold text-ink mt-1">{trip.meal}</p>
            <p className="text-[11.5px] text-ink-muted">Complimentary on board</p>
          </section>
          <section className="card p-4">
            <Award className="h-5 w-5 text-brand-navy" />
            <p className="t-label mt-3">GarudaMiles</p>
            <p className="text-[14px] font-semibold text-ink mt-1">{formatNumber(trip.milesEstimate)} miles</p>
            <p className="text-[11.5px] text-ink-muted">{isPast ? 'Credited' : 'Estimated earning'}</p>
          </section>
        </div>

        {((trip.addOns && trip.addOns.length > 0) || trip.carbonOffset || trip.upgradeBid) && (
          <section className="card">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-[14px] font-bold text-ink">
              <Sparkles className="h-4 w-4 text-brand-gold" /> Extras on this booking
            </div>
            <ul className="px-4 pb-3 divide-y divide-surface-line">
              {(trip.addOns ?? []).map((a) => {
                const meta = EXTRA_LABELS[a] ?? { label: a, icon: Sparkles }
                return (
                  <li key={a} className="py-2.5 flex items-center gap-3 text-[13px]">
                    <meta.icon className="h-4 w-4 text-brand-turquoise" />
                    <span className="flex-1 text-ink">{meta.label}</span>
                    <span className="text-[11px] font-semibold text-success">Confirmed</span>
                  </li>
                )
              })}
              {trip.carbonOffset && (
                <li className="py-2.5 flex items-center gap-3 text-[13px]">
                  <Leaf className="h-4 w-4 text-success" />
                  <span className="flex-1 text-ink">Carbon offset · verified project</span>
                  <span className="text-[11px] font-semibold text-success">Offset</span>
                </li>
              )}
              {trip.upgradeBid && (
                <li className="py-2.5 flex items-center gap-3 text-[13px]">
                  <Award className="h-4 w-4 text-brand-gold" />
                  <span className="flex-1 text-ink">BidUpgrade · {formatRupiah(trip.upgradeBid)}</span>
                  <span className="text-[11px] font-semibold text-warning">Pending · 48h before</span>
                </li>
              )}
            </ul>
          </section>
        )}

        {!isPast && <DestinationInfoCard trip={trip} compact />}

        {!isPast && trip.status !== 'cancelled' && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" leftIcon={<CalendarPlus className="h-4 w-4" />} onClick={() => { downloadTripICS(trip); toast('Calendar event downloaded (.ics)') }}>
              Add to Calendar
            </Button>
            <Button
              variant="secondary"
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
        )}

        {!isPast && (
          <MascotBanner
            mascot="respect"
            tone="white"
            title="Journey updates on WhatsApp"
            description="Reminders and gate changes sent proactively to your phone."
            action={
              <Button size="sm" variant="secondary" leftIcon={<MessageCircle className="h-4 w-4" />} onClick={() => setWa(true)}>
                Preview
              </Button>
            }
          />
        )}

        <section className="card p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="t-label">Booking code</p>
            <p className="font-mono text-[20px] font-bold tracking-[0.18em] text-ink mt-0.5">{trip.bookingCode}</p>
            <p className="text-[11.5px] text-ink-muted">Ticket 126-2400{trip.sequence}981</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Copy className="h-4 w-4" />}
            onClick={() => {
              navigator.clipboard?.writeText(trip.bookingCode).catch(() => undefined)
              toast('Booking code copied')
            }}
          >
            Copy
          </Button>
        </section>
      </PageContainer>
      <WhatsAppPreview open={wa} onClose={() => setWa(false)} trip={trip} />
    </div>
  )
}
