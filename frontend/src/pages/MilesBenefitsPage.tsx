import { useState } from 'react'
import { Check, Crown } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { UnderlineTabs } from '../components/common/Tabs'
import { Button } from '../components/common/Button'
import { BottomSheet } from '../components/common/Overlays'
import { useToast } from '../components/common/Toast'
import { REWARDS, TRAVEL_BENEFITS, MILES_SUMMARY } from '../data/miles'
import { formatNumber } from '../utils/format'
import { cn } from '../utils/cn'

const TIERS = ['Blue', 'Silver', 'Gold', 'Platinum'] as const

export function MilesBenefitsPage() {
  const [tab, setTab] = useState<'travel' | 'rewards'>('travel')
  const [reward, setReward] = useState<(typeof REWARDS)[number] | null>(null)
  const toast = useToast()
  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/miles" title="Benefits & rewards" subtitle="GarudaMiles Silver" />
      <div className="bg-white px-4">
        <UnderlineTabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'travel', label: 'Travel benefits' },
            { id: 'rewards', label: 'Rewards' },
          ]}
        />
      </div>
      <PageContainer className="py-4 space-y-4">
        {tab === 'travel' ? (
          <>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {TIERS.map((t) => (
                <span key={t} className={cn('shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-[12px] font-semibold border', t === 'Silver' ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-ink-muted border-surface-line')}>
                  {t === 'Silver' && <Crown className="h-3.5 w-3.5 text-brand-gold" />}
                  {t}
                </span>
              ))}
            </div>
            <div className="space-y-2.5 animate-fade-up">
              {TRAVEL_BENEFITS.map((b) => (
                <div key={b.title} className="card p-4 flex items-start gap-3">
                  <span className="h-10 w-10 rounded-xl bg-brand-gold-soft text-[#8A6A1F] flex items-center justify-center shrink-0">
                    <b.icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-ink">{b.title}</p>
                    <p className="text-[12.5px] text-ink-muted mt-0.5 leading-snug">{b.description}</p>
                    <p className="text-[11px] font-semibold text-brand-turquoise mt-1.5 inline-flex items-center gap-1">
                      <Check className="h-3 w-3" /> {b.tier}
                    </p>
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-ink-faint px-1">Benefit values are illustrative for this prototype and do not represent current programme rules.</p>
            </div>
          </>
        ) : (
          <div className="space-y-2.5 animate-fade-up">
            <div className="card p-4 flex items-center justify-between">
              <span className="text-[13px] text-ink-muted">Available to redeem</span>
              <span className="text-[18px] font-bold text-brand-navy">{formatNumber(MILES_SUMMARY.balance)} miles</span>
            </div>
            {REWARDS.map((r) => {
              const enough = MILES_SUMMARY.balance >= r.miles
              return (
                <button key={r.title} type="button" onClick={() => setReward(r)} className="w-full card p-4 flex items-center gap-3 text-left press">
                  <span className="h-11 w-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-bold text-ink">{r.title}</span>
                    <span className="block text-[12px] text-ink-muted">{r.description}</span>
                  </span>
                  <span className={cn('text-[11px] font-semibold rounded-full px-2.5 py-1', enough ? 'bg-success-soft text-success' : 'bg-surface-soft text-ink-muted')}>{enough ? 'Available' : `From ${formatNumber(r.miles)}`}</span>
                </button>
              )
            })}
          </div>
        )}
      </PageContainer>

      <BottomSheet open={reward !== null} onClose={() => setReward(null)} title={reward?.title} subtitle={reward?.description} footer={<Button full onClick={() => { toast(`${reward?.title} request submitted`); setReward(null) }}>Redeem from {reward ? formatNumber(reward.miles) : ''} miles</Button>}>
        <div className="rounded-xl bg-surface-off p-3.5 text-[13px] text-ink-soft space-y-1.5">
          <p>Redemptions are confirmed instantly and appear in your activity. Award availability varies by date and route.</p>
          <p className="text-[11.5px] text-ink-muted">Demo flow — no miles are deducted in this prototype.</p>
        </div>
      </BottomSheet>
    </div>
  )
}
