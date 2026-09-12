import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowRight, Compass, Handshake, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import { BottomNav } from '../components/common/BottomNav'
import { DEMO_CREDENTIALS } from '../data/user'

const NAV_ROUTES = [
  /^\/$/,
  /^\/book$/,
  /^\/trips(\/[^/]+)?(\/companion)?$/,
  /^\/miles(\/.*)?$/,
  /^\/more(\/.*)?$/,
  /^\/notifications$/,
  /^\/offers$/,
  /^\/destinations$/,
  /^\/flight-status$/,
  /^\/help$/,
  /^\/profile$/,
  /^\/prototype$/,
  /^\/manage\/[^/]+$/,
]

function showNavFor(pathname: string) {
  return NAV_ROUTES.some((r) => r.test(pathname))
}

/** Desktop-only presentation panel next to the phone viewport. */
function PresentationPanel() {
  return (
    <aside className="hidden xl:flex flex-col justify-center w-[300px] shrink-0 text-ink select-none absolute top-0 bottom-0" style={{ right: 'calc(50% + 215px + 56px)' }}>
      <img src="/brand/mark.png" alt="Garuda Indonesia" className="h-12 w-auto self-start" />
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-turquoise">Prototype</p>
      <h1 className="mt-1 text-[30px] font-bold tracking-[-0.02em] leading-tight text-brand-navy">FlyGaruda</h1>
      <p className="mt-2 text-[14px] text-ink-soft leading-relaxed">
        The redesigned Garuda Indonesia mobile experience for Pillar 1 — <span className="font-semibold text-ink">Activate the Journey</span>.
      </p>
      <ol className="mt-6 space-y-3">
        {[
          { icon: Compass, label: 'Discover the value', note: 'Garuda Value Card' },
          { icon: Sparkles, label: 'Book effortlessly', note: 'FlyGaruda Revamp' },
          { icon: ShieldCheck, label: 'Travel confidently', note: 'Journey Companion' },
        ].map(({ icon: Icon, label, note }, i) => (
          <li key={label} className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-white border border-surface-line flex items-center justify-center text-brand-navy shadow-card">
              <Icon className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold">{label}</p>
              <p className="text-[11.5px] text-ink-muted">{note}</p>
            </div>
            {i < 2 && <ArrowRight className="h-3.5 w-3.5 text-ink-faint ml-auto" />}
          </li>
        ))}
      </ol>
      <div className="mt-8 rounded-xl bg-white border border-surface-line p-4 text-[12px] text-ink-soft shadow-card">
        <p className="font-semibold text-ink mb-1.5">Demo account</p>
        <p className="font-mono text-[11.5px]">{DEMO_CREDENTIALS.email}</p>
        <p className="font-mono text-[11.5px]">{DEMO_CREDENTIALS.password}</p>
        <p className="mt-2 text-ink-muted">More → Prototype Controls to reset or simulate disruptions.</p>
      </div>
    </aside>
  )
}

/** Desktop-only panel on the right: the case competition this prototype was built for and its collaborators. */
function CollaboratorPanel() {
  return (
    <aside className="hidden xl:flex flex-col justify-center w-[300px] shrink-0 text-ink select-none absolute top-0 bottom-0" style={{ left: 'calc(50% + 215px + 56px)' }}>
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-turquoise">
        <Trophy className="h-3.5 w-3.5" /> Case competition entry
      </p>
      <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] leading-tight text-brand-navy">MSS Consulting Case Challenge</h2>
      <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed">
        Built as the working proof-of-concept behind our recommendation for Garuda Indonesia — so the strategy can be <span className="font-semibold text-ink">tapped, booked and travelled</span>, not just presented.
      </p>

      <div className="mt-6 rounded-2xl bg-white border border-surface-line shadow-card p-4">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          <Handshake className="h-3.5 w-3.5" /> In collaboration with
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="h-20 rounded-xl border border-surface-line bg-white flex items-center justify-center overflow-hidden px-3">
            <img src="/collaborator/logo-2.png" alt="MSS FEB UI · Management Student Society" className="h-full w-full object-contain scale-[1.55]" />
          </div>
          <div className="h-20 rounded-xl border border-surface-line bg-white flex items-center justify-center overflow-hidden px-3">
            <img src="/collaborator/logo-1.png" alt="JEC Eye Hospitals and Clinics" className="h-full w-full object-contain scale-[0.95]" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-center text-[10.5px] leading-tight text-ink-muted">
          <span>MSS FEB UI</span>
          <span>JEC Eye Hospitals and Clinics</span>
        </div>
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-ink-faint">
        Academic prototype for presentation purposes. Not affiliated with or endorsed by Garuda Indonesia; all data is illustrative.
      </p>
    </aside>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const showNav = showNavFor(pathname)

  useEffect(() => {
    document.getElementById('app-scroll')?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="relative min-h-[100dvh] flex justify-center bg-[radial-gradient(ellipse_at_top,_#F3F6FA_0%,_#E9EEF3_60%)]">
      <PresentationPanel />
      <CollaboratorPanel />
      <div
        id="app-frame"
        className="relative w-full max-w-[var(--app-max-width)] h-[100dvh] bg-surface-off flex flex-col overflow-hidden md:shadow-[0_0_0_1px_rgba(15,31,61,0.06),0_24px_60px_rgba(15,31,61,0.12)]"
      >
        <div id="app-scroll" className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col">
          <div key={pathname} className="flex-1 flex flex-col animate-fade-in">
            {children}
          </div>
        </div>
        {showNav && <BottomNav />}
      </div>
    </div>
  )
}
