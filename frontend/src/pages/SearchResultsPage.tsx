import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight, Check, SlidersHorizontal } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Chip } from '../components/common/Inputs'
import { SkeletonCard } from '../components/common/States'
import { FlightCard } from '../components/booking/FlightCard'
import { ValueBreakdownSheet, WhyGarudaCard } from '../components/booking/ValueCard'
import { findFlight, getFlights } from '../data/flights'
import { getAirport } from '../data/airports'
import { useApp } from '../store/AppContext'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading'
import { passengerLabel } from '../utils/passengers'
import { addDays, formatDayNum, formatMediumDate, formatRupiah } from '../utils/format'
import type { Flight } from '../types'
import { cn } from '../utils/cn'

type Sort = 'recommended' | 'earliest' | 'lowest'

export function SearchResultsPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const s = state.search
  const isRound = s.tripType === 'round'
  const leg: 'outbound' | 'return' = isRound && params.get('leg') === 'return' && s.outboundFlightId ? 'return' : 'outbound'
  const origin = leg === 'return' ? s.destination : s.origin
  const destination = leg === 'return' ? s.origin : s.destination
  const date = leg === 'return' ? s.returnDate : s.departDate
  const outbound = leg === 'return' && s.outboundFlightId ? findFlight(s.outboundFlightId) : undefined

  const loading = useSimulatedLoading(900, [origin, destination, date, s.cabin])
  const [sort, setSort] = useState<Sort>('recommended')
  const [valueFor, setValueFor] = useState<Flight | null>(null)

  const flights = useMemo(() => {
    const list = getFlights(origin, destination, s.cabin, date)
    if (sort === 'earliest') return [...list].sort((a, b) => a.departTime.localeCompare(b.departTime))
    if (sort === 'lowest') return [...list].sort((a, b) => a.prices.saver - b.prices.saver)
    return [...list].sort((a, b) => (a.tags?.includes('best-value') ? -1 : b.tags?.includes('best-value') ? 1 : 0))
  }, [origin, destination, s.cabin, date, sort])

  const dateStrip = [-2, -1, 0, 1, 2].map((d) => addDays(date, d))
  const lowestFor = (iso: string) => Math.min(...getFlights(origin, destination, s.cabin, iso).map((f) => f.prices.saver))
  const minDate = leg === 'return' ? s.departDate : '2026-09-12'

  const select = (f: Flight) => {
    if (isRound && leg === 'outbound') {
      dispatch({ type: 'SET_SEARCH', search: { outboundFlightId: f.id } })
      navigate('/search-results?leg=return')
      return
    }
    navigate(`/fare/${f.id}`)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader
        back={leg === 'return' ? '/search-results' : '/book'}
        title={
          <div className="flex items-center gap-2 text-[16px] font-bold text-ink">
            {getAirport(origin).city}
            {isRound ? <ArrowRight className="h-3.5 w-3.5 text-ink-faint" /> : <ArrowLeftRight className="h-3.5 w-3.5 text-ink-faint" />}
            {getAirport(destination).city}
          </div>
        }
        subtitle={`${formatMediumDate(date)} · ${passengerLabel(s.passengers, s.cabin)}`}
        right={
          <button type="button" onClick={() => navigate('/book')} aria-label="Modify search" className="h-10 w-10 rounded-full hover:bg-surface-soft flex items-center justify-center text-brand-navy">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        }
      />

      {isRound && (
        <div className="bg-white border-b border-surface-line px-4 py-2.5 flex items-center gap-2 text-[12px]">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold', leg === 'outbound' ? 'bg-brand-navy text-white' : 'bg-success-soft text-success')}>
            {leg === 'return' && <Check className="h-3 w-3" strokeWidth={3} />}
            1 · Outbound
          </span>
          <span className="h-[2px] w-6 rounded-full bg-surface-line" />
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 font-semibold', leg === 'return' ? 'bg-brand-navy text-white' : 'bg-surface-soft text-ink-muted')}>2 · Return</span>
          {outbound && (
            <button type="button" onClick={() => navigate('/search-results')} className="ml-auto text-ink-muted truncate">
              {outbound.number} · {outbound.departTime} <span className="font-semibold text-brand-blue">Change</span>
            </button>
          )}
        </div>
      )}

      <div className="bg-white border-b border-surface-line px-4 py-2.5 flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Departure dates">
        {dateStrip.map((iso) => {
          const active = iso === date
          const before = iso < minDate
          return (
            <button
              key={iso}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={before}
              onClick={() => dispatch({ type: 'SET_SEARCH', search: leg === 'return' ? { returnDate: iso } : { departDate: iso, returnDate: s.returnDate < iso ? addDays(iso, 4) : s.returnDate } })}
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
        {leg === 'outbound' && <WhyGarudaCard />}

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
              {leg === 'return' ? 'Choose your return flight · ' : ''}
              {flights.length} Garuda flights · {origin} → {destination} · prices per adult, all inclusions shown
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
