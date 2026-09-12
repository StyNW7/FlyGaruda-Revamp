import { useState } from 'react'
import { Check, Lock, Share2, Stamp } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Overlays'
import { Mascot } from '../components/common/Mascot'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { BADGES, PASSPORT_STAMPS, PASSPORT_STATS } from '../data/miles'
import { formatNumber } from '../utils/format'
import { cn } from '../utils/cn'

function StampMark({ stamp, index }: { stamp: (typeof PASSPORT_STAMPS)[number]; index: number }) {
  const rot = ['-rotate-6', 'rotate-3', '-rotate-2', 'rotate-6', '-rotate-3', 'rotate-2'][index % 6]
  return (
    <div className={cn('aspect-square rounded-2xl border p-2 flex flex-col items-center justify-center text-center transition-all', stamp.collected ? 'bg-white border-surface-line' : 'bg-surface-off border-dashed border-ink-faint/40')}>
      {stamp.collected ? (
        <div className={cn('h-[68px] w-[68px] rounded-full border-[3px] border-brand-turquoise text-brand-turquoise flex flex-col items-center justify-center', rot)}>
          <span className="text-[8px] font-bold uppercase tracking-[0.15em] leading-none">Garuda</span>
          <span className="text-[16px] font-bold leading-tight tracking-wide">{stamp.code}</span>
          <span className="text-[7px] font-semibold uppercase tracking-wider leading-none">{stamp.firstVisit}</span>
        </div>
      ) : (
        <div className="h-[68px] w-[68px] rounded-full border-2 border-dashed border-ink-faint/50 text-ink-faint flex items-center justify-center">
          <Lock className="h-5 w-5" />
        </div>
      )}
      <p className={cn('text-[12px] font-bold mt-2', stamp.collected ? 'text-ink' : 'text-ink-muted')}>{stamp.city}</p>
      <p className="text-[10.5px] text-ink-muted">{stamp.collected ? `${stamp.visits} visit${stamp.visits > 1 ? 's' : ''}` : 'Not yet visited'}</p>
    </div>
  )
}

export function PassportPage() {
  const { user } = useApp()
  const toast = useToast()
  const [share, setShare] = useState(false)
  const collected = PASSPORT_STAMPS.filter((s) => s.collected)
  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/miles" title="My Garuda Passport" right={
        <Button variant="ghost" size="sm" leftIcon={<Share2 className="h-4 w-4" />} onClick={() => setShare(true)}>
          Share
        </Button>
      } />
      <PageContainer className="py-4 space-y-5">
        <section className="card-navy p-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-12 h-44 w-44 rounded-full bg-brand-turquoise/20 blur-2xl" aria-hidden />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-turquoise-light">Garuda Flight Passport</p>
              <h1 className="text-[22px] font-bold mt-1">{user.name}</h1>
              <p className="font-mono text-[12px] text-white/70 tracking-wider">{user.milesId}</p>
            </div>
            <Stamp className="h-8 w-8 text-white/40" />
          </div>
          <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
            {[
              { l: 'Flights', v: String(PASSPORT_STATS.flights) },
              { l: 'Destinations', v: String(PASSPORT_STATS.destinations) },
              { l: 'Distance', v: `${formatNumber(PASSPORT_STATS.distanceKm)} km` },
              { l: 'Miles earned', v: formatNumber(PASSPORT_STATS.milesEarned) },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-white/10 py-2.5 px-1">
                <dt className="text-[9.5px] uppercase tracking-wider text-white/60">{s.l}</dt>
                <dd className="text-[14px] font-bold mt-0.5 leading-tight">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="t-h2">Destination stamps</h2>
              <p className="t-caption mt-0.5">{collected.length} of {PASSPORT_STAMPS.length} collected · next milestone: Nusantara Explorer</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {PASSPORT_STAMPS.map((s, i) => (
              <StampMark key={s.code} stamp={s} index={i} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="t-h2 mb-3">Badges</h2>
          <div className="grid grid-cols-2 gap-3">
            {BADGES.map((b) => (
              <div key={b.id} className={cn('card p-4', !b.earned && 'opacity-90')}>
                <span className={cn('h-11 w-11 rounded-full flex items-center justify-center', b.earned ? 'bg-brand-gold-soft text-[#8A6A1F]' : 'bg-surface-soft text-ink-faint')}>
                  <b.icon className="h-5 w-5" />
                </span>
                <p className="text-[13.5px] font-bold text-ink mt-3">{b.name}</p>
                <p className="text-[11.5px] text-ink-muted mt-0.5 leading-snug">{b.description}</p>
                <p className={cn('text-[11px] font-semibold mt-2 inline-flex items-center gap-1', b.earned ? 'text-success' : 'text-brand-blue')}>
                  {b.earned ? (
                    <>
                      <Check className="h-3 w-3" /> Earned
                    </>
                  ) : (
                    `${b.progress} · in progress`
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Button full size="lg" leftIcon={<Share2 className="h-4 w-4" />} onClick={() => setShare(true)}>
          Share Journey
        </Button>
      </PageContainer>

      <Modal open={share} onClose={() => setShare(false)} title="Share your journey">
        <div className="mx-auto w-[220px] aspect-[9/16] rounded-[22px] card-navy p-4 flex flex-col relative overflow-hidden shadow-float">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-turquoise/25 blur-2xl" aria-hidden />
          <img src="/brand/wordmark-white.png" alt="Garuda Indonesia" className="h-4 w-auto self-start opacity-90" />
          <p className="text-[9px] uppercase tracking-[0.16em] text-brand-turquoise-light mt-4">My Garuda Passport</p>
          <p className="text-[18px] font-bold leading-tight mt-1">{PASSPORT_STATS.destinations} destinations,<br />{formatNumber(PASSPORT_STATS.distanceKm)} km flown.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {collected.map((s) => (
              <span key={s.code} className="rounded-full border border-white/40 px-2 py-0.5 text-[9px] font-bold tracking-wider">
                {s.code}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div>
              <p className="text-[9px] text-white/60">{user.name}</p>
              <p className="text-[9px] text-white/60">GarudaMiles Silver</p>
            </div>
            <Mascot name="wave" size={72} className="-mr-2 -mb-2" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" full onClick={() => setShare(false)}>
            Close
          </Button>
          <Button full onClick={() => { setShare(false); toast('Story card saved to your photos') }}>
            Save image
          </Button>
        </div>
      </Modal>
    </div>
  )
}
