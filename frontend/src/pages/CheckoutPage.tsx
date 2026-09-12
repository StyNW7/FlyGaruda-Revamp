import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Armchair, ArrowRight, Check, CreditCard, Landmark, Lock, QrCode, ShieldCheck, User, Wallet, Award, ChevronDown } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, StickyCTA } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Checkbox, Input, RadioRow, Toggle } from '../components/common/Inputs'
import { BottomSheet, Modal } from '../components/common/Overlays'
import { SeatLegend, SeatMap } from '../components/booking/SeatMap'
import { seatType } from '../utils/seats'
import { ADD_ONS, FARE_FAMILIES, findFlight } from '../data/flights'
import { PAYMENT_METHODS, SAVED_PASSENGERS } from '../data/user'
import { getAirport } from '../data/airports'
import { useApp } from '../store/AppContext'
import { addMinutes, formatMediumDate, formatRupiah, generateBookingCode } from '../utils/format'
import type { Trip } from '../types'
import { cn } from '../utils/cn'

const STEPS = ['Passenger', 'Seat & add-ons', 'Payment'] as const

function StepHeader({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 px-4 py-3 bg-white border-b border-surface-line" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const done = i < step
        const active = i === step
        return (
          <li key={label} className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className={cn(
                'h-6 w-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0',
                done ? 'bg-brand-turquoise text-white' : active ? 'bg-brand-navy text-white' : 'bg-surface-soft text-ink-muted',
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn('text-[12px] font-semibold truncate', active ? 'text-ink' : 'text-ink-muted')}>{label}</span>
            {i < STEPS.length - 1 && <span className={cn('h-[2px] flex-1 rounded-full', done ? 'bg-brand-turquoise' : 'bg-surface-line')} />}
          </li>
        )
      })}
    </ol>
  )
}

const PAY_ICONS = { card: CreditCard, transfer: Landmark, qris: QrCode, wallet: Wallet, miles: Award }

export function CheckoutPage() {
  const { state, dispatch, isMember } = useApp()
  const navigate = useNavigate()
  const draft = state.draft
  const flight = draft ? findFlight(draft.flightId) : undefined
  const [step, setStep] = useState(0)
  const [seatSheet, setSeatSheet] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [agree, setAgree] = useState(false)
  const [contactOpen, setContactOpen] = useState(!isMember)

  const completedRef = useRef(false)

  useEffect(() => {
    if ((!draft || !flight) && !completedRef.current) navigate('/book', { replace: true })
  }, [draft, flight, navigate])

  const fare = useMemo(() => FARE_FAMILIES.find((f) => f.id === draft?.fareId), [draft?.fareId])
  if (!draft || !flight || !fare) return null

  const adults = Math.max(1, state.search.passengers.adults + state.search.passengers.children)
  const farePrice = flight.prices[draft.fareId] * adults
  const addOnTotal = draft.addOns.reduce((sum, id) => sum + (ADD_ONS.find((a) => a.id === id)?.price ?? 0), 0)
  const taxes = Math.round(farePrice * 0.11 / 1000) * 1000
  const total = farePrice + addOnTotal + taxes
  const p = draft.passenger
  const passengerValid = p.firstName.trim() && p.lastName.trim() && p.email.trim() && p.phone.trim()

  const update = (patch: Partial<typeof draft>) => dispatch({ type: 'UPDATE_DRAFT', patch })
  const toggleAddOn = (id: string) => update({ addOns: draft.addOns.includes(id) ? draft.addOns.filter((a) => a !== id) : [...draft.addOns, id] })

  const pay = () => {
    setProcessing(true)
    window.setTimeout(() => {
      // Demo storyline: booking a flight that already exists in the account (GA 412 on 19 Sep)
      // resolves to that booking so the journey continues seamlessly into check-in.
      const existing = state.trips.find((t) => t.category === 'upcoming' && t.flightNumber === flight.number && t.date === state.search.departDate)
      if (existing) {
        completedRef.current = true
        navigate(`/confirmation/${existing.id}`, { replace: true })
        dispatch({ type: 'UPDATE_TRIP', id: existing.id, patch: { seat: draft.seat ?? existing.seat, fare: draft.fareId, totalPaid: total, addOns: draft.addOns } })
        dispatch({ type: 'SET_DRAFT', draft: null })
        dispatch({
          type: 'ADD_NOTIFICATION',
          notification: {
            id: `booking-${existing.id}`,
            category: 'travel',
            title: `Booking confirmed · ${existing.bookingCode}`,
            body: `${existing.flightNumber} ${existing.origin} → ${existing.destination} on ${formatMediumDate(existing.date)}. Online check-in is now available.`,
            time: 'Just now',
            to: `/trips/${existing.id}`,
            iconKey: 'ticket',
          },
        })
        setProcessing(false)
        return
      }
      const id = `trip-${flight.number.replace(' ', '').toLowerCase()}-${Date.now()}`
      const trip: Trip = {
        id,
        bookingCode: generateBookingCode(id),
        flightNumber: flight.number,
        origin: flight.origin,
        destination: flight.destination,
        date: state.search.departDate,
        departTime: flight.departTime,
        arriveTime: flight.arriveTime,
        boardingTime: addMinutes(flight.departTime, -30),
        terminal: flight.terminal,
        arrivalTerminal: flight.arrivalTerminal,
        gate: 'TBA',
        seat: draft.seat,
        zone: '3',
        sequence: String(40 + (Date.now() % 50)).padStart(3, '0'),
        aircraft: flight.aircraft,
        cabin: state.search.cabin,
        fare: draft.fareId,
        status: 'scheduled',
        stage: 'booked',
        category: 'upcoming',
        checkedIn: false,
        checkInOpen: false,
        passengerName: `${p.firstName} ${p.lastName}`.trim(),
        baggageChecked: draft.addOns.includes('baggage10') ? '30 kg' : '20 kg',
        baggageCabin: '7 kg',
        meal: 'Standard meal',
        milesEstimate: Math.round(flight.milesEarn * (draft.fareId === 'flex' ? 1.5 : draft.fareId === 'value' ? 1.25 : 1)),
        addOns: draft.addOns,
        totalPaid: total,
      }
      completedRef.current = true
      navigate(`/confirmation/${id}`, { replace: true })
      dispatch({ type: 'ADD_TRIP', trip })
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: `booking-${id}`,
          category: 'travel',
          title: `Booking confirmed · ${trip.bookingCode}`,
          body: `${trip.flightNumber} ${trip.origin} → ${trip.destination} on ${formatMediumDate(trip.date)}. We will remind you when check-in opens.`,
          time: 'Just now',
          to: `/trips/${id}`,
          iconKey: 'ticket',
        },
      })
      setProcessing(false)
    }, 2200)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back={step === 0 ? true : undefined} title="Checkout" subtitle={`${flight.number} · ${getAirport(flight.origin).code} → ${getAirport(flight.destination).code} · ${fare.name}`} right={step > 0 ? <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>Back</Button> : undefined} />
      <StepHeader step={step} />

      <PageContainer className="py-4 space-y-4">
        {step === 0 && (
          <div className="space-y-4 animate-fade-up">
            {isMember && (
              <section>
                <p className="t-label mb-2">Saved travellers</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {SAVED_PASSENGERS.map((sp) => {
                    const [first, ...rest] = sp.name.split(' ')
                    const active = p.firstName === first && p.lastName === rest.join(' ')
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => update({ passenger: { ...p, firstName: first, lastName: rest.join(' '), milesId: sp.milesId } })}
                        className={cn('shrink-0 rounded-xl border px-3.5 py-2.5 text-left transition-colors', active ? 'border-brand-blue bg-brand-blue-light/60' : 'border-surface-line bg-white')}
                      >
                        <span className="block text-[13px] font-semibold text-ink">{sp.name}</span>
                        <span className="block text-[11px] text-ink-muted">{sp.relation}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            <section className="card p-4 space-y-3.5">
              <div className="flex items-center gap-2 text-[14px] font-bold text-ink">
                <User className="h-4 w-4 text-brand-turquoise" /> Passenger 1 · Adult
              </div>
              <div className="grid grid-cols-[88px_1fr] gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-ink-soft mb-1.5" htmlFor="title">
                    Title
                  </label>
                  <div className="relative">
                    <select id="title" value={p.title} onChange={(e) => update({ passenger: { ...p, title: e.target.value } })} className="h-12 w-full appearance-none rounded-xl border border-surface-line bg-white px-3.5 pr-8 text-[15px] focus:border-brand-blue outline-none">
                      {['Mr', 'Mrs', 'Ms'].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 text-ink-faint absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <Input label="First name" value={p.firstName} onChange={(e) => update({ passenger: { ...p, firstName: e.target.value } })} placeholder="As on ID" autoComplete="given-name" />
              </div>
              <Input label="Last name" value={p.lastName} onChange={(e) => update({ passenger: { ...p, lastName: e.target.value } })} placeholder="As on ID" autoComplete="family-name" />
              <Input label="GarudaMiles number (optional)" value={p.milesId ?? ''} onChange={(e) => update({ passenger: { ...p, milesId: e.target.value } })} placeholder="GA-00000000" hint={`Earn about ${flight.milesEarn.toLocaleString()} miles on this flight`} />
            </section>

            <section className="card overflow-hidden">
              <button type="button" onClick={() => setContactOpen((o) => !o)} aria-expanded={contactOpen} className="w-full flex items-center justify-between p-4 text-left">
                <span>
                  <span className="block text-[14px] font-bold text-ink">Contact details</span>
                  <span className="block text-[12px] text-ink-muted mt-0.5">{p.email || 'Email and phone for your e-ticket'}</span>
                </span>
                <ChevronDown className={cn('h-5 w-5 text-ink-muted transition-transform', contactOpen && 'rotate-180')} />
              </button>
              {contactOpen && (
                <div className="px-4 pb-4 space-y-3.5 animate-fade-in">
                  <Input label="Email" type="email" value={p.email} onChange={(e) => update({ passenger: { ...p, email: e.target.value } })} placeholder="name@example.com" autoComplete="email" />
                  <Input label="Mobile number" type="tel" value={p.phone} onChange={(e) => update({ passenger: { ...p, phone: e.target.value } })} placeholder="+62" autoComplete="tel" />
                </div>
              )}
            </section>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-fade-up">
            <section className="card p-4">
              <div className="flex items-start gap-3">
                <span className="h-11 w-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                  <Armchair className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-ink">Seat selection</p>
                  <p className="text-[12px] text-ink-muted mt-0.5">
                    {draft.seat ? (
                      <>
                        Seat <span className="font-semibold text-ink">{draft.seat}</span> · {seatType(draft.seat)} · included with {fare.name}
                      </>
                    ) : (
                      'Choose now or pick a seat at check-in. Standard seats are included.'
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant={draft.seat ? 'secondary' : 'primary'} size="sm" full onClick={() => setSeatSheet(true)}>
                  {draft.seat ? 'Change seat' : 'Choose seat'}
                </Button>
                {draft.seat ? (
                  <Button variant="ghost" size="sm" onClick={() => update({ seat: null })}>
                    Select later
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                    Select at check-in
                  </Button>
                )}
              </div>
            </section>

            <section>
              <p className="t-label mb-2">Optional add-ons</p>
              <div className="card divide-y divide-surface-line">
                {ADD_ONS.map((a) => (
                  <div key={a.id} className="px-4 py-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-ink">{a.label}</p>
                      <p className="text-[12px] text-ink-muted">{a.description}</p>
                      <p className="text-[12px] font-semibold text-brand-navy mt-0.5">+ {formatRupiah(a.price)}</p>
                    </div>
                    <Toggle checked={draft.addOns.includes(a.id)} onChange={() => toggleAddOn(a.id)} ariaLabel={a.label} />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-ink-faint mt-2">Add-on prices are demo values.</p>
            </section>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <section className="card p-4">
              <p className="t-label mb-2">Price summary</p>
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-ink-soft">
                    {fare.name} × {adults}
                  </span>
                  <span className="font-semibold">{formatRupiah(farePrice)}</span>
                </div>
                {draft.addOns.map((id) => {
                  const a = ADD_ONS.find((x) => x.id === id)!
                  return (
                    <div key={id} className="flex justify-between">
                      <span className="text-ink-soft">{a.label}</span>
                      <span className="font-semibold">{formatRupiah(a.price)}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between">
                  <span className="text-ink-soft">Taxes & fees</span>
                  <span className="font-semibold">{formatRupiah(taxes)}</span>
                </div>
                <div className="flex justify-between pt-2 mt-1 border-t border-surface-line text-[15px]">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-brand-navy">{formatRupiah(total)}</span>
                </div>
              </div>
            </section>

            <section>
              <p className="t-label mb-2">Payment method</p>
              <div className="space-y-2" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map((m) => (
                  <RadioRow
                    key={m.id}
                    icon={PAY_ICONS[m.id as keyof typeof PAY_ICONS]}
                    checked={draft.paymentMethod === m.id}
                    onSelect={() => update({ paymentMethod: m.id })}
                    title={m.label}
                    description={m.detail}
                  />
                ))}
              </div>
            </section>

            <Checkbox
              checked={agree}
              onChange={setAgree}
              label={
                <>
                  I agree to Garuda Indonesia’s <span className="font-semibold text-brand-blue">conditions of carriage</span> and <span className="font-semibold text-brand-blue">fare rules</span>.
                </>
              }
            />
            <p className="text-[11px] text-ink-faint inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> No real payment is processed in this prototype.
            </p>
          </div>
        )}
      </PageContainer>

      <StickyCTA>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-ink-muted">Total</p>
          <p className="text-[18px] font-bold text-brand-navy leading-tight">{formatRupiah(total)}</p>
        </div>
        {step < 2 ? (
          <Button size="lg" className="px-6" disabled={step === 0 && !passengerValid} onClick={() => setStep((s) => s + 1)} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Continue
          </Button>
        ) : (
          <Button size="lg" className="px-6" disabled={!draft.paymentMethod || !agree} onClick={pay} leftIcon={<ShieldCheck className="h-4 w-4" />}>
            Pay {formatRupiah(total).replace('Rp ', 'Rp')}
          </Button>
        )}
      </StickyCTA>

      <BottomSheet
        open={seatSheet}
        onClose={() => setSeatSheet(false)}
        title="Choose your seat"
        subtitle={`${flight.aircraft} · Economy rows 14 – 25`}
        height="full"
        footer={
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] text-ink-muted">Selected</p>
              <p className="text-[16px] font-bold text-ink">{draft.seat ? `${draft.seat} · ${seatType(draft.seat)}` : 'None'}</p>
            </div>
            <Button size="lg" disabled={!draft.seat} onClick={() => setSeatSheet(false)}>
              Confirm Seat
            </Button>
          </div>
        }
      >
        <SeatLegend />
        <SeatMap selected={draft.seat} onSelect={(seat) => update({ seat })} seed={flight.number} className="mt-4" />
      </BottomSheet>

      <Modal open={processing} onClose={() => undefined} dismissible={false}>
        <div className="flex flex-col items-center text-center py-4">
          <span className="relative h-16 w-16 mb-4">
            <span className="absolute inset-0 rounded-full border-4 border-surface-soft" />
            <span className="absolute inset-0 rounded-full border-4 border-brand-turquoise border-t-transparent animate-spin" />
          </span>
          <p className="t-h3">Processing payment</p>
          <p className="t-caption mt-1">Securing your seat with Garuda Indonesia…</p>
        </div>
      </Modal>
    </div>
  )
}
