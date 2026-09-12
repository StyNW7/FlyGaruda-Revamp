import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, Download, FileText, Headphones, Mail, MessageCircle, Package, PackageSearch, Phone, PlaneTakeoff, Search, Star } from 'lucide-react'
import { Button } from '../common/Button'
import { Input } from '../common/Inputs'
import { SupportChat } from '../common/SupportChat'
import { EmptyState } from '../common/States'
import { useToast } from '../common/Toast'
import { useApp } from '../../store/AppContext'
import { getAirport } from '../../data/airports'
import { formatMediumDate, formatShortDate, hashString } from '../../utils/format'
import { openExternal, reference, todayISO } from '../../utils/share'
import { cn } from '../../utils/cn'

/* ---------- Feedback ---------- */

export function Feedback() {
  const { state, pastTrips, dispatch } = useApp()
  const toast = useToast()
  const last = pastTrips[0]
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const submitted = last ? state.feedback.find((f) => f.flight === last.flightNumber) : undefined
  const toggle = (t: string) => setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))

  const submit = () => {
    if (!last || rating === 0) return
    dispatch({ type: 'ADD_FEEDBACK', entry: { id: `fb-${Date.now()}`, flight: last.flightNumber, rating, comment: [tags.join(', '), comment.trim()].filter(Boolean).join(' · '), submittedAt: todayISO() } })
    if (rating >= 4) dispatch({ type: 'EARN_MILES', entry: { date: todayISO(), title: 'Thank you for your feedback', subtitle: `${last.flightNumber} · survey bonus`, miles: 100, type: 'bonus' } })
    toast(rating >= 4 ? 'Thank you · 100 bonus miles credited' : 'Thank you — a Garuda team member will follow up')
  }

  if (!last) return <EmptyState mascot="think" title="No recent flights to rate" description="Feedback opens after your next Garuda flight." compact />

  return (
    <section className="card p-4 space-y-4">
      <div>
        <p className="t-label">Your last flight</p>
        <p className="text-[15px] font-bold text-ink mt-1">{last.flightNumber} · {getAirport(last.origin).city} → {getAirport(last.destination).city}</p>
        <p className="text-[12px] text-ink-muted">{formatMediumDate(last.date)} · Seat {last.seat}</p>
      </div>
      {submitted ? (
        <div className="rounded-xl bg-success-soft p-3.5 text-[13px] text-success">
          <p className="font-semibold inline-flex items-center gap-1.5"><Check className="h-4 w-4" /> Feedback sent · {submitted.rating} / 5</p>
          {submitted.comment && <p className="text-ink-soft mt-1">{submitted.comment}</p>}
        </div>
      ) : (
        <>
          <div>
            <p className="text-[13px] font-semibold text-ink mb-2">How was your flight?</p>
            <div className="flex gap-2" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)} className="h-11 w-11 rounded-xl border border-surface-line flex items-center justify-center bg-white press">
                  <Star className={cn('h-6 w-6 transition-colors', n <= rating ? 'text-brand-gold fill-current' : 'text-ink-faint')} />
                </button>
              ))}
            </div>
          </div>
          {rating > 0 && (
            <div className="animate-fade-up space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Cabin crew', 'Meal', 'Seat comfort', 'Punctuality', 'Entertainment', 'Check-in', 'Baggage'].map((t) => (
                  <button key={t} type="button" onClick={() => toggle(t)} className={cn('h-8 px-3 rounded-full text-[12px] font-semibold border', tags.includes(t) ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-surface-line text-ink-soft')}>
                    {t}
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={rating >= 4 ? 'What did we get right?' : 'What could be better?'} rows={3} className="w-full rounded-xl border border-surface-line bg-white px-3.5 py-3 text-[14px] outline-none focus:border-brand-blue resize-none" />
              <Button full onClick={submit}>Send feedback{rating >= 4 ? ' · earn 100 miles' : ''}</Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

/* ---------- Lost & found ---------- */

export function LostAndFound() {
  const { state, pastTrips, dispatch } = useApp()
  const toast = useToast()
  const [flight, setFlight] = useState(pastTrips[0]?.flightNumber ?? '')
  const [seat, setSeat] = useState(pastTrips[0]?.seat ?? '')
  const [item, setItem] = useState('')
  const cases = state.cases.filter((c) => c.kind === 'lost-item')
  const valid = flight.trim().length >= 5 && item.trim().length >= 4

  const submit = () => {
    if (!valid) return
    const ref = reference('LF', flight + item)
    dispatch({ type: 'ADD_CASE', entry: { id: `lf-${Date.now()}`, kind: 'lost-item', title: item.trim(), detail: `${flight.toUpperCase()}${seat ? ` · seat ${seat.toUpperCase()}` : ''}`, reference: ref, status: 'open', submittedAt: todayISO() } })
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `lf-${ref}`, category: 'travel', title: `Lost item report ${ref}`, body: `We are tracing "${item.trim()}" from ${flight.toUpperCase()}. Most items are found within 48 hours.`, time: 'Just now', to: '/more/lost-and-found', iconKey: 'bell' } })
    setItem('')
    toast(`Report submitted · ${ref}`)
  }

  return (
    <>
      {cases.length > 0 && (
        <section>
          <p className="t-label mb-2">Your reports</p>
          <div className="card divide-y divide-surface-line overflow-hidden">
            {cases.map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0"><PackageSearch className="h-4 w-4" /></span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold text-ink">{c.title}</span>
                  <span className="block text-[11.5px] text-ink-muted">{c.detail} · {c.reference} · {formatShortDate(c.submittedAt)}</span>
                </span>
                <span className="text-[11px] font-semibold rounded-full bg-warning-soft text-warning px-2 py-1">Tracing</span>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="card p-4 space-y-3.5">
        <p className="text-[14px] font-bold text-ink">Report a lost item</p>
        <Input label="Flight number" value={flight} onChange={(e) => setFlight(e.target.value.toUpperCase())} placeholder="e.g. GA 418" />
        <Input label="Seat number (optional)" value={seat} onChange={(e) => setSeat(e.target.value.toUpperCase())} placeholder="e.g. 14F" maxLength={4} />
        <Input label="Item description" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Black headphones in a grey case" />
        <Button full disabled={!valid} onClick={submit}>Submit report</Button>
      </section>
    </>
  )
}

/* ---------- Refund tracking ---------- */

export function Refunds() {
  const { state } = useApp()
  const navigate = useNavigate()
  const refunds = state.cases.filter((c) => c.kind === 'refund')
  if (refunds.length === 0) return <EmptyState mascot="chill" title="No refund requests" description="Cancelled bookings appear here with their refund status." compact action={<Button onClick={() => navigate('/trips')}>My trips</Button>} />
  return (
    <div className="space-y-3">
      {refunds.map((r) => {
        const steps = [
          { label: 'Cancellation received', date: formatShortDate(r.submittedAt), done: true },
          { label: 'Refund approved', date: r.status === 'open' ? 'Within 3 working days' : formatShortDate(r.submittedAt), done: r.status !== 'open' },
          { label: 'Funds returned', date: r.status === 'resolved' ? 'Completed' : 'Within 14 working days of approval', done: r.status === 'resolved' },
        ]
        return (
          <section key={r.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] font-bold text-ink">{r.title}</p>
                <p className="text-[12px] text-ink-muted">{r.detail}</p>
                <p className="font-mono text-[11px] text-ink-faint mt-0.5">{r.reference}</p>
              </div>
              <span className={cn('text-[11px] font-semibold rounded-full px-2 py-1 shrink-0', r.status === 'resolved' ? 'bg-success-soft text-success' : r.status === 'in-progress' ? 'bg-brand-blue-light text-brand-blue' : 'bg-warning-soft text-warning')}>{r.status === 'in-progress' ? 'Approved' : r.status === 'resolved' ? 'Completed' : 'Received'}</span>
            </div>
            <ol className="mt-4 space-y-3">
              {steps.map((s, i) => (
                <li key={s.label} className="flex items-start gap-3">
                  <span className="flex flex-col items-center">
                    <span className={cn('h-6 w-6 rounded-full flex items-center justify-center border-2', s.done ? 'bg-brand-turquoise border-brand-turquoise text-white' : 'bg-white border-surface-line text-ink-faint')}>{s.done ? <Check className="h-3 w-3" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />}</span>
                    {i < steps.length - 1 && <span className="w-[2px] h-5 bg-surface-line" />}
                  </span>
                  <span>
                    <span className={cn('block text-[13px] font-semibold', s.done ? 'text-ink' : 'text-ink-muted')}>{s.label}</span>
                    <span className="block text-[11.5px] text-ink-muted">{s.date}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )
      })}
    </div>
  )
}

/* ---------- Contact us ---------- */

export function ContactUs() {
  const [chat, setChat] = useState(false)
  const rows = [
    { icon: MessageCircle, title: 'WhatsApp', description: '+62 811 1000 8888 · average reply 2 minutes', href: 'https://wa.me/6281110008888?text=Hi%20Garuda%2C%20I%20need%20help%20with%20my%20booking', external: true },
    { icon: Phone, title: 'Call centre', description: '+62 21 2351 9999 · 24 hours', href: 'tel:+622123519999' },
    { icon: Mail, title: 'Email', description: 'customer@garuda-indonesia.com', href: 'mailto:customer@garuda-indonesia.com?subject=FlyGaruda%20support' },
  ]
  return (
    <>
      <section className="card divide-y divide-surface-line overflow-hidden">
        <button type="button" onClick={() => setChat(true)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
          <span className="h-10 w-10 rounded-xl bg-brand-turquoise-soft text-brand-turquoise flex items-center justify-center shrink-0"><Headphones className="h-5 w-5" /></span>
          <span className="flex-1"><span className="block text-[14px] font-semibold text-ink">Chat in the app</span><span className="block text-[12px] text-ink-muted">Assistant replies instantly · agents in ~2 min</span></span>
          <ArrowRight className="h-4 w-4 text-ink-faint" />
        </button>
        {rows.map((r) => (
          <a key={r.title} href={r.href} target={r.external ? '_blank' : undefined} rel={r.external ? 'noopener noreferrer' : undefined} onClick={(e) => { if (r.external) { e.preventDefault(); openExternal(r.href) } }} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
            <span className="h-10 w-10 rounded-xl bg-surface-soft text-brand-navy flex items-center justify-center shrink-0"><r.icon className="h-5 w-5" /></span>
            <span className="flex-1"><span className="block text-[14px] font-semibold text-ink">{r.title}</span><span className="block text-[12px] text-ink-muted">{r.description}</span></span>
            <ArrowRight className="h-4 w-4 text-ink-faint" />
          </a>
        ))}
      </section>
      <section className="card p-4">
        <p className="text-[14px] font-bold text-ink mb-2">City offices</p>
        <ul className="space-y-1.5 text-[13px] text-ink-soft">
          {['Jakarta · Garuda City Centre, Soekarno-Hatta · 08:00 – 17:00', 'Surabaya · Jl. Tunjungan 29 · 08:00 – 16:00', 'Denpasar · Jl. Sugianyar 5 · 08:00 – 16:00', 'Makassar · Jl. Slamet Riyadi 6 · 08:00 – 16:00', 'Medan · Jl. Monginsidi 34 · 08:00 – 16:00'].map((o) => (
            <li key={o} className="flex items-start gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-turquoise mt-2 shrink-0" />{o}</li>
          ))}
        </ul>
      </section>
      <SupportChat open={chat} onClose={() => setChat(false)} />
    </>
  )
}

/* ---------- Charter quote ---------- */

export function CharterQuote() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [form, setForm] = useState({ org: '', route: '', date: '', pax: '' })
  const valid = form.org.trim().length >= 2 && form.route.trim().length >= 5 && /^\d{4}-\d{2}-\d{2}$/.test(form.date) && Number(form.pax) > 0
  const quotes = state.cases.filter((c) => c.kind === 'charter')
  const submit = () => {
    if (!valid) return
    const ref = reference('CH', form.org + form.date)
    dispatch({ type: 'ADD_CASE', entry: { id: `ch-${Date.now()}`, kind: 'charter', title: `${form.route.toUpperCase()} · ${form.pax} passengers`, detail: `${form.org.trim()} · ${formatMediumDate(form.date)}`, reference: ref, status: 'open', submittedAt: todayISO() } })
    setForm({ org: '', route: '', date: '', pax: '' })
    toast(`Quote request ${ref} submitted · reply within 2 working days`)
  }
  return (
    <>
      {quotes.length > 0 && (
        <section className="card divide-y divide-surface-line overflow-hidden">
          {quotes.map((q) => (
            <div key={q.id} className="px-4 py-3 flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center"><PlaneTakeoff className="h-4 w-4" /></span>
              <span className="flex-1 min-w-0"><span className="block text-[13px] font-semibold text-ink">{q.title}</span><span className="block text-[11.5px] text-ink-muted">{q.detail} · {q.reference}</span></span>
              <span className="text-[11px] font-semibold rounded-full bg-warning-soft text-warning px-2 py-1">Quoting</span>
            </div>
          ))}
        </section>
      )}
      <section className="card p-4 space-y-3.5">
        <p className="text-[14px] font-bold text-ink">Request a charter quote</p>
        <Input label="Organisation" value={form.org} onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))} placeholder="Company, club or agency" />
        <Input label="Route" value={form.route} onChange={(e) => setForm((f) => ({ ...f, route: e.target.value.toUpperCase() }))} placeholder="e.g. CGK – LOP" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} min={todayISO()} />
          <Input label="Passengers" type="number" inputMode="numeric" value={form.pax} onChange={(e) => setForm((f) => ({ ...f, pax: e.target.value }))} placeholder="e.g. 120" />
        </div>
        <Button full disabled={!valid} onClick={submit}>Request quote</Button>
      </section>
    </>
  )
}

/* ---------- KirimAja tracking ---------- */

export function CargoTracking() {
  const [awb, setAwb] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const valid = /^\d{3}-?\d{8}$/.test(awb.replace(/\s/g, ''))
  const track = () => {
    if (!valid) return
    setResult(awb.replace(/\s/g, ''))
  }
  const h = result ? hashString(result) : 0
  const stage = result ? h % 4 : 0
  const steps = ['Received at Jakarta cargo terminal', 'Departed on GA 412 to Denpasar', 'Arrived Denpasar · customs cleared', 'Out for delivery']
  return (
    <section className="card p-4 space-y-3.5">
      <p className="text-[14px] font-bold text-ink">Track a shipment</p>
      <Input leftIcon={Search} label="Airwaybill number" value={awb} onChange={(e) => { setAwb(e.target.value); setResult(null) }} placeholder="126-12345678" className="font-mono" hint={awb && !valid ? 'Format: 126-12345678' : undefined} />
      <Button full disabled={!valid} onClick={track} leftIcon={<Package className="h-4 w-4" />}>Track</Button>
      {result && (
        <div className="animate-fade-up">
          <p className="font-mono text-[12px] text-ink-muted">AWB {result} · {((h % 18) + 2).toFixed(0)} kg · Jakarta → Denpasar</p>
          <ol className="mt-3 space-y-3">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span className="flex flex-col items-center">
                  <span className={cn('h-6 w-6 rounded-full flex items-center justify-center border-2', i <= stage ? 'bg-brand-turquoise border-brand-turquoise text-white' : 'bg-white border-surface-line text-ink-faint')}>{i <= stage ? <Check className="h-3 w-3" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />}</span>
                  {i < steps.length - 1 && <span className="w-[2px] h-5 bg-surface-line" />}
                </span>
                <span className={cn('text-[13px] font-semibold', i <= stage ? 'text-ink' : 'text-ink-muted')}>{s}{i === stage && <span className="ml-2 text-[10px] font-bold uppercase rounded-full bg-brand-turquoise-soft text-brand-turquoise px-2 py-0.5">Now</span>}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}

/* ---------- Travel documents check ---------- */

export function TravelDocsCheck() {
  const { upcomingTrips } = useApp()
  const navigate = useNavigate()
  const [tripId, setTripId] = useState(upcomingTrips[0]?.id ?? '')
  const trip = upcomingTrips.find((t) => t.id === tripId)
  if (!trip) return <EmptyState mascot="think" title="No upcoming trips" description="Add a trip to check its document requirements." compact action={<Button onClick={() => navigate('/trips')}>My trips</Button>} />
  const intl = getAirport(trip.destination).region === 'international' || getAirport(trip.origin).region === 'international'
  const dest = getAirport(trip.destination)
  const reqs = intl
    ? [
        { label: 'Passport valid 6+ months from arrival', ok: true, note: 'Passport X•••••812 · valid until 2031' },
        { label: dest.code === 'SIN' ? 'SG Arrival Card (within 3 days)' : dest.code === 'HND' || dest.code === 'NRT' ? 'Visit Japan Web registration' : dest.code === 'ICN' ? 'K-ETA approval' : 'Visa or visa waiver', ok: false, note: 'Complete before departure' },
        { label: 'Return or onward ticket', ok: true, note: 'On file with this booking' },
      ]
    : [
        { label: 'KTP, passport or driving licence', ok: true, note: 'KTP verified on your profile' },
        { label: 'Boarding pass on phone or printed', ok: trip.checkedIn, note: trip.checkedIn ? 'Ready in Trips' : 'Issued after check-in' },
        { label: 'Children: birth certificate or family card', ok: true, note: 'Not required · adult traveller' },
      ]
  return (
    <section className="card p-4 space-y-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {upcomingTrips.map((t) => (
          <button key={t.id} type="button" onClick={() => setTripId(t.id)} className={cn('shrink-0 h-9 px-3.5 rounded-full text-[12.5px] font-semibold border', tripId === t.id ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-surface-line text-ink-soft')}>
            {t.flightNumber} · {t.destination}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-surface-off p-3.5">
        <p className="text-[13px] font-bold text-ink">{trip.flightNumber} · {getAirport(trip.origin).city} → {dest.city}</p>
        <p className="text-[12px] text-ink-muted">{formatMediumDate(trip.date)} · {intl ? 'International' : 'Domestic'} journey</p>
      </div>
      <ul className="divide-y divide-surface-line">
        {reqs.map((r) => (
          <li key={r.label} className="py-2.5 flex items-start gap-3">
            <span className={cn('h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5', r.ok ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning')}>{r.ok ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <FileText className="h-3.5 w-3.5" />}</span>
            <span><span className="block text-[13.5px] font-semibold text-ink">{r.label}</span><span className="block text-[12px] text-ink-muted">{r.note}</span></span>
          </li>
        ))}
      </ul>
      <p className={cn('text-[12.5px] font-semibold rounded-xl px-3.5 py-2.5', reqs.every((r) => r.ok) ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning')}>
        {reqs.every((r) => r.ok) ? 'You are ready to travel.' : `${reqs.filter((r) => !r.ok).length} item${reqs.filter((r) => !r.ok).length > 1 ? 's' : ''} to complete before departure.`}
      </p>
    </section>
  )
}

/* ---------- e-Library ---------- */

const LIBRARY = [
  { id: 'colours-sep', title: 'Colours · September 2026', subtitle: 'Bali Beyond the Beaches · 96 pages', size: '48 MB' },
  { id: 'garuda-news', title: 'Garuda News', subtitle: 'New A330-900neo cabin · 12 pages', size: '9 MB' },
  { id: 'menu', title: 'Onboard menu highlights', subtitle: 'This season · 6 pages', size: '4 MB' },
  { id: 'kompas', title: 'Kompas', subtitle: 'Today’s edition', size: '22 MB' },
  { id: 'jakpost', title: 'The Jakarta Post', subtitle: 'Today’s edition', size: '18 MB' },
]

export function ELibrary() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  return (
    <section className="card divide-y divide-surface-line overflow-hidden">
      {LIBRARY.map((b) => {
        const saved = state.savedReads.includes(b.id)
        return (
          <div key={b.id} className="px-4 py-3.5 flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0"><BookOpen className="h-5 w-5" /></span>
            <span className="flex-1 min-w-0">
              <span className="block text-[14px] font-semibold text-ink">{b.title}</span>
              <span className="block text-[12px] text-ink-muted">{b.subtitle} · {b.size}</span>
            </span>
            <Button size="sm" variant={saved ? 'secondary' : 'primary'} leftIcon={saved ? <Check className="h-4 w-4 text-success" /> : <Download className="h-4 w-4" />} onClick={() => { dispatch({ type: 'TOGGLE_SAVED_READ', id: b.id }); toast(saved ? 'Removed from device' : `${b.title} saved for offline reading`, 'info') }}>
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        )
      })}
    </section>
  )
}
