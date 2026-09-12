import { useNavigate } from 'react-router-dom'
import { AlertTriangle, DoorOpen, FlaskConical, RotateCcw, Undo2, WifiOff, Route, LogIn, Sparkles } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Toggle } from '../components/common/Inputs'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { STAGES } from '../data/trips'
import { addMinutes } from '../utils/format'
import { cn } from '../utils/cn'

export function PrototypePage() {
  const { state, dispatch, isMember } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const trip = state.trips.find((t) => t.id === 'trip-ga412')

  const simulate = () => {
    if (!trip) return
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

  const simulateGate = () => {
    if (!trip) return
    dispatch({
      type: 'APPLY_DISRUPTION',
      id: trip.id,
      disruption: {
        type: 'gate-change',
        delayMin: 0,
        newGate: '16',
        newDepartTime: trip.departTime,
        newBoardingTime: trip.boardingTime,
        newArriveTime: trip.arriveTime,
        reason: 'Operational gate reassignment at Terminal 3',
        issuedAt: 'Just now',
      },
    })
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: `disruption-${trip.id}`,
        category: 'travel',
        title: `Gate changed: ${trip.flightNumber} now boards from Gate 16`,
        body: `Previously Gate ${trip.gate}. Boarding time ${trip.boardingTime} is unchanged. Your boarding pass has been updated.`,
        time: 'Just now',
        to: `/flight-update/${trip.id}`,
        iconKey: 'gate',
      },
    })
    navigate(`/flight-update/${trip.id}`)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/more" title="Prototype Controls" subtitle="Demo tools for the presentation" />
      <PageContainer className="py-4 space-y-4">
        <div className="rounded-2xl bg-brand-navy text-white p-4 flex items-start gap-3">
          <FlaskConical className="h-5 w-5 text-brand-turquoise-light shrink-0 mt-0.5" />
          <p className="text-[13px] leading-snug text-white/85">
            These controls exist only in the prototype so judges can experience every state of the journey. They are not part of the product.
          </p>
        </div>

        {!isMember && (
          <section className="card p-4">
            <p className="text-[14px] font-bold text-ink">Signed in as guest</p>
            <p className="t-caption mt-0.5">Sign in with the demo account to load Raka’s trips and miles.</p>
            <Button className="mt-3" size="sm" leftIcon={<LogIn className="h-4 w-4" />} onClick={() => navigate('/login')}>
              Sign in
            </Button>
          </section>
        )}

        {trip && isMember && (
          <>
            <section className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Route className="h-4 w-4 text-brand-turquoise" />
                <p className="text-[14px] font-bold text-ink">Journey stage · GA 412</p>
              </div>
              <p className="t-caption mb-3">Move Raka along his journey to preview Home, Trip and Companion at each step.</p>
              <div className="grid grid-cols-3 gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'SET_STAGE', id: trip.id, stage: s.id })
                      toast(`Stage set to ${s.label}`, 'info')
                    }}
                    className={cn('h-10 rounded-xl border text-[12px] font-semibold', trip.stage === s.id ? 'bg-brand-navy text-white border-brand-navy' : 'border-surface-line text-ink-soft bg-white')}
                  >
                    {s.short}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Toggle label="Online check-in open" description="Toggle the 24-hour check-in window" checked={trip.checkInOpen} onChange={(v) => dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { checkInOpen: v } })} />
              </div>
            </section>

            <section className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <p className="text-[14px] font-bold text-ink">Disruption scenario</p>
              </div>
              <p className="t-caption mb-3">Shows automatic trip updates, options and support for GA 412.</p>
              {trip.disruption ? (
                <Button variant="secondary" size="sm" leftIcon={<Undo2 className="h-4 w-4" />} onClick={() => { dispatch({ type: 'CLEAR_DISRUPTION', id: trip.id }); toast('Flight back on schedule', 'info') }}>
                  Clear {trip.disruption.type === 'gate-change' ? 'gate change' : 'delay'}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" leftIcon={<AlertTriangle className="h-4 w-4" />} onClick={simulate}>
                    Simulate 35-min delay
                  </Button>
                  <Button size="sm" variant="secondary" leftIcon={<DoorOpen className="h-4 w-4" />} onClick={simulateGate}>
                    Simulate gate change
                  </Button>
                </div>
              )}
            </section>
          </>
        )}

        <section className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <WifiOff className="h-4 w-4 text-ink-muted" />
            <p className="text-[14px] font-bold text-ink">Offline mode</p>
          </div>
          <Toggle label="Simulate offline" description="Shows cached journey information banners" checked={state.offlineSim} onChange={(v) => dispatch({ type: 'SET_OFFLINE', value: v })} />
        </section>

        <section className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-ink-muted" />
            <p className="text-[14px] font-bold text-ink">Reset</p>
          </div>
          <Button variant="secondary" full onClick={() => { dispatch({ type: 'RESET_TRIPS' }); toast('Trips and notifications reset', 'info') }}>
            Reset trips & notifications
          </Button>
          <Button variant="secondary" full leftIcon={<Sparkles className="h-4 w-4" />} onClick={() => { dispatch({ type: 'RESET_ALL' }); navigate('/onboarding', { replace: true }) }}>
            Replay onboarding (full reset)
          </Button>
        </section>
      </PageContainer>
    </div>
  )
}
