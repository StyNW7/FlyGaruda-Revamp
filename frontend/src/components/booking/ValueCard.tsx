import { useState } from 'react'
import { Check, ChevronDown, Minus, Sparkles } from 'lucide-react'
import type { Flight } from '../../types'
import { COMPARE_ROWS, VALUE_ITEMS } from '../../data/flights'
import { BottomSheet } from '../common/Overlays'
import { Button } from '../common/Button'
import { Mascot } from '../common/Mascot'
import { Pill } from '../common/StatusBadge'
import { formatRupiah } from '../../utils/format'
import { cn } from '../../utils/cn'

/** "Why Fly Garuda?" — expandable explanation card shown above search results. */
export function WhyGarudaCard({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <section className={cn('card-navy overflow-hidden', className)}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center gap-3 p-4 text-left">
        <span className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-brand-turquoise-light" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-bold">Why fly Garuda?</span>
          <span className="block text-[12px] text-white/70 mt-0.5">Your fare is more than a seat. See what is already included.</span>
        </span>
        <ChevronDown className={cn('h-5 w-5 text-white/70 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {VALUE_ITEMS.map(({ key, title, status, icon: Icon }) => (
              <div key={key} className="rounded-xl bg-white/8 border border-white/10 px-3 py-2.5 flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-brand-turquoise-light shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold leading-tight truncate">{title}</span>
                  <span className="block text-[11px] text-white/60">{status}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] text-white/60 mt-3 leading-snug">Compared with a basic fare where baggage, meals and seats are usually paid separately, a Garuda fare brings the full journey together.</p>
        </div>
      )}
    </section>
  )
}

/** "More Than a Seat" — premium value breakdown bottom sheet. */
export function ValueBreakdownSheet({ open, onClose, flight, onContinue }: { open: boolean; onClose: () => void; flight: Flight | null; onContinue: () => void }) {
  const [compare, setCompare] = useState(false)
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      height="tall"
      footer={
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-ink-muted">Economy from</p>
            <p className="text-[17px] font-bold text-brand-navy leading-tight">{flight ? formatRupiah(flight.prices.saver) : '—'}</p>
          </div>
          <Button size="lg" onClick={onContinue} className="px-6">
            Continue with Garuda
          </Button>
        </div>
      }
    >
      <div className="card-navy -mx-5 -mt-1 px-5 pt-4 pb-5 rounded-t-none rounded-b-[24px] relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-brand-turquoise/20 blur-2xl" aria-hidden />
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-turquoise-light">Garuda Value Card</p>
            <h2 className="text-[26px] font-bold leading-tight mt-1">More Than a Seat</h2>
            <p className="text-[13px] text-white/75 mt-1.5 max-w-[230px]">See what is already included in your Garuda journey.</p>
            {flight && (
              <p className="mt-3 inline-flex items-center gap-2 text-[12px] text-white/80">
                <Pill tone="inverse">{flight.number}</Pill>
                {flight.origin} → {flight.destination} · {flight.departTime}
              </p>
            )}
          </div>
          <Mascot name="chair" size={110} className="shrink-0 -mr-2 -mb-3" />
        </div>
      </div>

      <p className="t-label mt-5 mb-2">Your Garuda fare includes</p>
      <ul className="space-y-2">
        {VALUE_ITEMS.map(({ key, title, description, status, icon: Icon }) => (
          <li key={key} className="card p-3.5 flex items-center gap-3">
            <span className="h-11 w-11 rounded-xl bg-brand-turquoise-soft text-brand-turquoise flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[14px] font-semibold text-ink">{title}</span>
              <span className="block text-[12px] text-ink-muted leading-snug">{description}</span>
            </span>
            <Pill tone={status === 'Selected fares' ? 'blue' : 'success'}>
              <Check className="h-3 w-3" /> {status}
            </Pill>
          </li>
        ))}
      </ul>

      <button type="button" onClick={() => setCompare((c) => !c)} aria-expanded={compare} className="mt-4 w-full flex items-center justify-between rounded-xl bg-surface-off border border-surface-line px-4 py-3 text-left">
        <span>
          <span className="block text-[14px] font-semibold text-ink">Compare what’s included</span>
          <span className="block text-[12px] text-ink-muted">A typical basic fare vs your Garuda fare</span>
        </span>
        <ChevronDown className={cn('h-5 w-5 text-ink-muted transition-transform', compare && 'rotate-180')} />
      </button>
      {compare && (
        <div className="mt-2 card overflow-hidden animate-fade-in">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted bg-surface-off px-3.5 py-2">
            <span>Item</span>
            <span>Basic fare</span>
            <span className="text-brand-navy">Garuda</span>
          </div>
          {COMPARE_ROWS.map((r) => (
            <div key={r.label} className="grid grid-cols-[1.2fr_1fr_1fr] items-center text-[12px] px-3.5 py-2.5 border-t border-surface-line">
              <span className="font-semibold text-ink">{r.label}</span>
              <span className="text-ink-muted inline-flex items-center gap-1">
                <Minus className="h-3 w-3 shrink-0" /> <span className="leading-tight">{r.basic}</span>
              </span>
              <span className="text-success font-semibold inline-flex items-center gap-1">
                <Check className="h-3 w-3 shrink-0" /> <span className="leading-tight">{r.garuda}</span>
              </span>
            </div>
          ))}
          <p className="px-3.5 py-2.5 text-[10.5px] text-ink-faint border-t border-surface-line">Illustrative comparison for the prototype. Inclusions vary by fare family and route.</p>
        </div>
      )}
      <div className="h-2" />
    </BottomSheet>
  )
}
