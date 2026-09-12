import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Search } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, SectionHeader } from '../components/common/Layout'
import { Chip, Input } from '../components/common/Inputs'
import { DestinationCard } from '../components/common/Explore'
import { DESTINATIONS, INSPIRATION } from '../data/offers'
import { useApp } from '../store/AppContext'
import { useToast } from '../components/common/Toast'

type Filter = 'all' | 'Indonesia' | 'International'

export function DestinationsPage() {
  const navigate = useNavigate()
  const { dispatch } = useApp()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return DESTINATIONS.filter((d) => (filter === 'all' || (filter === 'Indonesia' ? d.country === 'Indonesia' : d.country !== 'Indonesia')) && (!s || d.city.toLowerCase().includes(s) || d.country.toLowerCase().includes(s) || d.code.toLowerCase().includes(s)))
  }, [q, filter])

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/" title="Destinations" subtitle="Where Garuda can take you" />
      <PageContainer className="py-4 space-y-4">
        <Input leftIcon={Search} placeholder="Search destination" aria-label="Search destination" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2 -mx-4 px-4 overflow-x-auto no-scrollbar">
          {(['all', 'Indonesia', 'International'] as Filter[]).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f}
            </Chip>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {list.map((d, i) => (
            <DestinationCard
              key={d.code}
              destination={d}
              index={i}
              className="w-full"
              onClick={() => {
                dispatch({ type: 'SET_SEARCH', search: { origin: 'CGK', destination: d.code } })
                navigate('/book')
              }}
            />
          ))}
        </div>
        {list.length === 0 && <p className="text-center t-body py-6">No destinations match “{q}”.</p>}

        <SectionHeader title="Travel inspiration" className="mt-2" />
        <div className="card divide-y divide-surface-line overflow-hidden">
          {INSPIRATION.map((i) => (
            <button key={i.id} type="button" onClick={() => toast('Story opens in the live app', 'info')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
              <span className="h-10 w-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold text-ink">{i.title}</span>
                <span className="block text-[12px] text-ink-muted">{i.subtitle} · {i.readTime}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-ink-faint" />
            </button>
          ))}
        </div>
      </PageContainer>
    </div>
  )
}
