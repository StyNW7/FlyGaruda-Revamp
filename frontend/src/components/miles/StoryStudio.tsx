import { Check, RotateCcw } from 'lucide-react'
import { DEFAULT_SHARE, useApp, type ShareFormat, type ShareMascot, type ShareOptions, type ShareTheme } from '../../store/AppContext'
import { SHARE_THEMES } from '../../utils/storyCard'
import { Toggle } from '../common/Inputs'
import { cn } from '../../utils/cn'

const MASCOTS: { id: ShareMascot; label: string }[] = [
  { id: 'wave', label: 'Wave' },
  { id: 'hi', label: 'Hello' },
  { id: 'love', label: 'Love' },
  { id: 'respect', label: 'Pilot' },
  { id: 'chill', label: 'Chill' },
  { id: 'baggage', label: 'Explorer' },
  { id: 'none', label: 'None' },
]

const SWATCHES = ['#0C265D', '#008295', '#1179B7', '#C9A24B', '#B8442F', '#5B2A86', '#0F5132', '#1F1F1F']

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="t-label">{title}</p>
        {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function ColourField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex-1 flex items-center gap-2.5 rounded-xl border border-surface-line bg-white px-3 py-2 cursor-pointer">
      <span className="relative h-8 w-8 rounded-full ring-2 ring-white shadow-card shrink-0" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} colour`} className="absolute inset-0 h-full w-full opacity-0 cursor-pointer" />
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold text-ink">{label}</span>
        <span className="block font-mono text-[10.5px] text-ink-muted uppercase">{value}</span>
      </span>
    </label>
  )
}

/** Every option the traveller can tweak on the shareable passport image. Persisted in app state. */
export function StoryStudio({ headlinePresets = [] }: { headlinePresets?: string[] }) {
  const { state, dispatch } = useApp()
  const o = state.share
  const set = (patch: Partial<ShareOptions>) => dispatch({ type: 'SET_SHARE', patch })
  const setCustom = (patch: Partial<ShareOptions['custom']>) => set({ theme: 'custom', custom: { ...o.custom, ...patch } })

  return (
    <div className="space-y-4">
      <Section title="Format">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Image format">
          {(
            [
              { id: 'story', label: 'Story', sub: '9:16 · 1080 × 1920' },
              { id: 'square', label: 'Feed post', sub: '1:1 · 1080 × 1080' },
            ] as { id: ShareFormat; label: string; sub: string }[]
          ).map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={o.format === f.id} onClick={() => set({ format: f.id })} className={cn('flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left', o.format === f.id ? 'border-brand-navy bg-white' : 'border-surface-line bg-white/70 text-ink-muted')}>
              <span className={cn('rounded-[4px] bg-brand-navy/80 shrink-0', f.id === 'story' ? 'h-7 w-4' : 'h-6 w-6')} />
              <span>
                <span className={cn('block text-[13px] font-semibold', o.format === f.id ? 'text-ink' : 'text-ink-soft')}>{f.label}</span>
                <span className="block text-[10.5px] text-ink-muted">{f.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Theme" hint="or pick your own colours below">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Story theme">
          {SHARE_THEMES.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={o.theme === t.id} onClick={() => set({ theme: t.id as ShareTheme })} className={cn('inline-flex items-center gap-2 rounded-full border pl-1.5 pr-3 h-9 text-[12px] font-semibold transition-colors', o.theme === t.id ? 'border-brand-navy bg-white text-ink' : 'border-surface-line bg-white text-ink-muted')}>
              <span className="h-6 w-6 rounded-full ring-2 ring-white shadow-card" style={{ background: `linear-gradient(135deg, ${t.stops[0]}, ${t.stops[2]})` }} />
              {t.label}
            </button>
          ))}
          <button type="button" role="radio" aria-checked={o.theme === 'custom'} onClick={() => set({ theme: 'custom' })} className={cn('inline-flex items-center gap-2 rounded-full border pl-1.5 pr-3 h-9 text-[12px] font-semibold transition-colors', o.theme === 'custom' ? 'border-brand-navy bg-white text-ink' : 'border-surface-line bg-white text-ink-muted')}>
            <span className="h-6 w-6 rounded-full ring-2 ring-white shadow-card" style={{ background: `linear-gradient(135deg, ${o.custom.primary}, ${o.custom.secondary})` }} />
            Custom
          </button>
        </div>
        <div className={cn('mt-2.5 rounded-2xl border p-3 space-y-2.5 transition-colors', o.theme === 'custom' ? 'border-brand-navy/30 bg-brand-blue-light/30' : 'border-surface-line bg-surface-off')}>
          <div className="flex gap-2">
            <ColourField label="Primary" value={o.custom.primary} onChange={(v) => setCustom({ primary: v })} />
            <ColourField label="Secondary" value={o.custom.secondary} onChange={(v) => setCustom({ secondary: v })} />
            <ColourField label="Accent" value={o.custom.accent} onChange={(v) => setCustom({ accent: v })} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-ink-muted mr-1">Quick swatches</span>
            {SWATCHES.map((c) => (
              <button key={c} type="button" aria-label={`Use ${c} as primary`} onClick={() => setCustom({ primary: c, secondary: shade(c, -0.45) })} className={cn('h-6 w-6 rounded-full ring-2 ring-white shadow-card', o.theme === 'custom' && o.custom.primary.toLowerCase() === c.toLowerCase() && 'outline outline-2 outline-brand-navy outline-offset-1')} style={{ background: c }} />
            ))}
          </div>
        </div>
      </Section>

      <Section title="Mascot">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5" role="radiogroup" aria-label="Mascot">
          {MASCOTS.map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={o.mascot === m.id} onClick={() => set({ mascot: m.id })} className={cn('shrink-0 w-16 rounded-xl border p-1.5 flex flex-col items-center gap-1', o.mascot === m.id ? 'border-brand-navy bg-white' : 'border-surface-line bg-white/70')}>
              <span className="h-10 w-10 rounded-lg bg-surface-off flex items-center justify-center overflow-hidden">
                {m.id === 'none' ? <span className="text-[10px] font-bold text-ink-faint">—</span> : <img src={`/mascot/${m.id}.png`} alt="" className="h-10 w-10 object-contain" />}
              </span>
              <span className={cn('text-[10.5px] font-semibold', o.mascot === m.id ? 'text-ink' : 'text-ink-muted')}>{m.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Words">
        <div className="space-y-2">
          {headlinePresets.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
              <button type="button" onClick={() => set({ headline: '' })} className={cn('shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold border', !o.headline ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-surface-line text-ink-soft')}>
                My stats
              </button>
              {headlinePresets.map((h) => (
                <button key={h} type="button" onClick={() => set({ headline: h })} className={cn('shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold border', o.headline === h ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-surface-line text-ink-soft')}>
                  {h}
                </button>
              ))}
            </div>
          )}
          <input value={o.headline} onChange={(e) => set({ headline: e.target.value.slice(0, 60) })} placeholder="Headline · leave empty to use your stats" aria-label="Headline" className="w-full h-11 rounded-xl border border-surface-line bg-white px-3.5 text-[14px] outline-none focus:border-brand-blue" />
          <input value={o.caption} onChange={(e) => set({ caption: e.target.value.slice(0, 80) })} placeholder="Caption · e.g. Next stop: Tokyo" aria-label="Caption" className="w-full h-11 rounded-xl border border-surface-line bg-white px-3.5 text-[14px] outline-none focus:border-brand-blue" />
        </div>
      </Section>

      <Section title="Show on the card">
        <div className="card divide-y divide-surface-line overflow-hidden">
          {(
            [
              { key: 'showStats', label: 'Stats tiles', description: 'Flights, destinations, distance, miles' },
              { key: 'showMap', label: 'Route map', description: o.format === 'square' ? 'Story format only' : 'Arcs from Jakarta to every city' },
              { key: 'showStamps', label: 'Destination stamps' },
              { key: 'showBadges', label: 'Badges earned' },
              { key: 'showMemberId', label: 'GarudaMiles number', description: 'Turn off to keep it private' },
            ] as { key: keyof ShareOptions; label: string; description?: string }[]
          ).map((row) => (
            <div key={row.key} className="px-3.5 py-2.5">
              <Toggle label={row.label} description={row.description} checked={Boolean(o[row.key])} onChange={(v) => set({ [row.key]: v } as Partial<ShareOptions>)} />
            </div>
          ))}
        </div>
      </Section>

      <button type="button" onClick={() => set(DEFAULT_SHARE)} className="w-full inline-flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-ink-muted hover:text-ink py-1">
        <RotateCcw className="h-3.5 w-3.5" /> Reset to default
      </button>
      <p className="text-[11px] text-ink-faint inline-flex items-center gap-1.5">
        <Check className="h-3 w-3 text-success" /> Your choices are saved for next time.
      </p>
    </div>
  )
}

/** Darkens (negative) or lightens a hex colour by a fraction. */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)))
  const r = ch((n >> 16) & 255)
  const g = ch((n >> 8) & 255)
  const b = ch(n & 255)
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
