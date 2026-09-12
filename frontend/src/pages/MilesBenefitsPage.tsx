import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Crown, Minus, Ticket } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { UnderlineTabs } from '../components/common/Tabs'
import { Chip } from '../components/common/Inputs'
import { Button } from '../components/common/Button'
import { RewardSheet } from '../components/miles/RewardSheet'
import { useApp } from '../store/AppContext'
import { BENEFIT_MATRIX, REWARDS, REWARD_CATEGORIES, TIERS, type RewardCategoryFilter } from '../data/miles'
import type { Reward, TierName } from '../types'
import { formatNumber } from '../utils/format'
import { cn } from '../utils/cn'

export function MilesBenefitsPage() {
  const { miles } = useApp()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'rewards' ? 'rewards' : 'travel'
  const [tier, setTier] = useState<TierName>(miles.tier.name)
  const [category, setCategory] = useState<RewardCategoryFilter>('all')
  const [reward, setReward] = useState<Reward | null>(null)

  const selectedTier = TIERS.find((t) => t.name === tier)!
  const isCurrent = tier === miles.tier.name
  const tierIndex = TIERS.findIndex((t) => t.name === tier)
  const currentIndex = TIERS.findIndex((t) => t.name === miles.tier.name)

  const rewards = useMemo(() => REWARDS.filter((r) => category === 'all' || r.category === category), [category])

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/miles" title="Benefits & rewards" subtitle={`GarudaMiles ${miles.tier.name} · ${formatNumber(miles.balance)} miles`} />
      <div className="bg-white px-4 sticky top-14 z-20 border-b border-surface-line">
        <UnderlineTabs
          value={tab}
          onChange={(v) => setParams(v === 'rewards' ? { tab: 'rewards' } : {}, { replace: true })}
          items={[
            { id: 'travel', label: 'Tier benefits' },
            { id: 'rewards', label: 'Rewards', count: miles.activeVouchers.length },
          ]}
          className="border-b-0"
        />
      </div>
      <PageContainer className="py-4 space-y-4">
        {tab === 'travel' ? (
          <>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {TIERS.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setTier(t.name)}
                  aria-pressed={tier === t.name}
                  className={cn('shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 h-9 text-[12.5px] font-semibold border transition-colors', tier === t.name ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-ink-muted border-surface-line')}
                >
                  {t.name === miles.tier.name && <Crown className="h-3.5 w-3.5" style={{ color: tier === t.name ? '#F1D98A' : t.color }} />}
                  {t.name}
                </button>
              ))}
            </div>

            <section className="card p-4 animate-fade-up" key={tier}>
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-2xl flex items-center justify-center" style={{ background: selectedTier.accent, color: selectedTier.color }}>
                  <Crown className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-[16px] font-bold text-ink">GarudaMiles {tier}</p>
                  <p className="text-[12px] text-ink-muted">
                    {selectedTier.threshold === 0 ? 'Every member starts here' : `From ${formatNumber(selectedTier.threshold)} tier miles a year`} · {selectedTier.bonus}% bonus miles
                  </p>
                </div>
              </div>
              <div className={cn('mt-3 rounded-xl px-3.5 py-2.5 text-[12.5px]', isCurrent ? 'bg-success-soft text-success' : tierIndex > currentIndex ? 'bg-brand-gold-soft text-[#8A6A1F]' : 'bg-surface-off text-ink-muted')}>
                {isCurrent
                  ? 'This is your current tier. Benefits below are active on every Garuda flight.'
                  : tierIndex > currentIndex
                    ? `Earn ${formatNumber(Math.max(0, selectedTier.threshold - miles.tierMiles))} more tier miles by 31 Mar 2027 to reach ${tier}.`
                    : 'A tier you have already passed. Everything here is included in your current status.'}
              </div>
            </section>

            <section className="card divide-y divide-surface-line overflow-hidden animate-fade-up">
              {BENEFIT_MATRIX.map((b) => {
                const v = b.values[tier]
                const included = v !== false
                return (
                  <div key={b.title} className={cn('px-4 py-3.5 flex items-start gap-3', !included && 'opacity-60')}>
                    <span className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', included ? 'bg-brand-gold-soft text-[#8A6A1F]' : 'bg-surface-soft text-ink-faint')}>
                      <b.icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-ink">{b.title}</p>
                      <p className="text-[12px] text-ink-muted mt-0.5 leading-snug">{b.description}</p>
                    </div>
                    <span className={cn('shrink-0 inline-flex items-center gap-1 text-[11.5px] font-semibold rounded-full px-2 py-1', included ? 'bg-success-soft text-success' : 'bg-surface-soft text-ink-faint')}>
                      {v === true ? <Check className="h-3 w-3" strokeWidth={3} /> : v === false ? <Minus className="h-3 w-3" /> : null}
                      {v === true ? 'Included' : v === false ? 'Not included' : v}
                    </span>
                  </div>
                )
              })}
            </section>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10.5px]">
              {TIERS.map((t) => (
                <div key={t.name} className={cn('rounded-xl border p-2', t.name === miles.tier.name ? 'border-brand-navy bg-white' : 'border-surface-line bg-white/60')}>
                  <p className="font-bold text-ink">{t.name}</p>
                  <p className="text-ink-muted">{t.threshold === 0 ? 'Join' : `${t.threshold / 1000}k miles`}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-ink-faint px-1">Benefit values are illustrative for this prototype and do not represent current programme rules.</p>
          </>
        ) : (
          <div className="space-y-3 animate-fade-up">
            <div className="card p-4 flex items-center justify-between">
              <div>
                <span className="text-[13px] text-ink-muted">Available to redeem</span>
                <p className="text-[20px] font-bold text-brand-navy leading-tight">{formatNumber(miles.balance)} miles</p>
              </div>
              <Button variant="secondary" size="sm" leftIcon={<Ticket className="h-4 w-4" />} onClick={() => navigate('/miles/rewards')}>
                My Rewards{miles.activeVouchers.length ? ` · ${miles.activeVouchers.length}` : ''}
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {REWARD_CATEGORIES.map((c) => (
                <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                  {c.label}
                </Chip>
              ))}
            </div>
            <div className="space-y-2.5">
              {rewards.map((r) => {
                const enough = miles.balance >= r.miles
                return (
                  <button key={r.id} type="button" onClick={() => setReward(r)} className="w-full card p-4 flex items-center gap-3 text-left press">
                    <span className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0', enough ? 'bg-brand-blue-light text-brand-blue' : 'bg-surface-soft text-ink-muted')}>
                      <r.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14px] font-bold text-ink leading-snug">{r.title}</span>
                      <span className="block text-[12px] text-ink-muted">{r.description}</span>
                      <span className="block text-[11px] text-ink-faint mt-0.5">{r.validity}</span>
                    </span>
                    <span className="text-right shrink-0">
                      <span className="block text-[13px] font-bold text-brand-navy">{formatNumber(r.miles)}</span>
                      <span className={cn('inline-block text-[10.5px] font-semibold rounded-full px-2 py-0.5 mt-1', enough ? 'bg-success-soft text-success' : 'bg-surface-soft text-ink-muted')}>{enough ? 'Redeem' : `${formatNumber(r.miles - miles.balance)} short`}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-ink-faint px-1">Miles are deducted immediately and a voucher is added to My Rewards. Award availability varies by date and route.</p>
          </div>
        )}
      </PageContainer>

      <RewardSheet reward={reward} onClose={() => setReward(null)} />
    </div>
  )
}
