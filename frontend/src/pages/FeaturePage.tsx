import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Check, Heart, Luggage } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/States'
import { DestinationCard } from '../components/common/Explore'
import { ServiceCatalog } from '../components/features/ServiceCatalog'
import { BidUpgrade, TripService } from '../components/features/TripServices'
import { PaymentMethods, SavedPassengers, SettingsToggles } from '../components/features/AccountFeatures'
import { CargoTracking, CharterQuote, ContactUs, ELibrary, Feedback, LostAndFound, Refunds, TravelDocsCheck } from '../components/features/SupportFeatures'
import { findFeature } from '../data/more'
import { FEATURE_CONTENT } from '../data/featureContent'
import { DESTINATIONS } from '../data/offers'
import { useApp } from '../store/AppContext'
import { formatRupiah } from '../utils/format'
import { cn } from '../utils/cn'

function BaggageCalculator() {
  const [kg, setKg] = useState(10)
  const [route, setRoute] = useState<'domestic' | 'international'>('domestic')
  const rate = route === 'domestic' ? 27500 : 62000
  const total = kg * rate
  return (
    <section className="card p-4 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {(['domestic', 'international'] as const).map((r) => (
          <button key={r} type="button" onClick={() => setRoute(r)} className={cn('h-10 rounded-xl text-[13px] font-semibold border capitalize', route === r ? 'bg-brand-navy text-white border-brand-navy' : 'border-surface-line text-ink-soft')}>
            {r}
          </button>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between text-[13px] mb-2">
          <span className="text-ink-muted inline-flex items-center gap-1.5">
            <Luggage className="h-4 w-4" /> Extra weight
          </span>
          <span className="font-bold text-ink">{kg} kg</span>
        </div>
        <input type="range" min={1} max={40} value={kg} onChange={(e) => setKg(Number(e.target.value))} aria-label="Extra baggage weight" className="w-full accent-brand-turquoise" />
      </div>
      <div className="rounded-xl bg-surface-off p-3.5 flex items-center justify-between">
        <span className="text-[12.5px] text-ink-muted">Estimated cost · {formatRupiah(rate)} per kg</span>
        <span className="text-[18px] font-bold text-brand-navy">{formatRupiah(total)}</span>
      </div>
      <p className="text-[11px] text-ink-faint">Pre-purchase in the app is about 20% cheaper than at the airport. Demo rates.</p>
    </section>
  )
}

function Wishlist() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const saved = DESTINATIONS.filter((d) => state.wishlist.includes(d.code))
  if (saved.length === 0) return <EmptyState mascot="think" title="Your wishlist is empty" description="Tap the heart on any destination to save it here." compact />
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
      {saved.map((d, i) => (
        <DestinationCard key={d.code} destination={d} index={i} onClick={() => { dispatch({ type: 'SET_SEARCH', search: { origin: 'CGK', destination: d.code } }); navigate('/book') }} />
      ))}
    </div>
  )
}

/** Slugs whose main interaction is a purpose-built component (the generic content is rendered around it). */
function customFor(slug: string) {
  switch (slug) {
    case 'excess-baggage-calculator':
      return <BaggageCalculator />
    case 'notifications':
      return <SettingsToggles kind="notifications" />
    case 'settings':
      return <SettingsToggles kind="settings" />
    case 'privacy-security':
      return <SettingsToggles kind="privacy" />
    case 'language':
      return <SettingsToggles kind="language" />
    case 'wishlist':
      return <Wishlist />
    case 'bid-upgrade':
      return <BidUpgrade />
    case 'lounge':
      return <TripService kind="lounge" />
    case 'carbon-offset':
      return <TripService kind="offset" />
    case 'saved-passengers':
      return <SavedPassengers />
    case 'payment-methods':
      return <PaymentMethods />
    case 'feedback':
      return <Feedback />
    case 'lost-and-found':
      return <LostAndFound />
    case 'refund-request':
      return <Refunds />
    case 'contact-us':
      return <ContactUs />
    case 'charter':
      return <CharterQuote />
    case 'kirimaja':
      return <CargoTracking />
    case 'travel-docs':
      return <TravelDocsCheck />
    case 'e-library':
      return <ELibrary />
    default:
      return null
  }
}

/** Slugs where the custom component replaces the generic highlights/CTA (they would duplicate it). */
const REPLACES_CONTENT = new Set(['bid-upgrade', 'lounge', 'carbon-offset', 'saved-passengers', 'payment-methods', 'feedback', 'lost-and-found', 'refund-request', 'contact-us', 'charter', 'kirimaja', 'travel-docs', 'e-library'])

export function FeaturePage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { nextTrip } = useApp()
  const feature = findFeature(slug)
  const content = FEATURE_CONTENT[slug]

  if (!feature) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/more" title="Feature" />
        <EmptyState mascot="think" title="Feature not found" action={<Button onClick={() => navigate('/more')}>Back to More</Button>} />
      </div>
    )
  }

  const Icon = feature.icon
  const custom = customFor(slug)
  const catalog = content?.catalog
  const showGeneric = !REPLACES_CONTENT.has(slug) && !catalog
  const ctaTarget = content?.cta?.to === '/trips' && nextTrip && slug === 'add-on' ? `/manage/${nextTrip.id}` : content?.cta?.to

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/more" title={feature.label} />
      <PageContainer className="py-4 space-y-4">
        <div className="flex items-start gap-3">
          <span className="h-12 w-12 rounded-2xl bg-brand-turquoise-soft text-brand-turquoise flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div className="flex-1">
            <h1 className="t-h1">{feature.label}</h1>
            <p className="t-body mt-1">{content?.intro ?? feature.description}</p>
          </div>
        </div>

        {custom}

        {catalog && <ServiceCatalog kind={catalog.kind} items={catalog.items} unit={catalog.unit} />}

        {showGeneric && content?.highlights && (
          <section className="card divide-y divide-surface-line overflow-hidden">
            {content.highlights.map((h) => (
              <div key={h.title} className="px-4 py-3.5 flex items-start gap-3">
                {slug === 'wishlist' ? <Heart className="h-4 w-4 text-brand-turquoise mt-0.5" /> : <Check className="h-4 w-4 text-brand-turquoise mt-0.5 shrink-0" strokeWidth={2.5} />}
                <div>
                  <p className="text-[14px] font-semibold text-ink">{h.title}</p>
                  <p className="text-[12.5px] text-ink-muted mt-0.5">{h.description}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {content?.sections?.map((s) => (
          <section key={s.title} className="card p-4">
            <p className="text-[14px] font-bold text-ink mb-2">{s.title}</p>
            <ul className="space-y-1.5">
              {s.items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-[13px] text-ink-soft leading-snug">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-turquoise mt-2 shrink-0" />
                  {it}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {content?.note && <p className="text-[11.5px] text-ink-faint px-1">{content.note}</p>}

        {showGeneric && !catalog && content?.cta && ctaTarget && (
          <Button full size="lg" onClick={() => navigate(ctaTarget)} rightIcon={<ArrowRight className="h-4 w-4" />}>
            {content.cta.label}
          </Button>
        )}
      </PageContainer>
    </div>
  )
}
