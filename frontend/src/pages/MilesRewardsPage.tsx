import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Copy, Gift, Plane } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { SegmentedTabs } from '../components/common/Tabs'
import { BottomSheet } from '../components/common/Overlays'
import { EmptyState } from '../components/common/States'
import { QrVisual } from '../components/trips/Codes'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { findReward } from '../data/miles'
import type { Voucher } from '../types'
import { formatNumber, formatShortDate } from '../utils/format'
import { copyText } from '../utils/share'
import { cn } from '../utils/cn'

/** Which trip add-on a service voucher maps to when applied to an upcoming flight. */
const APPLY_AS: Record<string, { addOn: string; patch?: (v: Voucher) => Record<string, unknown> }> = {
  lounge: { addOn: 'lounge' },
  baggage: { addOn: 'baggage10', patch: () => ({ baggageChecked: '30 kg' }) },
  seat: { addOn: 'preferred-seat' },
  wifi: { addOn: 'wifi' },
}

export function MilesRewardsPage() {
  const { miles, upcomingTrips, dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<'active' | 'used'>('active')
  const [open, setOpen] = useState<Voucher | null>(null)
  const list = miles.vouchers.filter((v) => v.status === tab)
  const nextTrip = upcomingTrips[0]

  const applyToTrip = (v: Voucher) => {
    const map = APPLY_AS[v.rewardId]
    if (!map || !nextTrip) return
    dispatch({ type: 'UPDATE_TRIP', id: nextTrip.id, patch: { addOns: [...(nextTrip.addOns ?? []), map.addOn], ...(map.patch?.(v) ?? {}) } })
    dispatch({ type: 'USE_VOUCHER', id: v.id })
    setOpen(null)
    toast(`${v.title} applied to ${nextTrip.flightNumber}`)
  }

  const markUsed = (v: Voucher) => {
    dispatch({ type: 'USE_VOUCHER', id: v.id })
    setOpen(null)
    toast('Voucher marked as used', 'info')
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/miles" title="My Rewards" subtitle={`${miles.activeVouchers.length} active voucher${miles.activeVouchers.length === 1 ? '' : 's'}`} />
      <PageContainer className="py-4 space-y-4">
        <SegmentedTabs value={tab} onChange={setTab} items={[{ id: 'active', label: 'Active', count: miles.activeVouchers.length }, { id: 'used', label: 'Used', count: miles.vouchers.length - miles.activeVouchers.length }]} />

        {list.length === 0 ? (
          <EmptyState
            mascot={tab === 'active' ? 'money' : 'chill'}
            title={tab === 'active' ? 'No active rewards' : 'No used rewards yet'}
            description={tab === 'active' ? `Redeem your ${formatNumber(miles.balance)} miles for lounge access, Wi-Fi passes, upgrades and award tickets.` : 'Vouchers you have used will be listed here.'}
            action={tab === 'active' ? <Button onClick={() => navigate('/miles/benefits?tab=rewards')} leftIcon={<Gift className="h-4 w-4" />}>Browse rewards</Button> : undefined}
          />
        ) : (
          <div className="space-y-3 animate-fade-up">
            {list.map((v) => {
              const reward = findReward(v.rewardId)
              const Icon = reward?.icon ?? Gift
              return (
                <button key={v.id} type="button" onClick={() => setOpen(v)} className={cn('w-full card overflow-hidden text-left press', v.status === 'used' && 'opacity-70')}>
                  <div className="p-4 flex items-center gap-3">
                    <span className="h-11 w-11 rounded-xl bg-brand-gold-soft text-[#8A6A1F] flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14px] font-bold text-ink leading-snug">{v.title}</span>
                      <span className="block text-[12px] text-ink-muted">{v.status === 'active' ? `Valid until ${formatShortDate(v.expires)}` : 'Used'} · {formatNumber(v.miles)} miles</span>
                    </span>
                  </div>
                  <div className="px-4 py-2.5 border-t border-dashed border-surface-line bg-surface-off/70 flex items-center justify-between">
                    <span className="font-mono text-[12px] font-semibold tracking-[0.18em] text-ink">{v.code}</span>
                    <span className="text-[11px] font-semibold text-brand-blue">{v.status === 'active' ? 'Show voucher' : 'Details'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </PageContainer>

      <BottomSheet
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title}
        subtitle={open ? `Issued ${formatShortDate(open.issuedAt)} · ${formatNumber(open.miles)} miles` : undefined}
        footer={
          open && open.status === 'active' ? (
            <div className="flex gap-2">
              {APPLY_AS[open.rewardId] && nextTrip ? (
                <Button full leftIcon={<Plane className="h-4 w-4" />} onClick={() => applyToTrip(open)}>
                  Apply to {nextTrip.flightNumber}
                </Button>
              ) : (
                <Button full leftIcon={<Check className="h-4 w-4" />} onClick={() => markUsed(open)}>
                  Mark as used
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {open && (
          <div className="flex flex-col items-center text-center">
            <div className="rounded-2xl border border-surface-line p-3 bg-white">
              <QrVisual seed={open.code} size={168} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-[20px] font-bold tracking-[0.18em] text-ink">{open.code}</span>
              <button type="button" aria-label="Copy code" onClick={() => copyText(open.code).then((ok) => toast(ok ? 'Voucher code copied' : 'Could not copy', ok ? 'success' : 'warning'))} className="h-8 w-8 rounded-full bg-surface-soft flex items-center justify-center text-brand-navy">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[12px] text-ink-muted mt-1">{open.status === 'active' ? `Valid until ${formatShortDate(open.expires)}` : 'This voucher has been used.'}</p>
            {findReward(open.rewardId) && (
              <ul className="mt-4 w-full rounded-xl bg-surface-off p-3.5 text-left space-y-1.5">
                {findReward(open.rewardId)!.terms.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[12.5px] text-ink-soft leading-snug">
                    <Check className="h-3.5 w-3.5 text-brand-turquoise shrink-0 mt-0.5" strokeWidth={2.5} /> {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
