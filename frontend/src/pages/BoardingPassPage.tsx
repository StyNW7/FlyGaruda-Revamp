import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CalendarPlus, Check, Footprints, Luggage, Navigation, Radar, Share2, Wallet, FlaskConical } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { BottomSheet } from '../components/common/Overlays'
import { EmptyState } from '../components/common/States'
import { StatusBadge } from '../components/common/StatusBadge'
import { BarcodeVisual, QrVisual } from '../components/trips/Codes'
import { ShareImageSheet } from '../components/common/ShareImageSheet'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { cityOf } from '../data/airports'
import { addMinutes, formatMediumDate } from '../utils/format'
import { renderBoardingPassStory } from '../utils/storyCard'
import { downloadTripICS } from '../utils/ics'
import { cn } from '../utils/cn'

function Field({ label, value, big, className }: { label: string; value: string; big?: boolean; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
      <p className={cn('font-bold text-ink leading-tight', big ? 'text-[22px]' : 'text-[15px]')}>{value}</p>
    </div>
  )
}

export function BoardingPassPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getTrip, dispatch } = useApp()
  const trip = getTrip(id)
  const [directions, setDirections] = useState(false)
  const [share, setShare] = useState<'share' | 'wallet' | null>(null)

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/trips" title="Boarding pass" />
        <EmptyState mascot="think" title="Trip not found" action={<Button onClick={() => navigate('/trips')}>Go to Trips</Button>} />
      </div>
    )
  }
  if (!trip.checkedIn || !trip.seat) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back={`/trips/${trip.id}`} title="Boarding pass" />
        <EmptyState mascot="think" title="Boarding pass not issued yet" description="Complete online check-in to receive your digital boarding pass." action={<Button onClick={() => navigate(`/checkin/${trip.id}`)}>Check In</Button>} />
      </div>
    )
  }

  const d = trip.disruption
  const dep = d ? d.newDepartTime : trip.departTime
  const arr = d ? d.newArriveTime : trip.arriveTime
  const boarding = d ? d.newBoardingTime : trip.boardingTime
  const gateClose = addMinutes(dep, -15)

  const simulateDisruption = () => {
    dispatch({
      type: 'APPLY_DISRUPTION',
      id: trip.id,
      disruption: {
        type: 'delay',
        delayMin: 35,
        newDepartTime: addMinutes(trip.departTime, 35),
        newBoardingTime: addMinutes(trip.boardingTime, 35),
        newArriveTime: addMinutes(trip.arriveTime, 35),
        reason: 'Late arrival of the inbound aircraft',
        issuedAt: 'Just now',
      },
    })
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: `disruption-${trip.id}`,
        category: 'travel',
        title: `${trip.flightNumber} delayed by 35 minutes`,
        body: `New departure ${addMinutes(trip.departTime, 35)}, boarding ${addMinutes(trip.boardingTime, 35)}. Your trip has been updated automatically.`,
        time: 'Just now',
        to: `/flight-update/${trip.id}`,
        iconKey: 'alert',
      },
    })
    navigate(`/flight-update/${trip.id}`)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back={`/trips/${trip.id}`} title="Boarding pass" right={
        <button type="button" onClick={() => setShare('share')} aria-label="Share boarding pass" className="h-10 w-10 rounded-full hover:bg-surface-soft flex items-center justify-center text-brand-navy">
          <Share2 className="h-5 w-5" />
        </button>
      } />

      <PageContainer className="py-4 space-y-4">
        {d && (
          <button type="button" onClick={() => navigate(`/flight-update/${trip.id}`)} className="w-full flex items-center gap-3 rounded-2xl bg-warning-soft border border-warning/30 p-3.5 text-left press">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <span className="flex-1 text-[12.5px] text-ink">
              <span className="font-bold">Updated:</span>{' '}
              {d.type === 'gate-change' ? (
                <>
                  gate changed to <span className="font-semibold">{d.newGate}</span> · boarding {trip.boardingTime} unchanged
                </>
              ) : (
                <>
                  delayed {d.delayMin} min · new boarding <span className="font-semibold">{d.newBoardingTime}</span>
                </>
              )}
            </span>
            <ArrowRight className="h-4 w-4 text-ink-muted" />
          </button>
        )}

        <article className="rounded-[24px] bg-white shadow-float overflow-hidden" aria-label="Digital boarding pass">
          <div className="card-navy rounded-none px-5 pt-4 pb-5 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/5" aria-hidden />
            <div className="flex items-center justify-between">
              <img src="/brand/logo-white.png" alt="Garuda Indonesia" className="h-8 w-auto" />
              <StatusBadge status={trip.status} className="bg-white/15 text-white" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-white/70">{cityOf(trip.origin)}</p>
                <p className="text-[34px] font-bold leading-none tracking-tight">{trip.origin}</p>
                <p className="text-[15px] font-semibold mt-1">
                  {dep !== trip.departTime && <span className="line-through text-white/50 font-normal mr-1.5">{trip.departTime}</span>}
                  {dep}
                </p>
              </div>
              <div className="flex flex-col items-center text-white/70 px-2 pb-6">
                <span className="text-[11px]">{trip.flightNumber}</span>
                <span className="h-[2px] w-16 bg-white/30 rounded-full my-1.5 relative">
                  <span className="absolute -top-[5px] left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-brand-turquoise-light" />
                </span>
                <span className="text-[11px]">Direct</span>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/70">{trip.destination === 'DPS' ? 'Bali' : cityOf(trip.destination)}</p>
                <p className="text-[34px] font-bold leading-none tracking-tight">{trip.destination}</p>
                <p className="text-[15px] font-semibold mt-1">{arr}</p>
              </div>
            </div>
          </div>

          <div className="px-5 pt-5 pb-4">
            <div className="grid grid-cols-3 gap-y-4">
              <Field label="Passenger" value={trip.passengerName} className="col-span-2" />
              <Field label="Date" value={formatMediumDate(trip.date).slice(5)} />
              <Field label="Boarding" value={boarding} big />
              <Field label="Gate" value={trip.gate} big />
              <Field label="Seat" value={trip.seat} big />
              <Field label="Zone" value={trip.zone} />
              <Field label="Sequence" value={trip.sequence} />
              <Field label="Terminal" value={trip.terminal.replace('Terminal ', 'T')} />
            </div>
          </div>

          <div className="px-5">
            <div className="notch-line" />
          </div>

          <div className="px-5 py-5 flex flex-col items-center">
            <QrVisual seed={trip.bookingCode + trip.seat} size={148} />
            <BarcodeVisual seed={trip.bookingCode} className="w-full h-9 mt-4" />
            <p className="font-mono text-[11px] tracking-[0.25em] text-ink-muted mt-2">
              {trip.bookingCode} · 126 2400{trip.sequence}981
            </p>
          </div>
        </article>

        <section className="card p-4">
          <p className="t-label mb-3">Travel command center</p>
          <div className="space-y-3">
            <button type="button" onClick={() => setDirections(true)} className="w-full flex items-center gap-3 text-left">
              <span className="h-10 w-10 rounded-xl bg-brand-turquoise-soft text-brand-turquoise flex items-center justify-center shrink-0">
                <Footprints className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold text-ink">Gate {trip.gate} — approximately 8 min walk</span>
                <span className="block text-[12px] text-ink-muted">From security checkpoint · gate closes {gateClose}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-ink-faint" />
            </button>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-success-soft text-success flex items-center justify-center shrink-0">
                <Radar className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                  <span className="relative flex h-2 w-2">
                    <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping', d ? 'bg-warning' : 'bg-success')} />
                    <span className={cn('relative inline-flex h-2 w-2 rounded-full', d ? 'bg-warning' : 'bg-success')} />
                  </span>
                  {d ? (d.type === 'gate-change' ? `Gate ${trip.gate} · departs ${dep}` : `Delayed ${d.delayMin} min · departs ${dep}`) : `On time · departs ${dep}`}
                </span>
                <span className="block text-[12px] text-ink-muted">{d ? d.reason : 'Live status · aircraft at gate · crew ready'}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-surface-soft text-brand-navy flex items-center justify-center shrink-0">
                <Luggage className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold text-ink">1 checked bag · {trip.baggageChecked}</span>
                <span className="block text-[12px] text-ink-muted">Tag 0126 GA 4471 · arrives on belt {trip.belt ?? 'TBA'}</span>
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" className="px-2" leftIcon={trip.walletSaved ? <Check className="h-4 w-4 text-success" /> : <Wallet className="h-4 w-4" />} onClick={() => setShare('wallet')}>
            {trip.walletSaved ? 'In Wallet' : 'Wallet'}
          </Button>
          <Button variant="secondary" size="sm" className="px-2" leftIcon={<CalendarPlus className="h-4 w-4" />} onClick={() => { downloadTripICS(trip); toast('Calendar event downloaded (.ics)') }}>
            Calendar
          </Button>
          <Button variant="secondary" size="sm" className="px-2" leftIcon={<Navigation className="h-4 w-4" />} onClick={() => setDirections(true)}>
            Directions
          </Button>
        </div>

        {!d && (
          <button type="button" onClick={simulateDisruption} className="w-full rounded-xl border border-dashed border-ink-faint/40 px-4 py-3 flex items-center gap-3 text-left text-ink-muted hover:bg-white">
            <FlaskConical className="h-4 w-4 shrink-0" />
            <span className="text-[12px] leading-snug">
              <span className="font-semibold text-ink-soft">Prototype:</span> simulate a flight update to see how FlyGaruda handles a disruption.
            </span>
            <ArrowRight className="h-4 w-4 ml-auto shrink-0" />
          </button>
        )}
      </PageContainer>

      <ShareImageSheet
        open={share !== null}
        onClose={() => setShare(null)}
        title={share === 'wallet' ? 'Save to Wallet' : 'Share boarding pass'}
        subtitle={share === 'wallet' ? 'Saves an offline copy of your pass to your photos / wallet' : `${trip.flightNumber} · ${trip.origin} → ${trip.destination} · Seat ${trip.seat}`}
        filename={`boarding-pass-${trip.flightNumber.replace(' ', '')}-${trip.bookingCode}.png`}
        shareTitle={`Boarding pass ${trip.flightNumber}`}
        shareText={`${trip.flightNumber} ${trip.origin} → ${trip.destination} · ${formatMediumDate(trip.date)} · Boarding ${boarding} · Gate ${trip.gate} · Seat ${trip.seat}`}
        render={() => renderBoardingPassStory(trip, trip.passengerName)}
        deps={[trip.gate, trip.seat, boarding, trip.status]}
        onSaved={() => {
          if (!trip.walletSaved) dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { walletSaved: true } })
        }}
      />

      <BottomSheet open={directions} onClose={() => setDirections(false)} title={`Directions to Gate ${trip.gate}`} subtitle={`${trip.terminal} · about 8 minutes on foot`}>
        <ol className="space-y-3 pb-2">
          {[
            { step: 'Security checkpoint', note: 'Domestic departures, level 2 · currently quiet' },
            { step: 'Turn right after security', note: 'Follow signs to Gates 10 – 16' },
            { step: 'Garuda Indonesia Lounge', note: 'On your left · Silver members: priority access on Business fares' },
            { step: `Gate ${trip.gate}`, note: `Boarding ${boarding} · Zone ${trip.zone} · gate closes ${gateClose}` },
          ].map((s, i, arr) => (
            <li key={s.step} className="flex items-start gap-3">
              <span className="relative flex flex-col items-center">
                <span className={cn('h-7 w-7 rounded-full text-[11px] font-bold flex items-center justify-center', i === arr.length - 1 ? 'bg-brand-turquoise text-white' : 'bg-brand-navy text-white')}>{i + 1}</span>
                {i < arr.length - 1 && <span className="w-[2px] h-6 bg-surface-line" />}
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-ink">{s.step}</span>
                <span className="block text-[12px] text-ink-muted">{s.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </BottomSheet>
    </div>
  )
}
