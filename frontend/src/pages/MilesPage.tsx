import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Calculator, ChevronRight, Compass, Crown, Gift, Hourglass, Plane, PlusCircle, Sparkles, Stamp, Ticket, Wifi } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, SectionHeader } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { ProgressBar } from '../components/common/States'
import { Mascot, MascotBanner } from '../components/common/Mascot'
import { ListRow } from '../components/common/ListRow'
import { SegmentedTabs } from '../components/common/Tabs'
import { MilesChart } from '../components/miles/MilesChart'
import { MembershipCard } from '../components/miles/MembershipCard'
import { TierLadder } from '../components/miles/TierLadder'
import { RewardSheet } from '../components/miles/RewardSheet'
import { MilesCalculator } from '../components/miles/MilesCalculator'
import { ActivityRow } from '../components/miles/ActivityRow'
import { useApp } from '../store/AppContext'
import { EARN_PARTNERS, MILES_NEXT, REWARDS, findReward } from '../data/miles'
import type { Reward } from '../types'
import { formatNumber, formatShortDate } from '../utils/format'
import { cn } from '../utils/cn'

function MilesLogin() {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <div className="card-navy rounded-none rounded-b-[28px] safe-top px-5 pt-6 pb-8 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/5" aria-hidden />
        <div className="absolute right-4 bottom-4 h-24 w-24 rounded-full bg-brand-gold/25 blur-2xl" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-turquoise-light">GarudaMiles</p>
        <div className="flex items-end justify-between gap-3 mt-1">
          <div>
            <h1 className="text-[26px] font-bold leading-tight">Every flight takes you further.</h1>
            <p className="text-[13px] text-white/75 mt-2 max-w-[230px]">Earn miles, unlock tiers and redeem rewards across the Garuda network.</p>
          </div>
          <Mascot name="money" size={116} className="shrink-0 -mb-6" />
        </div>
      </div>
      <PageContainer className="py-5 space-y-5">
        <section className="card p-5">
          <h2 className="t-h2">Sign in to GarudaMiles</h2>
          <p className="t-caption mt-1">Use your GarudaMiles number or email. Demo credentials are available on the sign-in screen.</p>
          <Button full size="lg" className="mt-4" onClick={() => navigate('/login', { state: { from: '/miles' } })} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Sign In
          </Button>
          <Button full variant="secondary" className="mt-2" onClick={() => navigate('/login', { state: { from: '/miles', join: true } })}>
            Join GarudaMiles — free
          </Button>
        </section>
        <section>
          <SectionHeader title="Member benefits" subtitle="What Silver, Gold and Platinum unlock" action="Compare tiers" to="/miles/benefits" />
          <div className="card divide-y divide-surface-line overflow-hidden">
            <ListRow icon={Sparkles} iconTone="gold" title="Priority services" description="Priority check-in, boarding and baggage" chevron={false} />
            <ListRow icon={Plane} iconTone="gold" title="Award tickets" description="Jakarta → Bali from 7,500 miles" chevron={false} />
            <ListRow icon={Crown} iconTone="gold" title="Lounge access" description="Garuda Indonesia Lounge on eligible tiers" chevron={false} />
          </div>
        </section>
      </PageContainer>
    </div>
  )
}

function StatTile({ label, value, sub, className, onClick }: { label: string; value: string; sub?: string; className?: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className={cn('card p-3.5 text-left', onClick && 'press', className)}>
      <p className="t-label">{label}</p>
      <p className="text-[20px] font-bold text-ink tracking-tight mt-1 leading-tight">{value}</p>
      {sub && <p className="text-[11.5px] text-ink-muted mt-0.5">{sub}</p>}
    </Tag>
  )
}

function Dashboard() {
  const { user, miles } = useApp()
  const navigate = useNavigate()
  const [range, setRange] = useState<'6' | '12'>('6')
  const [reward, setReward] = useState<Reward | null>(null)
  const [calc, setCalc] = useState(false)
  const nextReward = findReward(MILES_NEXT.flightsProgress.rewardId)

  const quick = [
    { icon: Gift, label: 'Redeem', onClick: () => navigate('/miles/benefits?tab=rewards') },
    { icon: Ticket, label: 'My Rewards', badge: miles.activeVouchers.length || undefined, onClick: () => navigate('/miles/rewards') },
    { icon: Calculator, label: 'Calculator', onClick: () => setCalc(true) },
    { icon: PlusCircle, label: 'Claim miles', onClick: () => navigate('/miles/activity?claim=1') },
  ]

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader large title="GarudaMiles" subtitle={`${user.firstName} · ${miles.tier.name} member`} right={<Button variant="ghost" size="sm" onClick={() => navigate('/miles/activity')}>Activity</Button>} />
      <PageContainer className="py-4 space-y-5">
        <MembershipCard />

        <section aria-label="Quick actions" className="card px-2 py-3">
          <div className="grid grid-cols-4">
            {quick.map((q) => (
              <button key={q.label} type="button" onClick={q.onClick} className="flex flex-col items-center gap-1.5 py-1 press relative">
                <span className="h-12 w-12 rounded-2xl bg-brand-gold-soft text-[#8A6A1F] flex items-center justify-center">
                  <q.icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
                </span>
                {q.badge ? <span className="absolute top-0 right-3 h-5 min-w-[20px] px-1 rounded-full bg-brand-turquoise text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">{q.badge}</span> : null}
                <span className="text-[12px] font-semibold leading-tight text-center text-ink">{q.label}</span>
              </button>
            ))}
          </div>
        </section>

        {miles.expiringMiles > 0 && (
          <button type="button" onClick={() => navigate('/miles/benefits?tab=rewards')} className="w-full flex items-center gap-3 rounded-2xl bg-warning-soft border border-warning/30 p-3.5 text-left press">
            <span className="h-10 w-10 rounded-xl bg-white text-warning flex items-center justify-center shrink-0">
              <Hourglass className="h-5 w-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13.5px] font-bold text-ink">{formatNumber(miles.expiringMiles)} miles expire on {formatShortDate(miles.expiringOn)}</span>
              <span className="block text-[12px] text-ink-soft">Redeem a Wi-Fi pass or lounge voucher before they lapse.</span>
            </span>
            <ChevronRight className="h-4 w-4 text-ink-muted" />
          </button>
        )}

        <TierLadder />

        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Available miles" value={formatNumber(miles.balance)} sub="Ready to redeem" onClick={() => navigate('/miles/benefits?tab=rewards')} />
          <StatTile label="Earned this year" value={formatNumber(miles.earnedThisYear)} sub={`${formatNumber(miles.redeemedThisYear)} redeemed`} onClick={() => navigate('/miles/activity')} />
          <StatTile label="Flights this year" value={String(miles.flightsThisYear)} sub="Garuda & partners" onClick={() => navigate('/trips')} />
          <StatTile label="Destinations" value={String(miles.destinations)} sub="Since joining" onClick={() => navigate('/miles/passport')} />
        </div>

        <section className="card p-4">
          <div className="flex items-start justify-between gap-3 mb-1">
            <SectionHeader title="Miles earned" subtitle={range === '6' ? 'Last six months · flights and partners' : 'Last twelve months'} className="mb-0" />
            <SegmentedTabs value={range} onChange={setRange} items={[{ id: '6', label: '6M' }, { id: '12', label: '12M' }]} className="w-[104px] shrink-0" />
          </div>
          <MilesChart months={range === '6' ? 6 : 12} />
        </section>

        <section className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold-soft to-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[#8A6A1F]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A6A1F]">GarudaMiles Next · preview</p>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-ink inline-flex items-center gap-1.5">
                  <Plane className="h-3.5 w-3.5 text-brand-navy" /> Your progress · {MILES_NEXT.flightsProgress.current} / {MILES_NEXT.flightsProgress.target} flights
                </span>
                <button type="button" onClick={() => nextReward && setReward(nextReward)} className="text-brand-blue font-semibold inline-flex items-center gap-1">
                  <Wifi className="h-3.5 w-3.5" /> Wi-Fi Pass
                </button>
              </div>
              <ProgressBar value={MILES_NEXT.flightsProgress.current} max={MILES_NEXT.flightsProgress.target} tone="navy" className="mt-1.5" label="Flights progress" />
            </div>
            <div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-ink inline-flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-brand-navy" /> Destinations · {MILES_NEXT.destinationProgress.current} / {MILES_NEXT.destinationProgress.target}
                </span>
                <span className="text-ink-muted">Next: {MILES_NEXT.destinationProgress.milestone}</span>
              </div>
              <ProgressBar value={MILES_NEXT.destinationProgress.current} max={MILES_NEXT.destinationProgress.target} tone="turquoise" className="mt-1.5" label="Destinations progress" />
            </div>
          </div>
          <button type="button" onClick={() => navigate('/miles/passport')} className="mt-3 w-full flex items-center justify-between rounded-xl bg-white border border-surface-line px-3.5 py-2.5 text-left press">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
              <Stamp className="h-4 w-4 text-brand-turquoise" /> My Garuda Passport
            </span>
            <ChevronRight className="h-4 w-4 text-ink-faint" />
          </button>
        </section>

        <section>
          <SectionHeader title="Redeem miles" subtitle={`${formatNumber(miles.balance)} miles available`} action="All rewards" to="/miles/benefits?tab=rewards" />
          <div className="grid grid-cols-2 gap-3">
            {REWARDS.slice(0, 4).map((r) => {
              const enough = miles.balance >= r.miles
              return (
                <button key={r.id} type="button" onClick={() => setReward(r)} className="card p-3.5 text-left press">
                  <span className="flex items-center justify-between">
                    <span className="h-9 w-9 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                      <r.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className={cn('text-[10px] font-bold rounded-full px-2 py-0.5', enough ? 'bg-success-soft text-success' : 'bg-surface-soft text-ink-muted')}>{enough ? 'Available' : 'Save up'}</span>
                  </span>
                  <p className="text-[13.5px] font-bold text-ink mt-2.5 leading-snug">{r.title}</p>
                  <p className="text-[11.5px] text-ink-muted mt-0.5 leading-snug">{r.description}</p>
                  <p className="text-[12px] font-bold text-brand-navy mt-1.5">{formatNumber(r.miles)} miles</p>
                </button>
              )
            })}
          </div>
        </section>

        <MascotBanner
          mascot="love"
          tone="turquoise"
          title={`Reward unlocked: ${MILES_NEXT.flightsProgress.current} of ${MILES_NEXT.flightsProgress.target} flights`}
          description="One more Garuda flight and your Complimentary Wi-Fi Pass is yours."
          size={76}
          action={
            <Button size="sm" variant="secondary" onClick={() => navigate('/book')}>
              Book a flight
            </Button>
          }
        />

        <section>
          <SectionHeader title="Recent activity" action="See all" to="/miles/activity" />
          <div className="card divide-y divide-surface-line overflow-hidden">
            {miles.activity.slice(0, 4).map((a) => (
              <ActivityRow key={a.id} activity={a} compact />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Earn more miles" subtitle="Beyond flying" />
          <div className="card divide-y divide-surface-line overflow-hidden">
            {EARN_PARTNERS.map((p) => (
              <ListRow key={p.id} icon={p.icon} iconTone="turquoise" title={p.title} description={p.note} right={<span className="text-[11.5px] font-semibold text-brand-navy text-right whitespace-nowrap">{p.rate}</span>} chevron={false} />
            ))}
          </div>
        </section>
      </PageContainer>

      <RewardSheet reward={reward} onClose={() => setReward(null)} />
      <MilesCalculator open={calc} onClose={() => setCalc(false)} />
    </div>
  )
}

export function MilesPage() {
  const { isMember } = useApp()
  return isMember ? <Dashboard /> : <MilesLogin />
}
