import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  DoorOpen,
  Luggage,
  MapPin,
  MessageCircle,
  PlaneLanding,
  PlaneTakeoff,
  TicketCheck,
  Bell,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Mascot } from '../components/common/Mascot'
import { EmptyState } from '../components/common/States'
import { WhatsAppPreview } from '../components/journey/WhatsAppPreview'
import { DestinationInfoCard, TravelChecklist } from '../components/journey/DestinationCard'
import { useApp } from '../store/AppContext'
import { stageIndex } from '../data/trips'
import { cityOf } from '../data/airports'
import type { JourneyStage, Trip } from '../types'
import { cn } from '../utils/cn'

interface Event {
  id: string
  when: string
  title: string
  description: string
  details?: { label: string; value: string }[]
  cta?: { label: string; to: string }
  state: 'done' | 'current' | 'upcoming' | 'alert'
  icon: LucideIcon
}

function buildEvents(trip: Trip): Event[] {
  const cur = stageIndex(trip.stage)
  const st = (stage: JourneyStage, doneOverride?: boolean): Event['state'] => {
    const i = stageIndex(stage)
    if (doneOverride) return 'done'
    if (i < cur) return 'done'
    if (i === cur) return 'current'
    return 'upcoming'
  }
  const dest = trip.destination === 'DPS' ? 'Bali' : cityOf(trip.destination)
  const d = trip.disruption
  const events: Event[] = [
    {
      id: 'checkin',
      when: 'T-24 hours',
      title: trip.checkedIn ? 'You checked in online' : trip.checkInOpen ? 'Online check-in is now available.' : 'Online check-in opens',
      description: trip.checkedIn ? `Seat ${trip.seat} confirmed. Your boarding pass is ready.` : 'Confirm your details and choose your seat in under a minute.',
      cta: trip.checkedIn || !trip.checkInOpen ? undefined : { label: 'Check In', to: `/checkin/${trip.id}` },
      state: trip.checkedIn ? 'done' : st('checkin'),
      icon: TicketCheck,
    },
    {
      id: 'prepare',
      when: 'T-4 hours',
      title: 'Prepare for your journey.',
      description: 'Leave in time for a calm arrival. We track traffic to the airport for you.',
      details: [
        { label: 'Recommended airport arrival', value: d ? '06:50' : '06:15' },
        { label: 'Estimated travel time', value: '52 minutes' },
        { label: 'Terminal', value: trip.terminal },
      ],
      state: st('airport'),
      icon: MapPin,
    },
    {
      id: 'gate',
      when: 'T-90 minutes',
      title: trip.checkedIn ? 'You are checked in.' : 'Head to your gate.',
      description: 'Security is currently quiet. Your gate is about an 8-minute walk from the checkpoint.',
      details: [
        { label: 'Gate', value: trip.gate },
        { label: 'Boarding time', value: d ? d.newBoardingTime : trip.boardingTime },
      ],
      cta: trip.checkedIn ? { label: 'Boarding Pass', to: `/boarding-pass/${trip.id}` } : undefined,
      state: st('airport', cur > 2),
      icon: DoorOpen,
    },
    {
      id: 'boarding',
      when: 'T-35 minutes',
      title: 'Boarding starts soon.',
      description: `Gate ${trip.gate} · 8-minute walk. Boarding by zone — you are in Zone ${trip.zone}.`,
      cta: trip.checkedIn ? { label: 'Open Boarding Pass', to: `/boarding-pass/${trip.id}` } : undefined,
      state: st('boarding'),
      icon: PlaneTakeoff,
    },
    {
      id: 'inflight',
      when: 'In flight',
      title: 'Enjoy your flight.',
      description: 'Meal service begins shortly after take-off. Entertainment is available on your device.',
      state: st('inflight'),
      icon: PlaneLanding,
    },
    {
      id: 'arrival',
      when: 'At arrival',
      title: `Welcome to ${dest}.`,
      description: 'Your bag is on its way to the belt. Miles are credited within 72 hours.',
      details: [
        { label: 'Baggage', value: `Belt ${trip.belt ?? 'TBA'}` },
        { label: 'Arrival terminal', value: trip.arrivalTerminal },
      ],
      state: st('arrival'),
      icon: Luggage,
    },
  ]
  if (d) {
    events.splice(1, 0, {
      id: 'disruption',
      when: 'Flight update',
      title: d.type === 'gate-change' ? `Gate changed to ${d.newGate}.` : `${trip.flightNumber} is delayed by ${d.delayMin} minutes.`,
      description: 'Your trip has been updated automatically. No action is needed from you.',
      details:
        d.type === 'gate-change'
          ? [
              { label: 'Previous gate', value: d.previousGate ?? '—' },
              { label: 'New gate', value: d.newGate ?? trip.gate },
            ]
          : [
              { label: 'New departure', value: d.newDepartTime },
              { label: 'New boarding', value: d.newBoardingTime },
            ],
      cta: { label: 'View Update', to: `/flight-update/${trip.id}` },
      state: 'alert',
      icon: AlertTriangle,
    })
  }
  return events
}

export function JourneyCompanionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTrip } = useApp()
  const trip = getTrip(id)
  const [wa, setWa] = useState(false)

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/trips" title="Journey Companion" />
        <EmptyState mascot="think" title="Trip not found" action={<Button onClick={() => navigate('/trips')}>Go to Trips</Button>} />
      </div>
    )
  }

  const events = buildEvents(trip)

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back={`/trips/${trip.id}`} title="Journey Companion" subtitle={`${trip.flightNumber} · ${trip.origin} → ${trip.destination}`} right={
        <button type="button" onClick={() => navigate('/more/notifications')} aria-label="Notification settings" className="h-10 w-10 rounded-full hover:bg-surface-soft flex items-center justify-center text-brand-navy">
          <Bell className="h-5 w-5" />
        </button>
      } />

      <PageContainer className="py-4">
        <div className="rounded-2xl bg-white border border-surface-line p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="t-label text-brand-turquoise">Proactive guidance</p>
            <h2 className="t-h2 mt-1">We tell you what’s next, before you ask.</h2>
            <p className="t-caption mt-1">Every step from check-in to baggage belt, with timely reminders on this device{' '}
              <button type="button" onClick={() => setWa(true)} className="font-semibold text-brand-blue">and WhatsApp</button>.
            </p>
          </div>
          <Mascot name="respect" size={84} className="shrink-0" />
        </div>

        <ol className="mt-6 relative" aria-label="Journey timeline">
          <span className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-surface-line" aria-hidden />
          {events.map((e) => {
            const done = e.state === 'done'
            const current = e.state === 'current'
            const alert = e.state === 'alert'
            return (
              <li key={e.id} className="relative pl-14 pb-6 last:pb-2">
                <span
                  className={cn(
                    'absolute left-0 top-0 h-10 w-10 rounded-full flex items-center justify-center border-2 bg-white z-10',
                    done && 'border-brand-turquoise bg-brand-turquoise text-white',
                    current && 'border-brand-navy text-brand-navy shadow-card',
                    alert && 'border-warning bg-warning-soft text-warning',
                    e.state === 'upcoming' && 'border-surface-line text-ink-faint',
                  )}
                >
                  {done ? <Check className="h-5 w-5" strokeWidth={3} /> : <e.icon className="h-5 w-5" />}
                </span>
                <div className={cn('card p-4', current && 'border-brand-navy/30 ring-1 ring-brand-navy/10', alert && 'border-warning/40 bg-warning-soft/40', e.state === 'upcoming' && 'opacity-80')}>
                  <p className={cn('text-[11px] font-bold uppercase tracking-[0.1em]', alert ? 'text-warning' : current ? 'text-brand-navy' : 'text-ink-muted')}>
                    {e.when}
                    {current && <span className="ml-2 rounded-full bg-brand-turquoise-soft text-brand-turquoise px-2 py-0.5 normal-case tracking-normal">Now</span>}
                  </p>
                  <p className="text-[15px] font-bold text-ink mt-1 leading-snug">{e.title}</p>
                  <p className="text-[12.5px] text-ink-muted mt-1 leading-snug">{e.description}</p>
                  {e.details && (
                    <dl className="mt-3 rounded-xl bg-surface-off px-3 py-2 divide-y divide-surface-line">
                      {e.details.map((d) => (
                        <div key={d.label} className="flex items-center justify-between py-1.5 text-[12.5px]">
                          <dt className="text-ink-muted">{d.label}</dt>
                          <dd className="font-semibold text-ink">{d.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {e.cta && (
                    <Button size="sm" className="mt-3" variant={alert ? 'secondary' : 'primary'} onClick={() => navigate(e.cta!.to)} rightIcon={<ArrowRight className="h-4 w-4" />}>
                      {e.cta.label}
                    </Button>
                  )}
                </div>
                {e.id === 'prepare' && trip.category === 'upcoming' && (
                  <div className="mt-3">
                    <TravelChecklist trip={trip} />
                  </div>
                )}
                {e.id === 'arrival' && (
                  <div className="mt-3">
                    <DestinationInfoCard trip={trip} />
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        <button type="button" onClick={() => setWa(true)} className="mt-4 w-full card p-4 flex items-center gap-3 text-left press">
          <span className="h-11 w-11 rounded-xl bg-[#E7F8EF] text-[#128C7E] flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-bold text-ink">Preview WhatsApp updates</span>
            <span className="block text-[12px] text-ink-muted">See how the same reminders reach you on WhatsApp.</span>
          </span>
          <ArrowRight className="h-4 w-4 text-ink-faint" />
        </button>
      </PageContainer>
      <WhatsAppPreview open={wa} onClose={() => setWa(false)} trip={trip} />
    </div>
  )
}
