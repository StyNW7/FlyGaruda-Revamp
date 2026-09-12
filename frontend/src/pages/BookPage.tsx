import { useNavigate } from 'react-router-dom'
import { Clock, Ticket } from 'lucide-react'
import { PageContainer, SectionHeader } from '../components/common/Layout'
import { SearchForm } from '../components/booking/SearchForm'
import { DestinationCard } from '../components/common/Explore'
import { ListRow } from '../components/common/ListRow'
import { DESTINATIONS } from '../data/offers'
import { getAirport } from '../data/airports'
import { useApp } from '../store/AppContext'
import { formatDayMonth } from '../utils/format'
import { useToast } from '../components/common/Toast'

const RECENT = [
  { origin: 'CGK', destination: 'DPS', date: '2026-09-19', label: 'Jakarta → Denpasar' },
  { origin: 'CGK', destination: 'SIN', date: '2026-10-03', label: 'Jakarta → Singapore' },
] as const

export function BookPage() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <div className="card-navy rounded-none rounded-b-[28px] safe-top relative overflow-hidden pb-20">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" aria-hidden />
        <div className="px-4 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-turquoise-light">Book</p>
          <h1 className="text-[24px] font-bold text-white leading-tight mt-1">Find your next flight</h1>
          <p className="text-[13px] text-white/75 mt-1">Every Garuda fare includes baggage, meals and miles.</p>
        </div>
      </div>
      <PageContainer className="-mt-16 pb-6 space-y-6">
        <SearchForm />

        <section className="card overflow-hidden">
          <div className="px-4 pt-3.5 pb-1 flex items-center gap-2 text-[12px] font-semibold text-ink-muted">
            <Clock className="h-3.5 w-3.5" /> Recent searches
          </div>
          {RECENT.map((r) => (
            <ListRow
              key={r.label}
              title={r.label}
              description={`${formatDayMonth(r.date)} · 1 Adult · Economy`}
              onClick={() => {
                dispatch({ type: 'SET_SEARCH', search: { origin: r.origin, destination: r.destination, departDate: r.date, tripType: 'oneway' } })
                navigate('/search-results')
              }}
            />
          ))}
          <div className="border-t border-surface-line">
            <ListRow icon={Ticket} iconTone="blue" title="Retrieve a booking" description="Add a trip using booking code and last name" onClick={() => navigate('/trips?add=1')} />
          </div>
        </section>

        <section>
          <SectionHeader title="Trending routes from Jakarta" action="Explore" to="/destinations" />
          <div className="-mx-4 px-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {DESTINATIONS.map((d, i) => (
              <DestinationCard
                key={d.code}
                destination={d}
                index={i}
                onClick={() => {
                  dispatch({ type: 'SET_SEARCH', search: { origin: 'CGK', destination: d.code } })
                  document.getElementById('app-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
                  toast(`Destination set to ${getAirport(d.code).city}`, 'info')
                }}
              />
            ))}
          </div>
        </section>
      </PageContainer>
    </div>
  )
}
