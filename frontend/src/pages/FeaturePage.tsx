import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Check, Globe, Heart, Luggage, ShieldCheck, Smartphone, Trash2 } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Toggle } from '../components/common/Inputs'
import { EmptyState } from '../components/common/States'
import { DestinationCard } from '../components/common/Explore'
import { useToast } from '../components/common/Toast'
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

function SettingsToggles({ kind }: { kind: 'notifications' | 'settings' | 'privacy' | 'language' }) {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [local, setLocal] = useState<Record<string, boolean>>({ biometrics: true, analytics: false, location: true, darkMode: false, haptics: true })
  const set = (k: string, v: boolean) => setLocal((l) => ({ ...l, [k]: v }))
  if (kind === 'language') {
    return (
      <section className="card divide-y divide-surface-line overflow-hidden">
        {[
          { id: 'en', label: 'English', note: 'Default' },
          { id: 'id', label: 'Bahasa Indonesia', note: 'Tersedia' },
        ].map((l) => (
          <button key={l.id} type="button" onClick={() => { dispatch({ type: 'SET_LANGUAGE', value: l.id as 'en' | 'id' }); toast(l.id === 'id' ? 'Bahasa dipilih: Bahasa Indonesia (prototype shows English copy)' : 'Language set to English', 'info') }} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
            <Globe className="h-5 w-5 text-brand-navy" />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-ink">{l.label}</span>
              <span className="block text-[12px] text-ink-muted">{l.note}</span>
            </span>
            {state.language === l.id && <Check className="h-5 w-5 text-brand-turquoise" />}
          </button>
        ))}
      </section>
    )
  }
  if (kind === 'notifications') {
    const rows = [
      { key: 'checkin', label: 'Check-in reminders', description: 'When online check-in opens for your flight' },
      { key: 'gate', label: 'Gate & schedule changes', description: 'Instant alerts for any change to your journey' },
      { key: 'boarding', label: 'Boarding reminders', description: '35 minutes before boarding begins' },
      { key: 'miles', label: 'GarudaMiles updates', description: 'Miles credited, tier progress and rewards' },
      { key: 'promo', label: 'Offers & inspiration', description: 'Occasional destination offers' },
      { key: 'whatsapp', label: 'WhatsApp journey updates', description: 'Receive the same reminders on WhatsApp' },
    ]
    return (
      <section className="card divide-y divide-surface-line overflow-hidden">
        {rows.map((r) => (
          <div key={r.key} className="px-4 py-3.5">
            <Toggle label={r.label} description={r.description} checked={r.key === 'whatsapp' ? state.whatsappOptIn : state.notificationPrefs[r.key] ?? true} onChange={(v) => (r.key === 'whatsapp' ? dispatch({ type: 'SET_WHATSAPP', value: v }) : dispatch({ type: 'SET_NOTIFICATION_PREF', key: r.key, value: v }))} />
          </div>
        ))}
      </section>
    )
  }
  if (kind === 'privacy') {
    return (
      <section className="card divide-y divide-surface-line overflow-hidden">
        <div className="px-4 py-3.5"><Toggle label="Biometric sign-in" description="Face ID / fingerprint" checked={local.biometrics} onChange={(v) => set('biometrics', v)} /></div>
        <div className="px-4 py-3.5"><Toggle label="Location for airport guidance" description="Used only for arrival recommendations" checked={local.location} onChange={(v) => set('location', v)} /></div>
        <div className="px-4 py-3.5"><Toggle label="Share usage analytics" description="Help improve FlyGaruda" checked={local.analytics} onChange={(v) => set('analytics', v)} /></div>
        <button type="button" onClick={() => toast('Password reset link sent to your email', 'info')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
          <ShieldCheck className="h-5 w-5 text-brand-navy" />
          <span className="flex-1 text-[14px] font-semibold text-ink">Change password</span>
          <ArrowRight className="h-4 w-4 text-ink-faint" />
        </button>
        <button type="button" onClick={() => toast('2 active devices · iPhone 15, Chrome on Windows', 'info')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
          <Smartphone className="h-5 w-5 text-brand-navy" />
          <span className="flex-1 text-[14px] font-semibold text-ink">Signed-in devices</span>
          <ArrowRight className="h-4 w-4 text-ink-faint" />
        </button>
        <button type="button" onClick={() => toast('Data export will be emailed within 24 hours', 'info')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
          <Trash2 className="h-5 w-5 text-error" />
          <span className="flex-1 text-[14px] font-semibold text-error">Export or delete my data</span>
          <ArrowRight className="h-4 w-4 text-ink-faint" />
        </button>
      </section>
    )
  }
  return (
    <section className="card divide-y divide-surface-line overflow-hidden">
      <div className="px-4 py-3.5"><Toggle label="Haptic feedback" description="Subtle vibration on key actions" checked={local.haptics} onChange={(v) => set('haptics', v)} /></div>
      <div className="px-4 py-3.5"><Toggle label="Dark appearance" description="Coming soon in this prototype" checked={local.darkMode} onChange={(v) => { set('darkMode', v); toast('Dark appearance is planned for a later release', 'info') }} /></div>
      <div className="px-4 py-3.5"><Toggle label="Offline boarding pass" description="Keep passes available without connection" checked onChange={() => toast('Boarding passes are always cached offline', 'info')} /></div>
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

export function FeaturePage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
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
  const custom =
    slug === 'excess-baggage-calculator' ? <BaggageCalculator /> :
    slug === 'notifications' ? <SettingsToggles kind="notifications" /> :
    slug === 'settings' ? <SettingsToggles kind="settings" /> :
    slug === 'privacy-security' ? <SettingsToggles kind="privacy" /> :
    slug === 'language' ? <SettingsToggles kind="language" /> :
    slug === 'wishlist' ? <Wishlist /> : null

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

        {content?.highlights && (
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

        {content?.cta && (
          <Button full size="lg" onClick={() => (content.cta?.to ? navigate(content.cta.to) : toast(content.cta?.message ?? 'Done', 'info'))} rightIcon={<ArrowRight className="h-4 w-4" />}>
            {content.cta.label}
          </Button>
        )}
      </PageContainer>
    </div>
  )
}
