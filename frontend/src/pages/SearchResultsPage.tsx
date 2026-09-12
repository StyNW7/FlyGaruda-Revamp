import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, SlidersHorizontal } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Chip } from '../components/common/Inputs'
import { SkeletonCard } from '../components/common/States'
import { FlightCard } from '../components/booking/FlightCard'
import { ValueBreakdownSheet, WhyGarudaCard } from '../components/booking/ValueCard'
import { passengerLabel } from '../utils/passengers'
import { getFlights } from '../data/flights'
import { getAirport } from '../data/airports'
import { useApp } from '../store/AppContext'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading'
import { addDays, formatDayNum, formatMediumDate, formatRupiah } from '../utils/format'
import type { Flight } from '../types'
import { cn } from '../utils/cn'

type Sort = 'recommended' | 'earliest' | 'lowest'

export function SearchResultsPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const s = state.search
  const loading = useSimulatedLoading(900, [s.origin, s.destination, s.departDate, s.cabin])
  const [sort, setSort] = useState<Sort>('recommended')
  const [valueFor, setValueFor] = useState<Flight | null>(null)

  const flights = useMemo(() => {
    const list = getFlights(s.origin, s.destination, s.cabin, s.departDate)
    if (sort === 'earliest') return [...list].sort((a, b) => a.departTime.localeCompare(b.departTime))
    if (sort === 'lowest') return [...list].sort((a, b) => a.prices.saver - b.prices.saver)
    return [...list].sort((a, b) => (a.tags?.includes('best-value') ? -1 : b.tags?.includes('best-value') ? 1 : 0))
  }, [s.origin, s.destination, s.cabin, s.departDate, sort])

  const dateStrip = [-2, -1, 0, 1, 2].map((d) => addDays(s.departDate, d))
  const lowestFor = (iso: string) => Math.min(...getFlights(s.origin, s.destination, s.cabin, iso).map((f) => f.prices.saver))

  const select = (f: Flight) => navigate(`/fare/${f.id}`)

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader
        back="/book"
        title={
          <div className="flex items-center gap-2 text-[16px] font-bold text-ink">
            {getAirport(s.origin).city}
            <ArrowLeftRight className="h-3.5 w-3.5 text-ink-faint" />
            {getAirport(s.destination).city}
          </div>
        }
        subtitle={`${formatMediumDate(s.departDate)} · ${passengerLabel(s.passengers, s.cabin)}`}
        right={
          <button type="button" onClick={() => navigate('/book')} aria-label="Modify search" className="h-10 w-10 rounded-full hover:bg-surface-soft flex items-center justify-center text-brand-navy">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        }
      />

      <div className="bg-white border-b border-surface-line px-4 py-2.5 flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Departure dates">
        {dateStrip.map((iso) => {
          const active = iso === s.departDate
          const before = iso < '2026-09-12'
          return (
            <button
              key={iso}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={before}
              onClick={() => dispatch({ type: 'SET_SEARCH', search: { departDate: iso } })}
              className={cn(
                'shrink-0 min-w-[72px] rounded-xl px-2.5 py-2 text-center border transition-colors',
                active ? 'bg-brand-navy border-brand-navy text-white' : before ? 'opacity-40 border-surface-line' : 'border-surface-line hover:bg-surface-off',
              )}
            >
              <span className="block text-[12px] font-semibold">{formatDayNum(iso)}</span>
              <span className={cn('block text-[10.5px] mt-0.5', active ? 'text-white/80' : 'text-ink-muted')}>{before ? '—' : formatRupiah(lowestFor(iso)).replace('Rp ', 'Rp').replace(',000', 'k')}</span>
            </button>
          )
        })}
      </div>

      <PageContainer className="py-4 space-y-4">
        <WhyGarudaCard />

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          <Chip active={sort === 'recommended'} onClick={() => setSort('recommended')}>
            Recommended
          </Chip>
          <Chip active={sort === 'earliest'} onClick={() => setSort('earliest')}>
            Earliest
          </Chip>
          <Chip active={sort === 'lowest'} onClick={() => setSort('lowest')}>
            Lowest fare
          </Chip>
          <Chip active>Direct only</Chip>
        </div>

        {loading ? (
          <div className="space-y-3" aria-live="polite">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        ) : (
          <div className="space-y-3 animate-fade-up">
            <p className="text-[12px] text-ink-muted">
              {flights.length} Garuda flights · {getAirport(s.origin).code} → {getAirport(s.destination).code} · prices per adult, all inclusions shown
            </p>
            {flights.map((f) => (
              <FlightCard key={f.id} flight={f} onSelect={() => select(f)} onViewValue={() => setValueFor(f)} />
            ))}
            <p className="text-[11px] text-ink-faint text-center pt-2 pb-4">Fares and inclusions are demo values for this prototype.</p>
          </div>
        )}
      </PageContainer>

      <ValueBreakdownSheet
        open={valueFor !== null}
        flight={valueFor}
        onClose={() => setValueFor(null)}
        onContinue={() => {
          const f = valueFor
          setValueFor(null)
          if (f) select(f)
        }}
      />
    </div>
  )
}
