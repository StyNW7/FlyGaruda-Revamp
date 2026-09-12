import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Award, Check, Lock, MapPin, Plane, Route, Share2, Sparkles, Stamp, TrendingUp } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, SectionHeader } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { BottomSheet } from '../components/common/Overlays'
import { ProgressBar } from '../components/common/States'
import { ShareImageSheet } from '../components/common/ShareImageSheet'
import { RouteMap } from '../components/miles/RouteMap'
import { StoryStudio } from '../components/miles/StoryStudio'
import { useApp } from '../store/AppContext'
import { BADGES, PASSPORT_STAMPS } from '../data/miles'
import { SEED_TRIPS } from '../data/trips'
import { getAirport } from '../data/airports'
import { renderPassportStory } from '../utils/storyCard'
import { distanceKm } from '../utils/geo'
import { formatNumber, formatShortDate } from '../utils/format'
import type { AirportCode, Badge, PassportStamp, Trip } from '../types'
import { cn } from '../utils/cn'

const HOME: AirportCode = 'CGK'

function StampMark({ stamp, index, onClick }: { stamp: PassportStamp; index: number; onClick: () => void }) {
  const rot = ['-rotate-6', 'rotate-3', '-rotate-2', 'rotate-6', '-rotate-3', 'rotate-2'][index % 6]
  return (
    <button type="button" onClick={onClick} className={cn('aspect-square rounded-2xl border p-2 flex flex-col items-center justify-center text-center transition-all press', stamp.collected ? 'bg-white border-surface-line shadow-card' : 'bg-surface-off border-dashed border-ink-faint/40')}>
      {stamp.collected ? (
        <div className={cn('h-[68px] w-[68px] rounded-full border-[3px] border-brand-turquoise text-brand-turquoise flex flex-col items-center justify-center relative', rot)}>
          <span className="absolute inset-[5px] rounded-full border border-dashed border-brand-turquoise/50" aria-hidden />
          <span className="text-[7.5px] font-bold uppercase tracking-[0.15em] leading-none">Garuda</span>
          <span className="text-[16px] font-bold leading-tight tracking-wide">{stamp.code}</span>
          <span className="text-[6.5px] font-semibold uppercase tracking-wider leading-none">{stamp.firstVisit}</span>
        </div>
      ) : (
        <div className="h-[68px] w-[68px] rounded-full border-2 border-dashed border-ink-faint/50 text-ink-faint flex items-center justify-center">
          <Lock className="h-5 w-5" />
        </div>
      )}
      <p className={cn('text-[12px] font-bold mt-2', stamp.collected ? 'text-ink' : 'text-ink-muted')}>{stamp.city}</p>
      <p className="text-[10.5px] text-ink-muted">{stamp.collected ? `${stamp.visits} visit${stamp.visits > 1 ? 's' : ''}` : 'Not yet visited'}</p>
    </button>
  )
}

export function PassportPage() {
  const { user, miles, state, pastTrips, dispatch } = useApp()
  const navigate = useNavigate()
  const [share, setShare] = useState(false)
  const [shareHeadline, setShareHeadline] = useState<string | undefined>(undefined)
  const [stamp, setStamp] = useState<PassportStamp | null>(null)
  const [badge, setBadge] = useState<Badge | null>(null)

  /* Stamps are derived from the seeded passport plus any journey completed in the app. */
  const stamps = useMemo(() => {
    const extra = pastTrips.filter((t) => !SEED_TRIPS.some((s) => s.id === t.id))
    return PASSPORT_STAMPS.map((s) => {
      const hits = extra.filter((t) => t.destination === s.code)
      if (hits.length === 0) return s
      const first = hits.sort((a, b) => (a.date < b.date ? -1 : 1))[0]
      return { ...s, collected: true, visits: s.visits + hits.length, firstVisit: s.collected ? s.firstVisit : formatShortDate(first.date).slice(3) }
    })
  }, [pastTrips])
  const collected = stamps.filter((s) => s.collected)
  const locked = stamps.filter((s) => !s.collected)
  const visitedCodes = collected.map((s) => s.code)
  const extraTrips = pastTrips.filter((t) => !SEED_TRIPS.some((s) => s.id === t.id))
  const stats = {
    flights: 8 + extraTrips.length,
    destinations: collected.length,
    distanceKm: 11840 + extraTrips.reduce((s, t) => s + (t.distanceKm ?? distanceKm(t.origin, t.destination)), 0),
    miles: 8250 + extraTrips.reduce((s, t) => s + (t.milesCredited ? t.milesEstimate : 0), 0),
  }
  const routes = visitedCodes.filter((c) => c !== HOME).map((c) => ({ from: HOME, to: c }))
  const badges = useMemo(
    () =>
      BADGES.map((b) => {
        if (b.id === 'nusantara') {
          const cur = Math.max(b.current, collected.filter((s) => s.country === 'Indonesia').length)
          return { ...b, current: cur, earned: cur >= b.target }
        }
        if (b.id === 'global') {
          const cur = Math.max(b.current, collected.filter((s) => s.country !== 'Indonesia').length)
          return { ...b, current: cur, earned: cur >= b.target }
        }
        if (b.id === 'frequent') return { ...b, current: stats.flights, earned: stats.flights >= b.target }
        return b
      }),
    [collected, stats.flights],
  )
  const earnedBadges = badges.filter((b) => b.earned)
  const tripsTo = (code: AirportCode): Trip[] => pastTrips.filter((t) => t.destination === code)

  const highlights = [
    { icon: Route, label: 'Longest flight', value: 'Jakarta → Tokyo', sub: `${formatNumber(distanceKm('CGK', 'HND'))} km · GA 874` },
    { icon: MapPin, label: 'Most visited', value: 'Bali', sub: `${stamps.find((s) => s.code === 'DPS')?.visits ?? 3} visits since Mar 2024` },
    { icon: TrendingUp, label: 'This year', value: `${miles.flightsThisYear} flights`, sub: `${formatNumber(miles.earnedThisYear)} miles earned` },
    { icon: Plane, label: 'First wings', value: 'Mar 2024', sub: 'GA 400 · Jakarta → Bali' },
  ]

  const planTrip = (code: AirportCode) => {
    dispatch({ type: 'SET_SEARCH', search: { origin: HOME, destination: code, tripType: 'round' } })
    setStamp(null)
    navigate('/book')
  }

  const openShare = (headline?: string) => {
    setShareHeadline(headline)
    setBadge(null)
    setShare(true)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <div className="card-navy rounded-none rounded-b-[28px] safe-top relative overflow-hidden">
        <div className="absolute -right-10 -bottom-12 h-44 w-44 rounded-full bg-brand-turquoise/20 blur-2xl" aria-hidden />
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/5" aria-hidden />
        <AppHeader tone="navy" back="/miles" sticky={false} className="bg-transparent" title="My Garuda Passport" right={
          <Button variant="outline-inverse" size="sm" leftIcon={<Share2 className="h-4 w-4" />} onClick={() => openShare()}>
            Share
          </Button>
        } />
        <div className="px-5 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-turquoise-light">Garuda Flight Passport</p>
              <h1 className="text-[22px] font-bold mt-1">{user.name}</h1>
              <p className="font-mono text-[12px] text-white/70 tracking-wider">{user.milesId} · {miles.tier.name}</p>
            </div>
            <Stamp className="h-8 w-8 text-white/40" />
          </div>
          <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { l: 'Flights', v: String(stats.flights) },
              { l: 'Destinations', v: String(stats.destinations) },
              { l: 'Distance', v: `${formatNumber(stats.distanceKm)} km` },
              { l: 'Miles earned', v: formatNumber(stats.miles) },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-white/10 py-2.5 px-1">
                <dt className="text-[9.5px] uppercase tracking-wider text-white/60">{s.l}</dt>
                <dd className="text-[14px] font-bold mt-0.5 leading-tight">{s.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 rounded-2xl bg-white/[0.07] border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 pt-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/60">Routes flown</p>
              <p className="text-[10.5px] text-white/60">Tap a city for details</p>
            </div>
            <RouteMap visited={visitedCodes} locked={locked.map((s) => s.code)} routes={routes} selected={stamp?.code ?? null} onSelect={(code) => setStamp(stamps.find((s) => s.code === code) ?? null)} className="px-1 -mt-1" />
          </div>
        </div>
      </div>

      <PageContainer className="py-4 space-y-5">
        <section>
          <SectionHeader title="Journey highlights" subtitle="Your story with Garuda so far" />
          <div className="grid grid-cols-2 gap-3">
            {highlights.map((h) => (
              <div key={h.label} className="card p-3.5">
                <span className="h-8 w-8 rounded-lg bg-brand-turquoise-soft text-brand-turquoise flex items-center justify-center">
                  <h.icon className="h-4 w-4" />
                </span>
                <p className="t-label mt-2.5">{h.label}</p>
                <p className="text-[14px] font-bold text-ink mt-0.5 leading-tight">{h.value}</p>
                <p className="text-[11px] text-ink-muted mt-0.5">{h.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="t-h2">Destination stamps</h2>
              <p className="t-caption mt-0.5">{collected.length} of {stamps.length} collected · next milestone: Nusantara Explorer</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stamps.map((s, i) => (
              <StampMark key={s.code} stamp={s} index={i} onClick={() => setStamp(s)} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Badges" subtitle={`${earnedBadges.length} of ${badges.length} earned`} />
          <div className="grid grid-cols-2 gap-3">
            {badges.map((b) => (
              <button key={b.id} type="button" onClick={() => setBadge(b)} className={cn('card p-4 text-left press', !b.earned && 'bg-white/80')}>
                <span className={cn('h-11 w-11 rounded-full flex items-center justify-center', b.earned ? 'bg-brand-gold-soft text-[#8A6A1F] ring-2 ring-brand-gold/40' : 'bg-surface-soft text-ink-faint')}>
                  <b.icon className="h-5 w-5" />
                </span>
                <p className="text-[13.5px] font-bold text-ink mt-3">{b.name}</p>
                <p className="text-[11.5px] text-ink-muted mt-0.5 leading-snug">{b.description}</p>
                {b.earned ? (
                  <p className="text-[11px] font-semibold mt-2 inline-flex items-center gap-1 text-success">
                    <Check className="h-3 w-3" /> Earned {b.earnedOn ?? ''}
                  </p>
                ) : (
                  <div className="mt-2">
                    <ProgressBar value={b.current} max={b.target} tone="navy" label={`${b.name} progress`} />
                    <p className="text-[11px] font-semibold text-brand-blue mt-1">{b.current} / {b.target} · in progress</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <Button full size="lg" leftIcon={<Share2 className="h-4 w-4" />} onClick={() => openShare()}>
          Share Journey
        </Button>
        <p className="text-[11px] text-ink-faint text-center pb-2">Creates a real Instagram-story image (1080 × 1920) you can save or share.</p>
      </PageContainer>

      {/* Stamp detail */}
      <BottomSheet
        open={stamp !== null}
        onClose={() => setStamp(null)}
        title={stamp ? `${stamp.city} · ${stamp.code}` : undefined}
        subtitle={stamp ? `${getAirport(stamp.code).name} · ${stamp.country}` : undefined}
        footer={
          stamp ? (
            <Button full rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => planTrip(stamp.code)}>
              {stamp.collected ? (stamp.code === HOME ? 'Search flights from Jakarta' : `Fly to ${stamp.city} again`) : `Plan a trip to ${stamp.city}`}
            </Button>
          ) : undefined
        }
      >
        {stamp && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { l: 'Visits', v: String(stamp.visits) },
                { l: 'First visit', v: stamp.firstVisit },
                { l: 'From Jakarta', v: stamp.code === HOME ? 'Home' : `${formatNumber(distanceKm(HOME, stamp.code))} km` },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-surface-off p-3">
                  <p className="t-label">{s.l}</p>
                  <p className="text-[14px] font-bold text-ink mt-1 leading-tight">{s.v}</p>
                </div>
              ))}
            </div>
            {stamp.collected ? (
              <div>
                <p className="t-label mb-2">Flights to {stamp.city}</p>
                <div className="card divide-y divide-surface-line overflow-hidden">
                  {tripsTo(stamp.code).length === 0 ? (
                    <p className="px-4 py-3 text-[12.5px] text-ink-muted">Flown before this account was linked to FlyGaruda.</p>
                  ) : (
                    tripsTo(stamp.code).map((t) => (
                      <button key={t.id} type="button" onClick={() => { setStamp(null); navigate(`/trips/${t.id}`) }} className="w-full px-4 py-3 flex items-center gap-3 text-left tap">
                        <span className="h-9 w-9 rounded-xl bg-brand-turquoise-soft text-brand-turquoise flex items-center justify-center"><Plane className="h-4 w-4" /></span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-semibold text-ink">{t.flightNumber} · {t.origin} → {t.destination}</span>
                          <span className="block text-[11.5px] text-ink-muted">{formatShortDate(t.date)} · {formatNumber(t.milesEstimate)} miles</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-ink-faint" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-brand-gold-soft border border-brand-gold/30 p-3.5 text-[12.5px] text-ink flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-[#8A6A1F] shrink-0 mt-0.5" />
                <span>
                  Visiting {stamp.city} unlocks this stamp{stamp.country === 'Indonesia' ? ' and completes Nusantara Explorer' : ' and counts towards Global Explorer'}. Estimated earning: about {formatNumber(Math.round(distanceKm(HOME, stamp.code) * 0.75))} miles at your tier.
                </span>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Badge detail */}
      <BottomSheet
        open={badge !== null}
        onClose={() => setBadge(null)}
        title={badge?.name}
        subtitle={badge?.description}
        footer={
          badge ? (
            badge.earned ? (
              <Button full leftIcon={<Share2 className="h-4 w-4" />} onClick={() => openShare(`I just earned the ${badge.name} badge with Garuda Indonesia.`)}>
                Share this badge
              </Button>
            ) : (
              <Button full rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => { setBadge(null); navigate('/book') }}>
                Book a flight to progress
              </Button>
            )
          ) : undefined
        }
      >
        {badge && (
          <div className="flex flex-col items-center text-center">
            <span className={cn('h-20 w-20 rounded-full flex items-center justify-center', badge.earned ? 'bg-brand-gold-soft text-[#8A6A1F] ring-4 ring-brand-gold/30' : 'bg-surface-soft text-ink-faint')}>
              <badge.icon className="h-9 w-9" />
            </span>
            {badge.earned ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-success">
                <Award className="h-4 w-4" /> Earned {badge.earnedOn}
              </p>
            ) : (
              <div className="mt-4 w-full">
                <ProgressBar value={badge.current} max={badge.target} tone="gold" label="Badge progress" />
                <p className="text-[12.5px] text-ink-muted mt-2">
                  <span className="font-semibold text-ink">{badge.current} of {badge.target}</span> · {badge.target - badge.current} more to unlock
                </p>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      <ShareImageSheet
        open={share}
        onClose={() => setShare(false)}
        title="Share your journey"
        subtitle={state.share.format === 'square' ? 'Feed-post card of your Garuda Passport · customise below' : 'Story card of your Garuda Passport · customise below'}
        filename={`garuda-passport-${user.firstName.toLowerCase()}-${state.share.format}-${new Date().getFullYear()}.png`}
        shareTitle="My Garuda Passport"
        shareText={`${stats.destinations} destinations and ${formatNumber(stats.distanceKm)} km flown with Garuda Indonesia. #ActivateTheJourney`}
        aspect={state.share.format}
        debounceMs={350}
        controls={
          <StoryStudio
            headlinePresets={[
              `${miles.flightsThisYear} flights in ${new Date().getFullYear()} so far.`,
              `${earnedBadges.length} badges, ${collected.length} stamps, one passport.`,
              `${formatNumber(stats.distanceKm)} km closer to Platinum.`,
              locked[0] ? `Next stop: ${locked[0].city}.` : 'Where to next?',
            ]}
          />
        }
        render={() =>
          renderPassportStory(
            {
              name: user.name,
              tier: miles.tier.name,
              milesId: user.milesId,
              memberSince: user.memberSince,
              stats,
              stamps: collected.filter((s) => s.code !== HOME).map((s) => ({ code: s.code, city: s.city, firstVisit: s.firstVisit })),
              routes,
              visited: visitedCodes,
              badges: earnedBadges.map((b) => b.name),
              highlights: highlights.map((h) => ({ label: h.label, value: h.value, sub: h.sub })),
            },
            { ...state.share, headline: shareHeadline ?? state.share.headline },
          )
        }
        deps={[state.share, shareHeadline, stats.flights, stats.destinations]}
      />
    </div>
  )
}
