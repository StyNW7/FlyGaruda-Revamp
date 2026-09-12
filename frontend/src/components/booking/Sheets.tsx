import { useMemo, useState } from 'react'
import { Check, MapPin, Search, Star } from 'lucide-react'
import type { AirportCode, CabinClass, Passengers } from '../../types'
import { AIRPORTS, POPULAR_CODES, getAirport } from '../../data/airports'
import { BottomSheet } from '../common/Overlays'
import { Button } from '../common/Button'
import { Stepper } from '../common/Inputs'
import { dayShort, formatMediumDate, monthLabel, parseISODate, toISODate } from '../../utils/format'
import { cn } from '../../utils/cn'

/* ---------- Airport picker ---------- */

export function AirportSheet({
  open,
  onClose,
  title,
  value,
  exclude,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  title: string
  value: AirportCode
  exclude?: AirportCode
  onSelect: (code: AirportCode) => void
}) {
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    return AIRPORTS.filter((a) => !s || a.code.toLowerCase().includes(s) || a.city.toLowerCase().includes(s) || a.name.toLowerCase().includes(s) || a.country.toLowerCase().includes(s))
  }, [q])
  const pick = (code: AirportCode) => {
    onSelect(code)
    setQ('')
    onClose()
  }
  const domestic = results.filter((a) => a.region === 'domestic')
  const intl = results.filter((a) => a.region === 'international')

  return (
    <BottomSheet open={open} onClose={onClose} title={title} height="tall">
      <div className="flex items-center gap-2.5 h-12 rounded-xl bg-surface-soft px-3.5 mb-4 sticky top-0">
        <Search className="h-[18px] w-[18px] text-ink-faint" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search city or airport"
          aria-label="Search city or airport"
          className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink-faint"
        />
      </div>
      {!q && (
        <div className="mb-4">
          <p className="t-label mb-2">Popular</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CODES.filter((c) => c !== exclude).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => pick(code)}
                className={cn('inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-[13px] font-semibold', value === code ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-surface-line text-ink-soft')}
              >
                <Star className="h-3.5 w-3.5" />
                {getAirport(code).city} · {code}
              </button>
            ))}
          </div>
        </div>
      )}
      {[
        { label: 'Indonesia', items: domestic },
        { label: 'International', items: intl },
      ].map(
        (group) =>
          group.items.length > 0 && (
            <div key={group.label} className="mb-3">
              <p className="t-label mb-1.5">{group.label}</p>
              <ul className="divide-y divide-surface-line">
                {group.items.map((a) => {
                  const disabled = a.code === exclude
                  const selected = a.code === value
                  return (
                    <li key={a.code}>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => pick(a.code)}
                        className={cn('w-full flex items-center gap-3 py-3 text-left tap rounded-lg', disabled && 'opacity-40 cursor-not-allowed')}
                      >
                        <span className="h-10 w-10 rounded-xl bg-surface-soft text-brand-navy flex items-center justify-center shrink-0">
                          <MapPin className="h-[18px] w-[18px]" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[14px] font-semibold text-ink">
                            {a.city} <span className="text-ink-muted font-medium">· {a.country}</span>
                          </span>
                          <span className="block text-[12px] text-ink-muted truncate">{a.name}</span>
                        </span>
                        <span className="text-[14px] font-bold text-brand-navy tracking-wide">{a.code}</span>
                        {selected && <Check className="h-4 w-4 text-brand-turquoise" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ),
      )}
      {results.length === 0 && <p className="text-center t-body py-8">No airports match “{q}”.</p>}
    </BottomSheet>
  )
}

/* ---------- Date picker ---------- */

function MonthGrid({ year, month, value, min, onPick }: { year: number; month: number; value: string; min: string; onPick: (iso: string) => void }) {
  const first = new Date(year, month, 1)
  const startDay = first.getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = [...Array<null>(startDay).fill(null), ...Array.from({ length: days }, (_, i) => toISODate(new Date(year, month, i + 1)))]
  return (
    <div className="mb-5">
      <p className="text-[14px] font-bold text-ink mb-2">{monthLabel(year, month)}</p>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="text-[11px] font-semibold text-ink-faint py-1">
            {dayShort(i)}
          </span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`e${i}`} />
          const disabled = iso < min
          const selected = iso === value
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onPick(iso)}
              className={cn(
                'h-10 w-10 mx-auto rounded-full text-[14px] font-medium transition-colors',
                selected ? 'bg-brand-navy text-white font-bold' : disabled ? 'text-ink-faint/60' : 'text-ink hover:bg-surface-soft',
              )}
            >
              {parseISODate(iso).getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DateSheet({ open, onClose, title, value, min = '2026-09-12', onSelect }: { open: boolean; onClose: () => void; title: string; value: string; min?: string; onSelect: (iso: string) => void }) {
  const months = [
    { year: 2026, month: 8 },
    { year: 2026, month: 9 },
    { year: 2026, month: 10 },
  ]
  return (
    <BottomSheet open={open} onClose={onClose} title={title} subtitle={formatMediumDate(value)} height="tall">
      {months.map((m) => (
        <MonthGrid
          key={`${m.year}-${m.month}`}
          {...m}
          value={value}
          min={min}
          onPick={(iso) => {
            onSelect(iso)
            onClose()
          }}
        />
      ))}
    </BottomSheet>
  )
}

/* ---------- Passengers & cabin ---------- */

const CABINS: { id: CabinClass; label: string; note: string }[] = [
  { id: 'economy', label: 'Economy', note: 'Full-service comfort' },
  { id: 'business', label: 'Business', note: 'Lie-flat on wide-body' },
  { id: 'first', label: 'First', note: 'Selected international routes' },
]

export function PassengerSheet({
  open,
  onClose,
  passengers,
  cabin,
  onChange,
}: {
  open: boolean
  onClose: () => void
  passengers: Passengers
  cabin: CabinClass
  onChange: (p: Passengers, c: CabinClass) => void
}) {
  const [local, setLocal] = useState(passengers)
  const [localCabin, setLocalCabin] = useState(cabin)
  const rows: { key: keyof Passengers; label: string; note: string; min: number }[] = [
    { key: 'adults', label: 'Adults', note: '12 years and above', min: 1 },
    { key: 'children', label: 'Children', note: '2 – 11 years', min: 0 },
    { key: 'infants', label: 'Infants', note: 'Under 2 years', min: 0 },
  ]
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Passengers & cabin"
      footer={
        <Button
          full
          onClick={() => {
            onChange(local, localCabin)
            onClose()
          }}
        >
          Done
        </Button>
      }
    >
      <div className="divide-y divide-surface-line">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-[14px] font-semibold text-ink">{r.label}</p>
              <p className="text-[12px] text-ink-muted">{r.note}</p>
            </div>
            <Stepper label={r.label} min={r.min} max={r.key === 'infants' ? local.adults : 9} value={local[r.key]} onChange={(v) => setLocal({ ...local, [r.key]: v })} />
          </div>
        ))}
      </div>
      <p className="t-label mt-5 mb-2">Cabin class</p>
      <div className="grid grid-cols-3 gap-2">
        {CABINS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setLocalCabin(c.id)}
            className={cn('rounded-xl border p-3 text-left transition-colors', localCabin === c.id ? 'border-brand-blue bg-brand-blue-light/60' : 'border-surface-line hover:bg-surface-off')}
          >
            <span className="block text-[13px] font-bold text-ink">{c.label}</span>
            <span className="block text-[11px] text-ink-muted mt-0.5 leading-tight">{c.note}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
