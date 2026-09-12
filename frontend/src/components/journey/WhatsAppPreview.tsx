import { useNavigate } from 'react-router-dom'
import { Check, MessageCircle, Phone, Video, MoreVertical } from 'lucide-react'
import { BottomSheet } from '../common/Overlays'
import { Button } from '../common/Button'
import { Toggle } from '../common/Inputs'
import { useApp } from '../../store/AppContext'
import type { Trip } from '../../types'
import { cityOf } from '../../data/airports'

function Bubble({ children, time, actions, onAction }: { children: React.ReactNode; time: string; actions?: string[]; onAction?: (label: string) => void }) {
  return (
    <div className="max-w-[86%]">
      <div className="bg-white rounded-2xl rounded-tl-md shadow-sm px-3.5 py-2.5 text-[13px] text-[#111B21] leading-snug">
        {children}
        <span className="block text-right text-[10px] text-[#667781] mt-1">{time}</span>
      </div>
      {actions && (
        <div className="mt-1 space-y-1">
          {actions.map((a) => (
            <button key={a} type="button" onClick={() => onAction?.(a)} className="w-full bg-white rounded-xl shadow-sm py-2 text-center text-[13px] font-semibold text-[#027EB5] active:bg-[#F0F2F5]">
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Visual-only mock of proactive WhatsApp journey updates. No real WhatsApp APIs are used. */
export function WhatsAppPreview({ open, onClose, trip }: { open: boolean; onClose: () => void; trip: Trip }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const dest = trip.destination === 'DPS' ? 'Bali' : cityOf(trip.destination)
  /** Bubble buttons deep-link into the app, exactly as the real WhatsApp message would. */
  const act = (label: string) => {
    const to: Record<string, string> = {
      'Check In': `/checkin/${trip.id}`,
      'View Trip': `/trips/${trip.id}`,
      'Open Boarding Pass': `/boarding-pass/${trip.id}`,
      'Gate Directions': `/boarding-pass/${trip.id}`,
      'View Updated Journey': `/flight-update/${trip.id}`,
    }
    onClose()
    navigate(to[label] ?? `/trips/${trip.id}`)
  }
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Journey updates on WhatsApp"
      subtitle="Preview of proactive messages · prototype visual only"
      height="tall"
      footer={
        <div className="space-y-3">
          <Toggle
            checked={state.whatsappOptIn}
            onChange={(v) => dispatch({ type: 'SET_WHATSAPP', value: v })}
            label="Receive updates on WhatsApp"
            description={`Messages to ${'+62 812 •••• 7890'}`}
          />
          <Button full onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl overflow-hidden border border-surface-line">
        <div className="bg-[#075E54] text-white px-3 py-2.5 flex items-center gap-3">
          <span className="h-9 w-9 rounded-full bg-white flex items-center justify-center">
            <img src="/brand/mark.png" alt="" className="h-4 w-auto" />
          </span>
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-[14px] font-semibold flex items-center gap-1">
              Garuda Indonesia
              <span className="inline-flex h-3.5 w-3.5 rounded-full bg-[#25D366] items-center justify-center">
                <Check className="h-2.5 w-2.5" strokeWidth={4} />
              </span>
            </p>
            <p className="text-[11px] text-white/80">Official business account</p>
          </div>
          <Video className="h-4 w-4 opacity-80" />
          <Phone className="h-4 w-4 opacity-80" />
          <MoreVertical className="h-4 w-4 opacity-80" />
        </div>
        <div className="bg-[#E5DDD5] px-3 py-4 space-y-3">
          <div className="flex justify-center">
            <span className="text-[10.5px] bg-[#D4E9F7]/90 text-[#3B4A54] rounded-md px-2 py-1">Yesterday</span>
          </div>
          <Bubble time="18:02" actions={['Check In', 'View Trip']} onAction={act}>
            Hi {trip.passengerName.split(' ')[0]}, your flight <strong>{trip.flightNumber.replace(' ', '')}</strong> to {dest} departs tomorrow at{' '}
            <strong>{trip.departTime}</strong> from {trip.terminal}.
            <br />
            <br />
            Online check-in is now available.
          </Bubble>
          <div className="flex justify-center">
            <span className="text-[10.5px] bg-[#D4E9F7]/90 text-[#3B4A54] rounded-md px-2 py-1">Today</span>
          </div>
          <Bubble time="06:10">
            Recommended arrival at {trip.terminal}: <strong>06:15</strong>. Traffic is currently moderate — about 52 minutes from your location.
          </Bubble>
          <Bubble time="07:25" actions={['Open Boarding Pass', 'Gate Directions']} onAction={act}>
            Boarding begins in <strong>25 minutes</strong> at <strong>Gate {trip.gate}</strong>. It is about an 8-minute walk from security.
          </Bubble>
          {trip.disruption && (
            <Bubble time="07:32" actions={['View Updated Journey']} onAction={act}>
              Flight update: {trip.flightNumber.replace(' ', '')} is delayed by <strong>{trip.disruption.delayMin} minutes</strong>. New departure{' '}
              <strong>{trip.disruption.newDepartTime}</strong>, boarding <strong>{trip.disruption.newBoardingTime}</strong>. Your trip has been updated automatically.
            </Bubble>
          )}
        </div>
        <div className="bg-[#F0F2F5] px-3 py-2 flex items-center gap-2">
          <div className="flex-1 h-9 rounded-full bg-white text-[12px] text-[#8696A0] flex items-center px-3">Message</div>
          <span className="h-9 w-9 rounded-full bg-[#00A884] text-white flex items-center justify-center">
            <MessageCircle className="h-4 w-4" />
          </span>
        </div>
      </div>
      <p className="text-[11px] text-ink-faint mt-3 leading-snug">
        Mock preview for the business case. In production, messages would be delivered through the WhatsApp Business Platform.
      </p>
    </BottomSheet>
  )
}
