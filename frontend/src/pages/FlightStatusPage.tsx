import { useMemo, useState } from 'react'
import { Search, Plane, Radar } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Input } from '../components/common/Inputs'
import { SegmentedTabs } from '../components/common/Tabs'
import { StatusBadge } from '../components/common/StatusBadge'
import { EmptyState } from '../components/common/States'
import { useApp } from '../store/AppContext'
import { getFlights } from '../data/flights'
import { cityOf } from '../data/airports'
import type { AirportCode, TripStatus } from '../types'
import { cn } from '../utils/cn'

interface Row {
  number: string
  origin: AirportCode
  destination: AirportCode
  sched: string
  est: string
  arr: string
  gate: string
  status: TripStatus
  terminal: string
}

export function FlightStatusPage() {
  const { state } = useApp()
  const [mode, setMode] = useState<'flight' | 'route'>('flight')
  const [q, setQ] = useState('GA 412')

  const rows = useMemo<Row[]>(() => {
    const today = getFlights('CGK', 'DPS', 'economy', '2026-09-19')
    const sin = getFlights('CGK', 'SIN', 'economy', '2026-09-19')
    const base: Row[] = [...today, ...sin].map((f, i) => ({
      number: f.number,
      origin: f.origin,
      destination: f.destination,
      sched: f.departTime,
      est: f.departTime,
      arr: f.arriveTime,
      gate: String(8 + ((i * 3) % 14)),
      status: i === 2 ? 'boarding' : i === 5 ? 'scheduled' : 'on-time',
      terminal: 'Terminal 3',
    }))
    const live = state.trips.find((t) => t.id === 'trip-ga412')
    return base.map((r) => {
      if (r.number === 'GA 412' && live) {
        return { ...r, gate: live.gate, status: live.status === 'cancelled' ? 'cancelled' : live.disruption ? 'delayed' : live.status === 'boarding' ? 'boarding' : 'on-time', est: live.disruption ? live.disruption.newDepartTime : r.sched, arr: live.disruption ? live.disruption.newArriveTime : r.arr }
      }
      return r
    })
  }, [state.trips])

  const s = q.trim().toLowerCase().replace(/\s+/g, '')
  const filtered = rows.filter((r) => {
    if (!s) return true
    if (mode === 'flight') return r.number.toLowerCase().replace(/\s+/g, '').includes(s)
    return `${r.origin}${r.destination}`.toLowerCase().includes(s) || cityOf(r.origin).toLowerCase().includes(s) || cityOf(r.destination).toLowerCase().includes(s)
  })

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back title="Flight Status" subtitle="Saturday, 19 September 2026" />
      <PageContainer className="py-4 space-y-4">
        <SegmentedTabs
          value={mode}
          onChange={(m) => {
            setMode(m)
            setQ(m === 'flight' ? 'GA 412' : 'CGK')
          }}
          items={[
            { id: 'flight', label: 'By flight number' },
            { id: 'route', label: 'By route' },
          ]}
        />
        <Input leftIcon={Search} value={q} onChange={(e) => setQ(e.target.value)} placeholder={mode === 'flight' ? 'e.g. GA 412' : 'e.g. CGK or Jakarta'} aria-label="Search flights" />

        {filtered.length === 0 ? (
          <EmptyState icon={Radar} title="No flights found" description="Try another flight number or route." compact />
        ) : (
          <ul className="space-y-2.5 animate-fade-up">
            {filtered.map((r) => {
              const changed = r.est !== r.sched
              return (
                <li key={r.number} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-2 text-[14px] font-bold text-ink">
                      <span className="h-7 w-7 rounded-md bg-brand-navy flex items-center justify-center">
                        <Plane className="h-3.5 w-3.5 text-white" />
                      </span>
                      {r.number}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div>
                      <p className="text-[20px] font-bold text-ink leading-none">
                        {changed && <span className="line-through text-ink-faint text-[14px] font-normal mr-1.5">{r.sched}</span>}
                        {r.est}
                      </p>
                      <p className="text-[12px] text-ink-muted mt-1">
                        {r.origin} · {cityOf(r.origin)}
                      </p>
                    </div>
                    <span className="h-[2px] w-10 bg-surface-line rounded-full" />
                    <div className="text-right">
                      <p className="text-[20px] font-bold text-ink leading-none">{r.arr}</p>
                      <p className="text-[12px] text-ink-muted mt-1">
                        {r.destination} · {cityOf(r.destination)}
                      </p>
                    </div>
                  </div>
                  <div className={cn('mt-3 pt-3 border-t border-surface-line grid grid-cols-3 text-[12px]')}>
                    <span>
                      <span className="text-ink-muted">Terminal</span>
                      <span className="block font-semibold text-ink">{r.terminal.replace('Terminal ', 'T')}</span>
                    </span>
                    <span>
                      <span className="text-ink-muted">Gate</span>
                      <span className="block font-semibold text-ink">{r.gate}</span>
                    </span>
                    <span className="text-right">
                      <span className="text-ink-muted">Updated</span>
                      <span className="block font-semibold text-ink">Just now</span>
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </PageContainer>
    </div>
  )
}
