import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Car,
  ChevronRight,
  ClipboardList,
  Clock,
  Compass,
  MapPin,
  MessageCircle,
  QrCode,
  Radar,
  Tag,
  TicketCheck,
} from 'lucide-react'
import { useState } from 'react'
import { AppHeader } from '../components/common/AppHeader'
import { Avatar, PageContainer, SectionHeader } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { IconTile } from '../components/common/ListRow'
import { StatusBadge } from '../components/common/StatusBadge'
import { MascotBanner } from '../components/common/Mascot'
import { OfflineBanner, ProgressBar } from '../components/common/States'
import { DestinationCard, OfferCard } from '../components/common/Explore'
import { JourneyTimeline } from '../components/journey/JourneyTimeline'
import { CompanionCard } from '../components/journey/CompanionCard'
import { WhatsAppPreview } from '../components/journey/WhatsAppPreview'
import { RouteLine, TripMiniCard } from '../components/trips/TripCard'
import { SearchForm } from '../components/booking/SearchForm'
import { VALUE_ITEMS } from '../data/flights'
import { DESTINATIONS, OFFERS } from '../data/offers'
import { nextActionFor } from '../data/trips'
import { cityOf } from '../data/airports'
import { useApp } from '../store/AppContext'
import { useOnline } from '../hooks/useOnline'
import { daysLabel, daysUntil, formatLongDate, formatNumber, greetingForHour } from '../utils/format'
import type { Trip } from '../types'
import { cn } from '../utils/cn'

function HomeTopBar({ dark }: { dark: boolean }) {
  const { user, isMember, unreadCount } = useApp()
  const navigate = useNavigate()
  const greeting = greetingForHour(new Date().getHours())
  return (
    <AppHeader
      tone={dark ? 'navy' : 'light'}
      sticky={false}
      className={cn(dark && 'bg-transparent')}
      large
      title={
        <div className="flex items-center gap-3">
          {isMember ? (
            <button type="button" onClick={() => navigate('/profile')} aria-label="Open profile" className="press">
              <Avatar name={user.name} initials={user.initials} className={cn(dark && 'ring-white/20 bg-white text-brand-navy')} />
            </button>
          ) : (
            <img src="/brand/mark-white.png" alt="Garuda Indonesia" className="h-6 w-auto" />
          )}
          <div className="leading-tight">
            <p className={cn('text-[12px]', dark ? 'text-white/70' : 'text-ink-muted')}>{greeting},</p>
            <p className={cn('text-[17px] font-bold', dark ? 'text-white' : 'text-ink')}>{isMember ? user.firstName : 'Traveller'}</p>
          </div>
        </div>
      }
      right={
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label={`Notifications, ${unreadCount} unread`}
          className={cn('relative h-10 w-10 rounded-full flex items-center justify-center', dark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-surface-soft text-brand-navy')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-turquoise-light ring-2 ring-brand-navy" />}
        </button>
      }
    />
  )
}

function NextTripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  const next = nextActionFor(trip)
  const dep = trip.disruption ? trip.disruption.newDepartTime : trip.departTime
  const arr = trip.disruption ? trip.disruption.newArriveTime : trip.arriveTime
  return (
    <section className="card overflow-hidden" aria-label="Next trip">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="t-label text-brand-turquoise">Next trip · <span className="text-ink-muted normal-case tracking-normal font-semibold">{daysLabel(daysUntil(trip.date))}</span></span>
          <StatusBadge status={trip.status} />
        </div>
        <RouteLine origin={trip.origin} destination={trip.destination} size="lg" />
        <div className="flex items-center justify-between text-[12px] text-ink-muted mt-0.5">
          <span>{cityOf(trip.origin)}</span>
          <span className="font-semibold text-ink">{trip.flightNumber}</span>
          <span>{trip.destination === 'DPS' ? 'Bali' : cityOf(trip.destination)}</span>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-y-1 text-[13px]">
          <span className="text-ink-soft">{formatLongDate(trip.date)}</span>
          <span className="font-semibold text-ink text-right tabular-nums">
            {trip.disruption && dep !== trip.departTime && <span className="line-through text-ink-faint font-normal mr-1.5">{trip.departTime}</span>}
            {dep} – {arr}
          </span>
          <span className="text-ink-soft">{trip.terminal}</span>
          <span className="text-ink-soft text-right">
            Gate <span className="font-semibold text-ink">{trip.gate}</span>
            {trip.seat && (
              <>
                {' '}· Seat <span className="font-semibold text-ink">{trip.seat}</span>
              </>
            )}
          </span>
        </div>
      </div>
      <div className="px-4 pt-3 pb-4 border-t border-surface-line bg-surface-off/60">
        <JourneyTimeline stage={trip.stage} />
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-white border border-surface-line p-3">
          <span className="h-9 w-9 rounded-full bg-brand-turquoise-soft text-brand-turquoise flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-ink leading-snug">{next.title}</p>
            <p className="text-[12px] text-ink-muted leading-snug mt-0.5">{next.description}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button full variant="secondary" onClick={() => navigate(`/trips/${trip.id}`)}>
            View Trip
          </Button>
          {next.cta && (
            <Button full onClick={() => navigate(next.cta!.to)} rightIcon={<ArrowRight className="h-4 w-4" />}>
              {next.cta.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

function MemberHome({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  const { upcomingTrips } = useApp()
  const online = useOnline()
  const [wa, setWa] = useState(false)
  const others = upcomingTrips.filter((t) => t.id !== trip.id)

  const quick = [
    {
      icon: TicketCheck,
      label: trip.checkedIn ? 'Checked In' : 'Check In',
      sublabel: trip.checkedIn ? 'Completed' : trip.checkInOpen ? undefined : 'Opens 24h before',
      to: `/checkin/${trip.id}`,
      disabled: !trip.checkInOpen || trip.checkedIn,
    },
    { icon: QrCode, label: 'Boarding Pass', sublabel: trip.checkedIn ? undefined : 'After check-in', to: `/boarding-pass/${trip.id}`, disabled: !trip.checkedIn },
    { icon: Radar, label: 'Flight Status', to: '/flight-status' },
    { icon: ClipboardList, label: 'Manage Booking', to: `/manage/${trip.id}` },
  ]

  return (
    <>
      <div className="card-navy rounded-none rounded-b-[28px] pb-24 safe-top relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" aria-hidden />
        <div className="absolute right-10 top-24 h-24 w-24 rounded-full bg-brand-turquoise/25 blur-2xl" aria-hidden />
        <svg className="absolute inset-x-0 bottom-14 w-full h-16 text-white/20" viewBox="0 0 430 64" fill="none" aria-hidden>
          <path d="M-10 60 C 120 -10, 310 -10, 440 60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
        </svg>
        <HomeTopBar dark />
        <div className="px-4 -mt-1">
          <p className="text-[13px] text-white/75">Your journey to {trip.destination === 'DPS' ? 'Bali' : cityOf(trip.destination)} is coming up.</p>
        </div>
      </div>

      <PageContainer className="-mt-20 pb-6 space-y-6">
        {!online && <OfflineBanner />}
        {trip.disruption && (
          <button
            type="button"
            onClick={() => navigate(`/flight-update/${trip.id}`)}
            className="w-full flex items-center gap-3 rounded-2xl bg-warning-soft border border-warning/30 p-3.5 text-left press"
          >
            <span className="h-10 w-10 rounded-xl bg-white text-warning flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13.5px] font-bold text-ink">
                Flight update · {trip.disruption.type === 'gate-change' ? `gate changed to ${trip.disruption.newGate}` : `${trip.flightNumber} delayed ${trip.disruption.delayMin} min`}
              </span>
              <span className="block text-[12px] text-ink-soft">{trip.disruption.type === 'gate-change' ? `Boarding time unchanged.` : `New departure ${trip.disruption.newDepartTime}.`} Your trip has been updated automatically.</span>
            </span>
            <ChevronRight className="h-4 w-4 text-ink-muted" />
          </button>
        )}
        <NextTripCard trip={trip} />

        <section aria-label="Quick actions" className="card px-2 py-3">
          <div className="grid grid-cols-4">
            {quick.map((q) => (
              <IconTile key={q.label} icon={q.icon} label={q.label} sublabel={q.sublabel} to={q.to} disabled={q.disabled} onClick={q.disabled ? undefined : () => navigate(q.to)} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Journey Companion" subtitle="Proactive guidance for this trip" action="Open" to={`/trips/${trip.id}/companion`} />
          <div className="space-y-2.5">
            {trip.checkedIn ? (
              <CompanionCard icon={TicketCheck} tone="success" title="You are checked in" description={`Seat ${trip.seat} · Boarding pass ready in Trips.`} to={`/boarding-pass/${trip.id}`} />
            ) : trip.checkInOpen ? (
              <CompanionCard icon={TicketCheck} tone="turquoise" title="Check-in is open" description="Confirm details and pick your seat in under a minute." to={`/checkin/${trip.id}`} />
            ) : (
              <CompanionCard icon={Clock} title="Check-in opens 24 hours before departure" description="We will remind you the moment it opens." />
            )}
            <CompanionCard icon={MapPin} title={`Recommended airport arrival: ${trip.disruption ? '06:50' : '06:15'}`} description={`${trip.terminal} · Boarding ${trip.disruption ? trip.disruption.newBoardingTime : trip.boardingTime} at Gate ${trip.gate}`} to={`/trips/${trip.id}/companion`} />
            <CompanionCard icon={Car} title="Traffic to Terminal 3 is currently moderate" description="Estimated 52 minutes from your home. Leave by 05:20 to arrive comfortably." meta="Based on your saved home address" />
          </div>
        </section>

        <MascotBanner
          mascot="marketing"
          tone="white"
          title="Get journey updates on WhatsApp"
          description="Check-in reminders, gate changes and boarding calls, sent proactively."
          action={
            <Button size="sm" variant="secondary" leftIcon={<MessageCircle className="h-4 w-4" />} onClick={() => setWa(true)}>
              Preview messages
            </Button>
          }
        />

        <section className="card p-4">
          <SectionHeader title="What’s included" subtitle="Your Garuda fare covers the full journey" className="mb-3" />
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {VALUE_ITEMS.filter((v) => v.key !== 'flexible').map(({ key, title, icon: Icon }) => (
              <li key={key} className="flex items-center gap-2.5 text-[13px] text-ink-soft">
                <span className="h-8 w-8 rounded-lg bg-brand-turquoise-soft text-brand-turquoise flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                {title}
              </li>
            ))}
          </ul>
        </section>

        {others.length > 0 && (
          <section>
            <SectionHeader title="Also upcoming" action="All trips" to="/trips" />
            <div className="space-y-2.5">
              {others.map((t) => (
                <TripMiniCard key={t.id} trip={t} />
              ))}
            </div>
          </section>
        )}

        <ExploreSection />
      </PageContainer>
      <WhatsAppPreview open={wa} onClose={() => setWa(false)} trip={trip} />
    </>
  )
}

function ExploreSection() {
  const navigate = useNavigate()
  const { dispatch } = useApp()
  const goDestination = (code: (typeof DESTINATIONS)[number]['code']) => {
    dispatch({ type: 'SET_SEARCH', search: { origin: 'CGK', destination: code } })
    navigate('/book')
  }
  return (
    <section>
      <SectionHeader title="Explore Garuda" />
      <div className="card px-2 py-3 grid grid-cols-4">
        <IconTile icon={Tag} label="Special Offers" to="/offers" tone="gold" />
        <IconTile icon={Compass} label="Destinations" to="/destinations" tone="turquoise" />
        <IconTile icon={Award} label="GarudaMiles" to="/miles" tone="blue" />
        <IconTile icon={BookOpen} label="Inspiration" to="/destinations" />
      </div>
      <div className="mt-4 -mx-4 px-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {DESTINATIONS.slice(0, 5).map((d, i) => (
          <DestinationCard key={d.code} destination={d} index={i} onClick={() => goDestination(d.code)} />
        ))}
      </div>
    </section>
  )
}

function GuestHome() {
  const { isMember, miles, dispatch } = useApp()
  const navigate = useNavigate()
  const online = useOnline()
  return (
    <>
      <div className="card-navy rounded-none rounded-b-[28px] safe-top relative overflow-hidden pb-28">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" aria-hidden />
        <HomeTopBar dark />
        <div className="px-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[26px] font-bold leading-tight text-white">Where will you go next?</h2>
            <p className="text-[13px] text-white/75 mt-1.5 max-w-[220px]">Full-service journeys across Indonesia and beyond.</p>
          </div>
          <img src="/mascot/hi.png" alt="Garuda mascot waving hello" className="h-[104px] w-auto -mb-1 mr-1 drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]" />
        </div>
      </div>
      <PageContainer className="-mt-24 pb-6 space-y-6">
        {!online && <OfflineBanner />}
        <SearchForm />

        <section>
          <SectionHeader title="Popular destinations" action="See all" to="/destinations" />
          <div className="-mx-4 px-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {DESTINATIONS.slice(0, 6).map((d, i) => (
              <DestinationCard
                key={d.code}
                destination={d}
                index={i}
                onClick={() => {
                  dispatch({ type: 'SET_SEARCH', search: { origin: 'CGK', destination: d.code } })
                  navigate('/book')
                }}
              />
            ))}
          </div>
        </section>

        <section className="card p-4">
          <SectionHeader title="Why fly Garuda" subtitle="What every Garuda fare already includes" className="mb-3" />
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {VALUE_ITEMS.map(({ key, title, icon: Icon }) => (
              <li key={key} className="flex items-center gap-2.5 text-[13px] text-ink-soft">
                <span className="h-8 w-8 rounded-lg bg-brand-turquoise-soft text-brand-turquoise flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                {title}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeader title="Special offers" action="View all" to="/offers" />
          <div className="space-y-3">
            {OFFERS.slice(0, 2).map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
                onClick={() => {
                  dispatch({ type: 'SET_SEARCH', search: { origin: 'CGK', destination: o.destinationCode } })
                  navigate('/book')
                }}
              />
            ))}
          </div>
        </section>

        {isMember ? (
          <button type="button" onClick={() => navigate('/miles')} className="w-full card p-4 text-left press">
            <div className="flex items-center justify-between mb-2">
              <span className="t-label">GarudaMiles</span>
              <span className="text-[12px] font-semibold text-brand-blue">{miles.tier.name}</span>
            </div>
            <p className="text-[22px] font-bold text-ink tracking-tight">{formatNumber(miles.balance)} miles</p>
            <ProgressBar value={miles.progressPct} max={100} className="mt-3" label="Tier progress" />
            <p className="text-[12px] text-ink-muted mt-1.5">
              {miles.nextTier ? `${formatNumber(miles.milesToNextTier)} tier miles to ${miles.nextTier.name}` : 'Top tier reached'}
            </p>
          </button>
        ) : (
          <MascotBanner
            mascot="love"
            tone="navy"
            title="Join GarudaMiles"
            description="Earn miles on every flight and unlock priority services."
            action={
              <Button size="sm" variant="inverse" onClick={() => navigate('/miles')}>
                Sign in or join
              </Button>
            }
          />
        )}
      </PageContainer>
    </>
  )
}

export function HomePage() {
  const { nextTrip } = useApp()
  return <div className="flex-1 flex flex-col bg-surface-off">{nextTrip ? <MemberHome trip={nextTrip} /> : <GuestHome />}</div>
}
