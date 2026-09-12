import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Check, Clock, QrCode, ShieldAlert, User } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, StickyCTA, InfoRow } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Checkbox } from '../components/common/Inputs'
import { EmptyState } from '../components/common/States'
import { Mascot } from '../components/common/Mascot'
import { SeatLegend, SeatMap } from '../components/booking/SeatMap'
import { seatType } from '../utils/seats'
import { RouteLine } from '../components/trips/TripCard'
import { useApp } from '../store/AppContext'
import { formatLongDate } from '../utils/format'
import { cn } from '../utils/cn'

const STEPS = ['Passenger', 'Seat', 'Confirm']

export function CheckInPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTrip, dispatch } = useApp()
  const trip = getTrip(id)
  const [step, setStep] = useState(0)
  const [seat, setSeat] = useState<string | null>(trip?.seat ?? '18A')
  const [ack, setAck] = useState(false)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/trips" title="Check-in" />
        <EmptyState mascot="think" title="Trip not found" action={<Button onClick={() => navigate('/trips')}>Go to Trips</Button>} />
      </div>
    )
  }

  if (trip.category !== 'upcoming' || trip.status === 'cancelled') {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back={`/trips/${trip.id}`} title="Check-in" />
        <EmptyState mascot="chill" title="Check-in is not available" description="This journey is not open for check-in." action={<Button onClick={() => navigate(`/trips/${trip.id}`)}>Back to trip</Button>} />
      </div>
    )
  }

  if (trip.checkedIn && !done) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back={`/trips/${trip.id}`} title="Check-in" />
        <EmptyState mascot="love" title="You are already checked in" description={`Seat ${trip.seat} · Your boarding pass is ready.`} action={<Button onClick={() => navigate(`/boarding-pass/${trip.id}`, { replace: true })} leftIcon={<QrCode className="h-4 w-4" />}>Open Boarding Pass</Button>} />
      </div>
    )
  }

  if (!trip.checkInOpen) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back={`/trips/${trip.id}`} title="Check-in" />
        <EmptyState
          icon={Clock}
          title="Check-in opens 24 hours before departure."
          description={`Online check-in for ${trip.flightNumber} opens at ${trip.departTime} on the day before your flight. We will remind you.`}
          action={<Button variant="secondary" onClick={() => navigate(`/trips/${trip.id}`)}>Back to trip</Button>}
        />
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 safe-top animate-fade-up">
          <div className="relative">
            <Mascot name="wave" size={190} />
            <span className="absolute -right-1 top-6 h-12 w-12 rounded-full bg-brand-turquoise text-white flex items-center justify-center shadow-float animate-check-pop">
              <Check className="h-6 w-6" strokeWidth={3} />
            </span>
          </div>
          <h1 className="t-display mt-4">Check-in Successful</h1>
          <p className="t-body mt-2 max-w-[280px]">Boarding pass ready. Seat {seat} · Gate {trip.gate} · Boarding {trip.disruption ? trip.disruption.newBoardingTime : trip.boardingTime}.</p>
          <div className="mt-6 rounded-2xl bg-surface-off border border-surface-line px-4 py-3 text-left w-full max-w-[320px]">
            <p className="t-label text-brand-turquoise">Next</p>
            <p className="text-[13.5px] font-semibold text-ink mt-1">Recommended airport arrival {trip.disruption ? '06:50' : '06:15'}</p>
            <p className="text-[12px] text-ink-muted">Traffic to {trip.terminal} is moderate · 52 min from home</p>
          </div>
        </div>
        <StickyCTA>
          <Button variant="secondary" full onClick={() => navigate(`/trips/${trip.id}`, { replace: true })}>
            View Trip
          </Button>
          <Button full onClick={() => navigate(`/boarding-pass/${trip.id}`, { replace: true })} leftIcon={<QrCode className="h-4 w-4" />}>
            Boarding Pass
          </Button>
        </StickyCTA>
      </div>
    )
  }

  const submit = () => {
    if (!seat) return
    setSubmitting(true)
    window.setTimeout(() => {
      dispatch({ type: 'CHECK_IN', id: trip.id, seat })
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: `checkin-${trip.id}`,
          category: 'travel',
          title: `Checked in · Seat ${seat}`,
          body: `Your boarding pass for ${trip.flightNumber} is ready. Gate ${trip.gate}, boarding ${trip.boardingTime}.`,
          time: 'Just now',
          to: `/boarding-pass/${trip.id}`,
          iconKey: 'ticket',
        },
      })
      setSubmitting(false)
      setDone(true)
    }, 900)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back={step === 0 ? `/trips/${trip.id}` : undefined} title="Online check-in" subtitle={`${trip.flightNumber} · ${trip.origin} → ${trip.destination}`} right={step > 0 ? <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>Back</Button> : undefined} />
      <ol className="flex items-center gap-2 px-4 py-3 bg-white border-b border-surface-line" aria-label="Check-in progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2 flex-1">
            <span className={cn('h-6 w-6 rounded-full text-[11px] font-bold flex items-center justify-center', i < step ? 'bg-brand-turquoise text-white' : i === step ? 'bg-brand-navy text-white' : 'bg-surface-soft text-ink-muted')}>
              {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn('text-[12px] font-semibold', i === step ? 'text-ink' : 'text-ink-muted')}>{label}</span>
            {i < STEPS.length - 1 && <span className={cn('h-[2px] flex-1 rounded-full', i < step ? 'bg-brand-turquoise' : 'bg-surface-line')} />}
          </li>
        ))}
      </ol>

      <PageContainer className="py-4 space-y-4">
        {step === 0 && (
          <div className="space-y-4 animate-fade-up">
            <section className="card p-4">
              <div className="flex items-center justify-between text-[12px] text-ink-muted mb-2">
                <span className="font-semibold text-ink">{trip.flightNumber}</span>
                <span>{formatLongDate(trip.date)}</span>
              </div>
              <RouteLine origin={trip.origin} destination={trip.destination} />
              <div className="flex justify-between text-[12px] text-ink-muted mt-0.5">
                <span>
                  Departs <span className="font-semibold text-ink">{trip.disruption ? trip.disruption.newDepartTime : trip.departTime}</span>
                </span>
                <span>{trip.terminal}</span>
              </div>
            </section>
            <section className="card p-4">
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold">RW</span>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-ink">{trip.passengerName}</p>
                  <p className="text-[12px] text-ink-muted">Adult · GarudaMiles GA-27845193</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success-soft rounded-full px-2 py-1">
                  <User className="h-3 w-3" /> Confirmed
                </span>
              </div>
              <div className="mt-3 divide-y divide-surface-line">
                <InfoRow label="Cabin" value="Economy" />
                <InfoRow label="Baggage" value={`${trip.baggageChecked} checked · ${trip.baggageCabin} cabin`} />
                <InfoRow label="Travel document" value="KTP · verified" />
              </div>
            </section>
            <section className="card p-4">
              <div className="flex items-start gap-3">
                <span className="h-10 w-10 rounded-xl bg-warning-soft text-warning flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-ink">Dangerous goods</p>
                  <p className="text-[12px] text-ink-muted mt-0.5 leading-snug">Power banks stay in cabin baggage. No flammable liquids, lighters or compressed gases in checked bags.</p>
                  <Checkbox className="mt-3" checked={ack} onChange={setAck} label="I confirm my baggage does not contain restricted items." />
                </div>
              </div>
            </section>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-fade-up">
            <div className="card p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="t-label">Your seat</p>
                <p className="text-[20px] font-bold text-ink leading-tight">{seat ? `${seat} · ${seatType(seat)}` : 'Tap a seat to select'}</p>
                <p className="text-[12px] text-ink-muted">Standard seats included with your fare · preferred seats highlighted</p>
              </div>
            </div>
            <SeatLegend />
            <SeatMap selected={seat} onSelect={setSeat} seed={trip.flightNumber} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <section className="card p-4">
              <p className="t-label mb-2">Review</p>
              <div className="divide-y divide-surface-line">
                <InfoRow label="Passenger" value={trip.passengerName} />
                <InfoRow label="Flight" value={`${trip.flightNumber} · ${trip.origin} → ${trip.destination}`} />
                <InfoRow label="Date" value={formatLongDate(trip.date)} />
                <InfoRow label="Seat" value={`${seat} · ${seat ? seatType(seat) : ''}`} />
                <InfoRow label="Gate" value={`${trip.gate} · ${trip.terminal}`} />
                <InfoRow label="Boarding" value={`${trip.disruption ? trip.disruption.newBoardingTime : trip.boardingTime} · Zone ${trip.zone}`} />
              </div>
            </section>
            <p className="text-[11.5px] text-ink-muted px-1">By confirming, your digital boarding pass will be issued. Please arrive at the gate at least 35 minutes before departure.</p>
          </div>
        )}
      </PageContainer>

      <StickyCTA>
        {step < 2 ? (
          <Button size="lg" full disabled={(step === 0 && !ack) || (step === 1 && !seat)} onClick={() => setStep((s) => s + 1)} rightIcon={<ArrowRight className="h-4 w-4" />}>
            {step === 1 ? 'Confirm Seat' : 'Continue'}
          </Button>
        ) : (
          <Button size="lg" full loading={submitting} onClick={submit} leftIcon={<Check className="h-4 w-4" strokeWidth={3} />}>
            Confirm Check-in
          </Button>
        )}
      </StickyCTA>
    </div>
  )
}
