import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookMarked, ChevronRight, Compass, Crown, Gift, Plane, Sparkles, Stamp, Wifi } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, SectionHeader } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { ProgressBar } from '../components/common/States'
import { Mascot, MascotBanner } from '../components/common/Mascot'
import { ListRow } from '../components/common/ListRow'
import { MilesChart } from '../components/miles/MilesChart'
import { useApp } from '../store/AppContext'
import { MILES_ACTIVITY, MILES_NEXT, MILES_SUMMARY, REWARDS } from '../data/miles'
import { VALUE_ITEMS } from '../data/flights'
import { formatNumber } from '../utils/format'
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
          <Button full variant="secondary" className="mt-2" onClick={() => navigate('/login', { state: { from: '/miles' } })}>
            Join GarudaMiles — free
          </Button>
        </section>
        <section>
          <SectionHeader title="Member benefits" subtitle="What Silver, Gold and Platinum unlock" />
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

function StatTile({ label, value, sub, className }: { label: string; value: string; sub?: string; className?: string }) {
  return (
    <div className={cn('card p-3.5', className)}>
      <p className="t-label">{label}</p>
      <p className="text-[20px] font-bold text-ink tracking-tight mt-1 leading-tight">{value}</p>
      {sub && <p className="text-[11.5px] text-ink-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function Dashboard() {
  const { user } = useApp()
  const navigate = useNavigate()
  const m = MILES_SUMMARY
  const pct = Math.round((m.tierMiles / m.tierTarget) * 100)
  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader large title="GarudaMiles" right={<Button variant="ghost" size="sm" onClick={() => navigate('/miles/activity')}>Activity</Button>} />
      <PageContainer className="py-4 space-y-5">
        <section className="card-navy p-5 relative overflow-hidden" aria-label="Membership card">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/5" aria-hidden />
          <div className="absolute right-0 bottom-0 h-28 w-28 rounded-full bg-brand-gold/20 blur-2xl" aria-hidden />
          <div className="flex items-start justify-between">
            <img src="/brand/mark-white.png" alt="Garuda Indonesia" className="h-6 w-auto" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]">
              <Crown className="h-3.5 w-3.5 text-brand-gold" /> {m.tier}
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/60 mt-6">Miles balance</p>
          <p className="text-[38px] font-bold tracking-tight leading-none mt-1">{formatNumber(m.balance)}</p>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-[14px] font-semibold">{user.name}</p>
              <p className="font-mono text-[12px] text-white/70 tracking-wider">{user.milesId}</p>
            </div>
            <p className="text-[11px] text-white/60 text-right">
              Member since {user.memberSince}
              <br />
              {formatNumber(m.expiringMiles)} miles expire {m.expiringOn}
            </p>
          </div>
        </section>

        <section className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="t-label">Tier progress</p>
              <p className="text-[15px] font-bold text-ink mt-0.5">
                {m.tier} <ArrowRight className="inline h-3.5 w-3.5 text-ink-faint mx-0.5" /> {m.nextTier}
              </p>
            </div>
            <span className="text-[22px] font-bold text-brand-navy">{pct}%</span>
          </div>
          <ProgressBar value={m.tierMiles} max={m.tierTarget} tone="gold" className="mt-3" label="Tier miles progress" />
          <div className="mt-2 flex justify-between text-[12px] text-ink-muted">
            <span>
              <span className="font-semibold text-ink">{formatNumber(m.tierMiles)}</span> / {formatNumber(m.tierTarget)} tier miles
            </span>
            <span>{formatNumber(m.tierTarget - m.tierMiles)} to Gold</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Available miles" value={formatNumber(m.balance)} sub="Ready to redeem" />
          <StatTile label="Tier" value={m.tier} sub={`Next: ${m.nextTier}`} />
          <StatTile label="Flights this year" value={String(m.flightsThisYear)} sub="Garuda & partners" />
          <StatTile label="Destinations" value={String(m.destinations)} sub="Since joining" />
        </div>

        <section className="card p-4">
          <SectionHeader title="Miles earned" subtitle="Last six months · flights and partners" className="mb-1" />
          <MilesChart />
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
                <span className="text-ink-muted inline-flex items-center gap-1">
                  <Wifi className="h-3.5 w-3.5" /> {MILES_NEXT.flightsProgress.reward}
                </span>
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
          <SectionHeader title="Redeem" action="Benefits" to="/miles/benefits" />
          <div className="grid grid-cols-2 gap-3">
            {REWARDS.map((r) => (
              <button key={r.title} type="button" onClick={() => navigate('/miles/benefits')} className="card p-3.5 text-left press">
                <span className="h-9 w-9 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                  <r.icon className="h-[18px] w-[18px]" />
                </span>
                <p className="text-[13.5px] font-bold text-ink mt-2.5">{r.title}</p>
                <p className="text-[11.5px] text-ink-muted mt-0.5 leading-snug">{r.description}</p>
              </button>
            ))}
          </div>
        </section>

        <MascotBanner mascot="love" tone="turquoise" title="Reward unlocked: 2 of 3 flights" description="One more Garuda flight and your Complimentary Wi-Fi Pass is yours." size={76} />

        <section>
          <SectionHeader title="Recent activity" action="See all" to="/miles/activity" />
          <div className="card divide-y divide-surface-line overflow-hidden">
            {MILES_ACTIVITY.slice(0, 3).map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                <span className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', a.type === 'redeem' ? 'bg-surface-soft text-ink-muted' : a.type === 'bonus' ? 'bg-brand-gold-soft text-[#8A6A1F]' : 'bg-brand-turquoise-soft text-brand-turquoise')}>
                  {a.type === 'redeem' ? <Gift className="h-4 w-4" /> : a.type === 'bonus' ? <Sparkles className="h-4 w-4" /> : <Plane className="h-4 w-4" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold text-ink truncate">{a.title}</span>
                  <span className="block text-[11.5px] text-ink-muted">{a.date}</span>
                </span>
                <span className={cn('text-[13px] font-bold tabular-nums', a.miles < 0 ? 'text-ink-muted' : 'text-success')}>
                  {a.miles > 0 ? '+' : ''}
                  {formatNumber(a.miles)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookMarked className="h-4 w-4 text-brand-turquoise" />
            <p className="text-[14px] font-bold text-ink">Earn on every Garuda fare</p>
          </div>
          <p className="text-[12.5px] text-ink-muted">{VALUE_ITEMS[3].description}. Silver members receive a 25% tier bonus.</p>
        </section>
      </PageContainer>
    </div>
  )
}

export function MilesPage() {
  const { isMember } = useApp()
  return isMember ? <Dashboard /> : <MilesLogin />
}
