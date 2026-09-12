import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Armchair, CalendarClock, Check, HandCoins, Luggage, Mail, ShieldCheck, Split, UtensilsCrossed, XCircle } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { ListRow } from '../components/common/ListRow'
import { BottomSheet, Modal } from '../components/common/Overlays'
import { EmptyState } from '../components/common/States'
import { RouteLine } from '../components/trips/TripCard'
import { StatusBadge } from '../components/common/StatusBadge'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { FARE_FAMILIES } from '../data/flights'
import { formatMediumDate, formatRupiah, generateBookingCode } from '../utils/format'
import { todayISO } from '../utils/share'
import { cn } from '../utils/cn'

type Sheet = 'flight' | 'baggage' | 'meal' | 'cancel' | 'eticket' | 'protection' | 'split' | null

const BAGGAGE_OPTIONS = [
  { kg: 10, price: 275000, note: 'Most popular' },
  { kg: 20, price: 495000 },
  { kg: 30, price: 690000 },
]

const MEALS = ['Standard meal', 'Vegetarian', 'Seafood', 'Child meal', 'No meal']

export function ManageBookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getTrip, dispatch, user } = useApp()
  const trip = getTrip(id)
  const [sheet, setSheet] = useState<Sheet>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [bag, setBag] = useState(0)
  const [sending, setSending] = useState(false)

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/trips" title="Manage Booking" />
        <EmptyState mascot="think" title="Booking not found" action={<Button onClick={() => navigate('/trips')}>Go to Trips</Button>} />
      </div>
    )
  }
  const fare = FARE_FAMILIES.find((f) => f.id === trip.fare)
  const flexible = trip.fare !== 'saver'
  const protectedTrip = trip.addOns?.includes('insurance')
  const travellers = trip.passengerCount ?? 1

  const cancel = () => {
    dispatch({ type: 'CANCEL_TRIP', id: trip.id })
    dispatch({
      type: 'ADD_CASE',
      entry: { id: `case-${trip.id}`, kind: 'refund', title: `Refund · ${trip.bookingCode} ${trip.flightNumber}`, detail: `${trip.totalPaid ? formatRupiah(Math.round(trip.totalPaid * (trip.fare === 'flex' ? 0.9 : trip.fare === 'value' ? 0.6 : 0.11))) : 'Taxes'} to original payment method`, reference: `RF-2026-${String(Math.abs(trip.id.length * 7919) % 100000).padStart(5, '0')}`, status: 'open', submittedAt: todayISO() },
    })
    setConfirmCancel(false)
    toast('Booking cancelled · refund request submitted', 'info')
    navigate('/trips', { replace: true })
  }

  const addBaggage = () => {
    const opt = BAGGAGE_OPTIONS[bag]
    const current = parseInt(trip.baggageChecked, 10) || 20
    dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { baggageChecked: `${current + opt.kg} kg`, addOns: [...(trip.addOns ?? []).filter((a) => a !== 'baggage10'), 'baggage10'] } })
    dispatch({ type: 'ADD_PURCHASE', purchase: { id: `pu-${Date.now()}`, kind: 'lounge', title: `Extra baggage +${opt.kg} kg · ${trip.flightNumber}`, detail: `Booking ${trip.bookingCode}`, price: opt.price, date: todayISO(), status: 'confirmed' } })
    setSheet(null)
    toast(`${opt.kg} kg added · allowance now ${current + opt.kg} kg`)
  }

  const sendTicket = () => {
    setSending(true)
    window.setTimeout(() => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: { id: `eticket-${trip.id}-${Date.now()}`, category: 'travel', title: `E-ticket sent · ${trip.bookingCode}`, body: `Itinerary receipt for ${trip.flightNumber} was emailed to ${user.email}.`, time: 'Just now', to: `/trips/${trip.id}`, iconKey: 'ticket' },
      })
      setSending(false)
      setSheet(null)
      toast(`E-ticket sent to ${user.email}`)
    }, 800)
  }

  const addProtection = () => {
    dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { addOns: [...(trip.addOns ?? []), 'insurance'] } })
    dispatch({ type: 'ADD_PURCHASE', purchase: { id: `pu-${Date.now()}`, kind: 'insurance', title: `Travel protection · ${trip.flightNumber}`, detail: `Delay, baggage and medical cover · ${trip.bookingCode}`, price: 68000 * travellers, date: todayISO(), status: 'confirmed', reference: `TP-${generateBookingCode(trip.id + 'tp')}` } })
    setSheet(null)
    toast('Travel protection added to this booking')
  }

  const splitBooking = () => {
    const others = travellers - 1
    const code = generateBookingCode(trip.id + 'split')
    dispatch({ type: 'ADD_TRIP', trip: { ...trip, id: `${trip.id}-split-${Date.now()}`, bookingCode: code, passengerName: others > 1 ? `Companions (${others})` : 'Companion', passengerCount: others, seat: null, checkedIn: false, totalPaid: undefined } })
    dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { passengerCount: 1, passengerName: user.name } })
    setSheet(null)
    toast(`Booking split · new code ${code}`)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back={`/trips/${trip.id}`} title="Manage Booking" subtitle={`${trip.bookingCode} · ${trip.flightNumber}`} />
      <PageContainer className="py-4 space-y-4">
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2 text-[12px] text-ink-muted">
            <span>{formatMediumDate(trip.date)} · {trip.departTime}</span>
            <StatusBadge status={trip.status} />
          </div>
          <RouteLine origin={trip.origin} destination={trip.destination} />
          <div className="mt-3 pt-3 border-t border-surface-line flex items-center justify-between text-[12.5px]">
            <span className="text-ink-muted">
              {fare?.name} · {trip.passengerName}
            </span>
            <span className="font-semibold text-ink">{trip.totalPaid ? formatRupiah(trip.totalPaid) : ''}</span>
          </div>
        </section>

        <section>
          <p className="t-label mb-2">Change</p>
          <div className="card divide-y divide-surface-line overflow-hidden">
            <ListRow icon={CalendarClock} title="Change flight" description={flexible ? `${fare?.name}: changes allowed` : 'Change fee applies on Saver'} onClick={() => setSheet('flight')} />
            <ListRow icon={Armchair} title="Change seat" description={trip.seat ? `Current seat ${trip.seat}` : 'No seat selected yet'} to={`/seat/${trip.id}`} />
            <ListRow icon={Luggage} title="Add baggage" description={`Current allowance ${trip.baggageChecked}`} onClick={() => setSheet('baggage')} />
            <ListRow icon={UtensilsCrossed} title="Meal preference" description={trip.meal} onClick={() => setSheet('meal')} />
          </div>
        </section>

        <section>
          <p className="t-label mb-2">Documents</p>
          <div className="card divide-y divide-surface-line overflow-hidden">
            <ListRow icon={Mail} iconTone="blue" title="Resend e-ticket" description={`Send the itinerary receipt to ${user.email}`} onClick={() => setSheet('eticket')} />
            <ListRow icon={ShieldCheck} iconTone="blue" title="Travel protection" description={protectedTrip ? 'Included in this booking' : 'Add coverage for delays and baggage'} badge={protectedTrip ? 'Active' : undefined} onClick={() => setSheet('protection')} />
            <ListRow icon={Split} iconTone="blue" title="Split booking" description={travellers > 1 ? `${travellers} travellers on this booking` : 'Only one passenger in this booking'} onClick={() => setSheet('split')} />
          </div>
        </section>

        <section>
          <p className="t-label mb-2">Cancellation</p>
          <div className="card overflow-hidden">
            <ListRow icon={XCircle} iconTone="error" title="Cancel booking" description={flexible ? 'Refund available on this fare' : 'Refund not available on Saver (taxes refundable)'} onClick={() => setSheet('cancel')} />
            <div className="border-t border-surface-line">
              <ListRow icon={HandCoins} title="Refund request" description="Track an existing refund" to="/more/refund-request" />
            </div>
          </div>
        </section>
      </PageContainer>

      <BottomSheet open={sheet === 'flight'} onClose={() => setSheet(null)} title="Change flight" subtitle="Same route, different time or date" footer={<Button full onClick={() => { setSheet(null); dispatch({ type: 'SET_SEARCH', search: { origin: trip.origin, destination: trip.destination, departDate: trip.date, tripType: 'oneway' } }); navigate('/search-results') }}>See available flights</Button>}>
        <div className="rounded-xl bg-surface-off p-3.5 text-[13px] text-ink-soft space-y-1.5">
          <p>
            <span className="font-semibold text-ink">{fare?.name}</span> — {flexible ? 'flight changes are permitted; fare difference may apply.' : 'a change fee of Rp 350,000 plus fare difference applies.'}
          </p>
          <p className="text-[11.5px] text-ink-muted">Demo policy values for this prototype.</p>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'baggage'} onClose={() => setSheet(null)} title="Add baggage" subtitle={`Current allowance ${trip.baggageChecked}`} footer={<Button full onClick={addBaggage}>Add {BAGGAGE_OPTIONS[bag].kg} kg · {formatRupiah(BAGGAGE_OPTIONS[bag].price)}</Button>}>
        <div className="space-y-2" role="radiogroup" aria-label="Extra baggage">
          {BAGGAGE_OPTIONS.map((b, i) => (
            <button key={b.kg} type="button" role="radio" aria-checked={bag === i} onClick={() => setBag(i)} className={cn('w-full flex items-center justify-between rounded-xl border p-3.5 text-left', bag === i ? 'border-brand-blue bg-brand-blue-light/60' : 'border-surface-line')}>
              <span className="text-[14px] font-semibold text-ink">
                +{b.kg} kg {b.note && <span className="ml-2 text-[10px] font-bold uppercase rounded-full bg-brand-turquoise-soft text-brand-turquoise px-2 py-0.5">{b.note}</span>}
              </span>
              <span className="text-[13px] font-semibold text-brand-navy">{formatRupiah(b.price)}</span>
            </button>
          ))}
          <p className="text-[11.5px] text-ink-faint">Pre-purchased baggage is about 20% cheaper than at the airport. Demo prices.</p>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'meal'} onClose={() => setSheet(null)} title="Meal preference">
        <div className="space-y-2 pb-2">
          {MEALS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { meal: m } }); setSheet(null); toast(`Meal updated: ${m}`) }}
              className={cn('w-full text-left rounded-xl border px-4 py-3 text-[14px] font-semibold flex items-center justify-between', trip.meal === m ? 'border-brand-blue bg-brand-blue-light/60 text-ink' : 'border-surface-line text-ink-soft')}
            >
              {m}
              {trip.meal === m && <Check className="h-4 w-4 text-brand-blue" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'eticket'} onClose={() => setSheet(null)} title="Resend e-ticket" subtitle="Itinerary receipt and fare rules" footer={<Button full loading={sending} onClick={sendTicket} leftIcon={<Mail className="h-4 w-4" />}>Send to {user.email}</Button>}>
        <div className="rounded-xl border border-surface-line overflow-hidden">
          <div className="bg-surface-off px-4 py-2.5 text-[11px] text-ink-muted">
            To: <span className="font-semibold text-ink">{user.email}</span> · Subject: Your Garuda Indonesia e-ticket {trip.bookingCode}
          </div>
          <div className="p-4 text-[13px] text-ink-soft space-y-1.5">
            <p className="font-semibold text-ink">{trip.flightNumber} · {trip.origin} → {trip.destination}</p>
            <p>{formatMediumDate(trip.date)} · departs {trip.departTime} · {trip.terminal}</p>
            <p>Passenger: {trip.passengerName} · {fare?.name}</p>
            <p>Ticket 126-2400{trip.sequence}981 · Booking {trip.bookingCode}</p>
            {trip.totalPaid && <p>Total paid: {formatRupiah(trip.totalPaid)}</p>}
          </div>
        </div>
        <p className="text-[11.5px] text-ink-faint mt-3">A copy also appears in your notifications.</p>
      </BottomSheet>

      <BottomSheet open={sheet === 'protection'} onClose={() => setSheet(null)} title="Travel protection" subtitle={protectedTrip ? 'Active on this booking' : `${formatRupiah(68000)} per traveller`} footer={protectedTrip ? <Button full variant="secondary" onClick={() => setSheet(null)}>Close</Button> : <Button full onClick={addProtection} leftIcon={<ShieldCheck className="h-4 w-4" />}>Add for {formatRupiah(68000 * travellers)}</Button>}>
        <ul className="space-y-2">
          {['Flight delay over 4 hours · Rp 500,000', 'Baggage delay or loss · up to Rp 5,000,000', 'Medical emergency abroad · up to Rp 250,000,000', 'Trip cancellation for covered reasons'].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[13px] text-ink-soft">
              <Check className="h-4 w-4 text-brand-turquoise shrink-0 mt-0.5" strokeWidth={2.5} /> {t}
            </li>
          ))}
        </ul>
        {protectedTrip && <p className="mt-3 rounded-xl bg-success-soft text-success text-[12.5px] px-3.5 py-2.5 font-semibold">Coverage certificate is attached to your e-ticket.</p>}
        <p className="text-[11.5px] text-ink-faint mt-3">Can be added until 24 hours before departure. Demo policy values.</p>
      </BottomSheet>

      <BottomSheet open={sheet === 'split'} onClose={() => setSheet(null)} title="Split booking" subtitle={travellers > 1 ? 'Each traveller receives their own booking code' : undefined} footer={travellers > 1 ? <Button full onClick={splitBooking} leftIcon={<Split className="h-4 w-4" />}>Split into 2 bookings</Button> : <Button full variant="secondary" onClick={() => setSheet(null)}>Close</Button>}>
        {travellers > 1 ? (
          <div className="rounded-xl bg-surface-off p-3.5 text-[13px] text-ink-soft space-y-1.5">
            <p>
              <span className="font-semibold text-ink">{user.name}</span> keeps booking {trip.bookingCode}.
            </p>
            <p>{travellers - 1} other traveller{travellers > 2 ? 's' : ''} move to a new booking with a new code. Add-ons are kept; seats are reselected at check-in.</p>
          </div>
        ) : (
          <p className="t-body">This booking has one passenger, so there is nothing to split. Bookings made for several travellers can be separated here so each person can manage their own journey.</p>
        )}
      </BottomSheet>

      <BottomSheet open={sheet === 'cancel'} onClose={() => setSheet(null)} title="Cancel booking" subtitle="Review before you confirm" footer={<Button variant="danger" full onClick={() => { setSheet(null); setConfirmCancel(true) }}>Continue to cancel</Button>}>
        <div className="rounded-xl bg-surface-off p-3.5 text-[13px] space-y-2">
          <div className="flex justify-between">
            <span className="text-ink-muted">Amount paid</span>
            <span className="font-semibold">{trip.totalPaid ? formatRupiah(trip.totalPaid) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Estimated refund</span>
            <span className="font-semibold text-success">{trip.totalPaid ? formatRupiah(Math.round(trip.totalPaid * (trip.fare === 'flex' ? 0.9 : trip.fare === 'value' ? 0.6 : 0.11))) : '—'}</span>
          </div>
          <p className="text-[11.5px] text-ink-muted pt-1">Refund processed to the original payment method within 14 working days. Demo values.</p>
        </div>
      </BottomSheet>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel this booking?">
        <p className="t-body">
          {trip.flightNumber} {trip.origin} → {trip.destination} on {formatMediumDate(trip.date)} will be cancelled. This cannot be undone.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" full onClick={() => setConfirmCancel(false)}>
            Keep booking
          </Button>
          <Button variant="danger" full onClick={cancel}>
            Cancel booking
          </Button>
        </div>
      </Modal>
    </div>
  )
}
