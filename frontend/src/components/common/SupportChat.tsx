import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Send } from 'lucide-react'
import { BottomSheet } from './Overlays'
import { useApp } from '../../store/AppContext'
import { openExternal } from '../../utils/share'
import { cn } from '../../utils/cn'

interface Msg {
  id: number
  from: 'bot' | 'me'
  text: string
  link?: { label: string; to?: string; href?: string }
  quick?: string[]
}

const QUICK = ['Check-in', 'Baggage', 'Refund status', 'Flight status', 'Talk to an agent']

/** Scripted support assistant — every answer links to the real screen that solves it. */
export function SupportChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, nextTrip, state } = useApp()
  const navigate = useNavigate()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const seq = useRef(0)

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{ id: ++seq.current, from: 'bot', text: `Hi ${user.firstName}, I’m the Garuda assistant. How can I help with your journey today?`, quick: QUICK }])
    }
  }, [open, msgs.length, user.firstName])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, typing])

  const reply = (q: string): Omit<Msg, 'id' | 'from'> => {
    const s = q.toLowerCase()
    if (/check.?in|seat/.test(s)) {
      return nextTrip
        ? nextTrip.checkedIn
          ? { text: `You are already checked in for ${nextTrip.flightNumber} (seat ${nextTrip.seat}). Your boarding pass is ready.`, link: { label: 'Open boarding pass', to: `/boarding-pass/${nextTrip.id}` } }
          : nextTrip.checkInOpen
            ? { text: `Online check-in for ${nextTrip.flightNumber} is open now. It takes under a minute and you can pick your seat.`, link: { label: 'Check in now', to: `/checkin/${nextTrip.id}` } }
            : { text: `Check-in for ${nextTrip.flightNumber} opens 24 hours before departure. I’ll remind you the moment it does.`, link: { label: 'View trip', to: `/trips/${nextTrip.id}` } }
        : { text: 'Online check-in opens 24 hours before departure. Add a trip and I can check you in from there.', link: { label: 'My trips', to: '/trips' } }
    }
    if (/bag|luggage|kg/.test(s)) return { text: 'Every Garuda fare includes 20 kg checked and 7 kg cabin baggage. Silver members get +5 kg. Extra baggage is about 20% cheaper when pre-purchased.', link: { label: 'Baggage information', to: '/more/baggage-information' } }
    if (/refund|cancel/.test(s)) {
      const c = state.cases.find((x) => x.kind === 'refund')
      return c ? { text: `Your refund ${c.reference} is ${c.status.replace('-', ' ')}. ${c.detail}. Funds arrive within 14 working days of approval.`, link: { label: 'Track refund', to: '/more/refund-request' } } : { text: 'Refund eligibility depends on your fare family. Open the booking and choose Cancel to see the estimated refund before confirming.', link: { label: 'My trips', to: '/trips' } }
    }
    if (/status|delay|gate|late/.test(s)) return { text: nextTrip?.disruption ? `${nextTrip.flightNumber} has an update: ${nextTrip.disruption.type === 'gate-change' ? `gate changed to ${nextTrip.disruption.newGate}` : `delayed ${nextTrip.disruption.delayMin} minutes`}. Your boarding pass is already updated.` : 'All your flights are currently on schedule. Live gate and status information is available any time.', link: { label: 'Flight status', to: '/flight-status' } }
    if (/miles|garudamiles|tier|point/.test(s)) return { text: `You have ${state.miles.balance.toLocaleString('en-US')} miles. Flight miles post within 72 hours; missing miles can be claimed from Activity.`, link: { label: 'GarudaMiles', to: '/miles' } }
    if (/agent|human|person|call|phone|whatsapp/.test(s)) return { text: 'Connecting you to a Garuda agent on WhatsApp — average reply time is 2 minutes. You can also call +62 21 2351 9999, 24 hours.', link: { label: 'Open WhatsApp', href: 'https://wa.me/6281110008888?text=Hi%20Garuda%2C%20I%20need%20help%20with%20my%20booking' } }
    if (/lounge/.test(s)) return { text: 'Garuda Indonesia Lounge at Terminal 3 is complimentary for Business Class, Gold and Platinum members, and Rp 175,000 for Silver members.', link: { label: 'Lounge details', to: '/more/lounge' } }
    if (/thank/.test(s)) return { text: 'You’re welcome. Have a wonderful journey with Garuda Indonesia.', quick: QUICK }
    return { text: 'I can help with check-in, baggage, refunds, flight status and GarudaMiles. Pick a topic or tell me more.', quick: QUICK }
  }

  const send = (q: string) => {
    const t = q.trim()
    if (!t) return
    setText('')
    setMsgs((m) => [...m, { id: ++seq.current, from: 'me', text: t }])
    setTyping(true)
    window.setTimeout(() => {
      setMsgs((m) => [...m, { id: ++seq.current, from: 'bot', ...reply(t) }])
      setTyping(false)
    }, 700)
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Chat with Garuda"
      subtitle="Assistant · replies instantly · agents in ~2 min"
      height="tall"
      footer={
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send(text)
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" aria-label="Message" className="flex-1 h-11 rounded-full bg-surface-soft px-4 text-[14px] outline-none focus:ring-2 focus:ring-brand-blue/20" />
          <button type="submit" aria-label="Send" disabled={!text.trim()} className="h-11 w-11 rounded-full bg-brand-navy text-white flex items-center justify-center disabled:bg-surface-soft disabled:text-ink-faint">
            <Send className="h-4 w-4" />
          </button>
        </form>
      }
    >
      <div className="space-y-3 pb-2">
        {msgs.map((m) => (
          <div key={m.id} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug', m.from === 'me' ? 'bg-brand-navy text-white rounded-br-md' : 'bg-surface-soft text-ink rounded-bl-md')}>
              {m.text}
              {m.link && (
                <button
                  type="button"
                  onClick={() => {
                    if (m.link?.href) openExternal(m.link.href)
                    else if (m.link?.to) {
                      onClose()
                      navigate(m.link.to)
                    }
                  }}
                  className="mt-2 w-full inline-flex items-center justify-between rounded-xl bg-white border border-surface-line px-3 py-2 text-[12.5px] font-semibold text-brand-blue"
                >
                  {m.link.label} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              {m.quick && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.quick.map((q) => (
                    <button key={q} type="button" onClick={() => send(q)} className="rounded-full bg-white border border-surface-line px-2.5 py-1 text-[12px] font-semibold text-brand-navy">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex">
            <div className="rounded-2xl rounded-bl-md bg-surface-soft px-3.5 py-2.5 inline-flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-pulse-soft" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </BottomSheet>
  )
}
