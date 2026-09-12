import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Armchair, CalendarClock, HandCoins, Luggage, Mail, ShieldCheck, Split, UtensilsCrossed, XCircle } from 'lucide-react'
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
import { formatMediumDate, formatRupiah } from '../utils/format'

type Sheet = 'flight' | 'baggage' | 'meal' | 'cancel' | null

export function ManageBookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getTrip, dispatch } = useApp()
  const trip = getTrip(id)
  const [sheet, setSheet] = useState<Sheet>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

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

  const cancel = () => {
    dispatch({ type: 'CANCEL_TRIP', id: trip.id })
    setConfirmCancel(false)
    toast('Booking cancelled · refund request submitted', 'info')
    navigate('/trips', { replace: true })
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
            <ListRow icon={Mail} iconTone="blue" title="Resend e-ticket" description="Send the itinerary receipt to your email" onClick={() => toast('E-ticket sent to raka.wijaya@example.com')} />
            <ListRow icon={ShieldCheck} iconTone="blue" title="Travel protection" description={trip.addOns?.includes('insurance') ? 'Included in this booking' : 'Add coverage for delays and baggage'} onClick={() => toast(trip.addOns?.includes('insurance') ? 'Coverage certificate sent to your email' : 'Travel protection can be added until 24h before departure', 'info')} />
            <ListRow icon={Split} iconTone="blue" title="Split booking" description="Separate passengers into their own bookings" onClick={() => toast('Only one passenger in this booking', 'info')} />
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

      <BottomSheet open={sheet === 'baggage'} onClose={() => setSheet(null)} title="Add baggage" footer={<Button full onClick={() => { dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { baggageChecked: '30 kg' } }); setSheet(null); toast('10 kg added · allowance now 30 kg') }}>Add 10 kg · {formatRupiah(275000)}</Button>}>
        <div className="space-y-2">
          {[
            { kg: '+10 kg', price: 275000, note: 'Most popular' },
            { kg: '+20 kg', price: 495000 },
            { kg: '+30 kg', price: 690000 },
          ].map((b) => (
            <div key={b.kg} className="flex items-center justify-between rounded-xl border border-surface-line p-3.5">
              <span className="text-[14px] font-semibold text-ink">
                {b.kg} {b.note && <span className="ml-2 text-[10px] font-bold uppercase rounded-full bg-brand-turquoise-soft text-brand-turquoise px-2 py-0.5">{b.note}</span>}
              </span>
              <span className="text-[13px] font-semibold text-brand-navy">{formatRupiah(b.price)}</span>
            </div>
          ))}
          <p className="text-[11.5px] text-ink-faint">Pre-purchased baggage is cheaper than at the airport. Demo prices.</p>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'meal'} onClose={() => setSheet(null)} title="Meal preference">
        <div className="space-y-2 pb-2">
          {['Standard meal', 'Vegetarian', 'Seafood', 'Child meal', 'No meal'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { meal: m } }); setSheet(null); toast(`Meal updated: ${m}`) }}
              className={`w-full text-left rounded-xl border px-4 py-3 text-[14px] font-semibold ${trip.meal === m ? 'border-brand-blue bg-brand-blue-light/60 text-ink' : 'border-surface-line text-ink-soft'}`}
            >
              {m}
            </button>
          ))}
        </div>
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
