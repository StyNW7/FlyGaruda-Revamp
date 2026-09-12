import { useState } from 'react'
import { Crown, QrCode, Wallet } from 'lucide-react'
import { BottomSheet } from '../common/Overlays'
import { Button } from '../common/Button'
import { ShareImageSheet } from '../common/ShareImageSheet'
import { BarcodeVisual, QrVisual } from '../trips/Codes'
import { useApp } from '../../store/AppContext'
import { renderMembershipCard } from '../../utils/storyCard'
import { formatNumber } from '../../utils/format'
import { cn } from '../../utils/cn'

const TIER_STYLES: Record<string, { bg: string; glow: string; badge: string }> = {
  Blue: { bg: 'linear-gradient(150deg, #1B5FA8 0%, #0C3D7A 55%, #082C5C 100%)', glow: 'bg-brand-turquoise/30', badge: 'text-white' },
  Silver: { bg: 'linear-gradient(150deg, #10306f 0%, #0c265d 55%, #0a1f4d 100%)', glow: 'bg-brand-gold/20', badge: 'text-brand-gold' },
  Gold: { bg: 'linear-gradient(150deg, #8A6A1F 0%, #5C4413 55%, #2A2110 100%)', glow: 'bg-brand-gold/40', badge: 'text-[#F1D98A]' },
  Platinum: { bg: 'linear-gradient(150deg, #3E4C66 0%, #1F2A40 55%, #0F1626 100%)', glow: 'bg-white/20', badge: 'text-white' },
}

/** Premium membership card with a tappable digital card (barcode + QR) and wallet export. */
export function MembershipCard({ className, compact }: { className?: string; compact?: boolean }) {
  const { user, miles } = useApp()
  const [open, setOpen] = useState(false)
  const [share, setShare] = useState(false)
  const style = TIER_STYLES[miles.tier.name] ?? TIER_STYLES.Silver

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open digital membership card"
        className={cn('w-full text-left rounded-2xl text-white relative overflow-hidden press shadow-float', className)}
        style={{ background: style.bg }}
      >
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/5" aria-hidden />
        <div className="absolute -right-2 top-10 h-64 w-64 rounded-full border border-white/10" aria-hidden />
        <div className={cn('absolute right-0 bottom-0 h-28 w-28 rounded-full blur-2xl', style.glow)} aria-hidden />
        <div className={cn('relative', compact ? 'p-4' : 'p-5')}>
          <div className="flex items-start justify-between">
            <img src="/brand/mark-white.png" alt="Garuda Indonesia" className="h-6 w-auto" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]">
              <Crown className={cn('h-3.5 w-3.5', style.badge)} /> {miles.tier.name}
            </span>
          </div>
          <p className={cn('text-[11px] uppercase tracking-[0.14em] text-white/60', compact ? 'mt-4' : 'mt-6')}>Miles balance</p>
          <p className={cn('font-bold tracking-tight leading-none mt-1', compact ? 'text-[30px]' : 'text-[38px]')}>{formatNumber(miles.balance)}</p>
          <div className={cn('flex items-end justify-between', compact ? 'mt-4' : 'mt-5')}>
            <div>
              <p className="text-[14px] font-semibold">{user.name}</p>
              <p className="font-mono text-[12px] text-white/70 tracking-wider">{user.milesId}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-white/70">
              <QrCode className="h-3.5 w-3.5" /> Tap for digital card
            </span>
          </div>
        </div>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Digital membership card" subtitle="Show at check-in, lounges and partner outlets" footer={
        <div className="flex gap-2">
          <Button variant="secondary" full leftIcon={<Wallet className="h-4 w-4" />} onClick={() => { setOpen(false); setShare(true) }}>
            Save to Wallet
          </Button>
          <Button full onClick={() => setOpen(false)}>Done</Button>
        </div>
      }>
        <div className="rounded-2xl text-white p-5 relative overflow-hidden" style={{ background: style.bg }}>
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/5" aria-hidden />
          <div className="flex items-center justify-between">
            <img src="/brand/mark-white.png" alt="" className="h-6 w-auto" />
            <span className={cn('text-[11px] font-bold uppercase tracking-[0.14em]', style.badge)}>GarudaMiles {miles.tier.name}</span>
          </div>
          <p className="text-[17px] font-bold mt-5">{user.name}</p>
          <p className="font-mono text-[13px] text-white/75 tracking-[0.2em] mt-0.5">{user.milesId}</p>
          <div className="mt-4 rounded-xl bg-white p-3 flex items-center gap-3">
            <QrVisual seed={user.milesId} size={84} />
            <div className="flex-1 min-w-0">
              <BarcodeVisual seed={user.milesId} className="w-full h-10" />
              <p className="font-mono text-[10px] text-ink-muted tracking-[0.25em] text-center mt-1.5">{user.milesId.replace('-', ' ')}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-[11px] text-white/65">
            <span>Member since {user.memberSince}</span>
            <span>{formatNumber(miles.balance)} miles</span>
          </div>
        </div>
        <p className="text-[11.5px] text-ink-faint mt-3 leading-snug">Your membership card works offline. Partner outlets scan the barcode to credit miles instantly.</p>
      </BottomSheet>

      <ShareImageSheet
        open={share}
        onClose={() => setShare(false)}
        title="Save membership card"
        subtitle="A wallet-ready image of your GarudaMiles card"
        filename={`garudamiles-card-${user.milesId}.png`}
        shareTitle="My GarudaMiles card"
        render={() => renderMembershipCard({ name: user.name, tier: miles.tier.name, milesId: user.milesId, memberSince: user.memberSince, balance: miles.balance })}
        deps={[miles.balance, miles.tier.name, user.name]}
      />
    </>
  )
}
