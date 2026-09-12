import { ArrowRight, Heart, MapPin } from 'lucide-react'
import type { Destination, Offer } from '../../types'
import { formatRupiah } from '../../utils/format'
import { useApp } from '../../store/AppContext'
import { Pill } from './StatusBadge'
import { cn } from '../../utils/cn'

const TONES: Record<Destination['tone'], string> = {
  navy: 'from-[#0C265D] to-[#1A4A8F]',
  turquoise: 'from-[#008295] to-[#0FB2BC]',
  blue: 'from-[#1179B7] to-[#4FA8DC]',
  gold: 'from-[#8A6A1F] to-[#C9A24B]',
  deep: 'from-[#071A44] to-[#0C265D]',
}

/** Decorative horizon shapes so destination tiles read as scenery, not empty boxes. */
function Scenery({ variant }: { variant: number }) {
  const v = variant % 4
  return (
    <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
      {v === 0 && (
        <>
          <circle cx="150" cy="40" r="22" fill="white" opacity="0.18" />
          <path d="M0 95 C40 70 70 70 100 88 C130 106 160 100 200 80 L200 120 L0 120 Z" fill="white" opacity="0.14" />
          <path d="M0 105 C50 90 100 95 140 102 C170 107 190 100 200 98 L200 120 L0 120 Z" fill="white" opacity="0.14" />
        </>
      )}
      {v === 1 && (
        <>
          <circle cx="45" cy="38" r="18" fill="white" opacity="0.16" />
          <path d="M0 110 L40 60 L70 90 L110 45 L150 85 L175 65 L200 100 L200 120 L0 120 Z" fill="white" opacity="0.14" />
        </>
      )}
      {v === 2 && (
        <>
          <rect x="120" y="50" width="14" height="60" fill="white" opacity="0.14" />
          <rect x="140" y="35" width="18" height="75" fill="white" opacity="0.18" />
          <rect x="164" y="55" width="12" height="55" fill="white" opacity="0.12" />
          <rect x="100" y="70" width="14" height="40" fill="white" opacity="0.12" />
          <path d="M0 100 C40 96 80 104 200 100 L200 120 L0 120 Z" fill="white" opacity="0.14" />
        </>
      )}
      {v === 3 && (
        <>
          <circle cx="160" cy="45" r="26" fill="white" opacity="0.14" />
          <path d="M0 90 Q50 60 100 90 T200 90 L200 120 L0 120 Z" fill="white" opacity="0.14" />
          <path d="M0 104 Q50 84 100 104 T200 104 L200 120 L0 120 Z" fill="white" opacity="0.12" />
        </>
      )}
    </svg>
  )
}

export function DestinationCard({ destination, onClick, index = 0, className }: { destination: Destination; onClick: () => void; index?: number; className?: string }) {
  const { state, dispatch } = useApp()
  const saved = state.wishlist.includes(destination.code)
  return (
    <div className={cn('relative shrink-0 w-[168px]', className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn('relative w-full h-[200px] rounded-2xl overflow-hidden text-left text-white bg-gradient-to-br shadow-card press', TONES[destination.tone])}
      >
        <Scenery variant={index} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="text-[11px] text-white/80 inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {destination.country}
          </p>
          <p className="text-[19px] font-bold leading-tight">{destination.city}</p>
          <p className="text-[11px] text-white/80 mt-0.5">{destination.tagline}</p>
          <p className="text-[12px] font-semibold mt-2">
            from <span className="text-[13px]">{formatRupiah(destination.priceFrom)}</span>
          </p>
        </div>
      </button>
      <button
        type="button"
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={saved}
        onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', code: destination.code })}
        className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30"
      >
        <Heart className={cn('h-4 w-4', saved && 'fill-white')} />
      </button>
    </div>
  )
}

export function OfferCard({ offer, onClick, className }: { offer: Offer; onClick: () => void; className?: string }) {
  const tones: Record<Offer['tone'], string> = {
    navy: 'card-navy',
    turquoise: 'bg-gradient-to-br from-[#008295] to-[#029AA4] text-white rounded-2xl',
    blue: 'bg-gradient-to-br from-[#1179B7] to-[#2E93CF] text-white rounded-2xl',
    gold: 'bg-gradient-to-br from-[#7A5C15] to-[#C9A24B] text-white rounded-2xl',
  }
  return (
    <button type="button" onClick={onClick} className={cn('relative w-full text-left p-4 overflow-hidden press', tones[offer.tone], className)}>
      <div className="absolute -right-6 -bottom-8 h-28 w-28 rounded-full bg-white/10" aria-hidden />
      <Pill tone="inverse" className="mb-3">
        {offer.tag}
      </Pill>
      <p className="text-[17px] font-bold leading-tight">{offer.title}</p>
      <p className="text-[12px] text-white/80 mt-1 max-w-[240px]">{offer.subtitle}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[12px] text-white/85">
          from <span className="font-bold text-white">{formatRupiah(offer.priceFrom)}</span>
        </span>
        <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  )
}
