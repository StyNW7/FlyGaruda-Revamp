import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Bookmark, ChevronRight, Lightbulb, Search } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, SectionHeader } from '../components/common/Layout'
import { Chip, Input } from '../components/common/Inputs'
import { Button } from '../components/common/Button'
import { BottomSheet } from '../components/common/Overlays'
import { DestinationCard } from '../components/common/Explore'
import { DESTINATIONS, INSPIRATION, type Story } from '../data/offers'
import { getAirport } from '../data/airports'
import { useApp } from '../store/AppContext'
import { useToast } from '../components/common/Toast'
import { cn } from '../utils/cn'

type Filter = 'all' | 'Indonesia' | 'International'

export function DestinationsPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [story, setStory] = useState<Story | null>(null)
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return DESTINATIONS.filter((d) => (filter === 'all' || (filter === 'Indonesia' ? d.country === 'Indonesia' : d.country !== 'Indonesia')) && (!s || d.city.toLowerCase().includes(s) || d.country.toLowerCase().includes(s) || d.code.toLowerCase().includes(s)))
  }, [q, filter])

  const saved = story ? state.savedReads.includes(story.id) : false

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

        <SectionHeader title="Travel inspiration" subtitle="Stories from the Colours editorial team" className="mt-2" />
        <div className="card divide-y divide-surface-line overflow-hidden">
          {INSPIRATION.map((i) => (
            <button key={i.id} type="button" onClick={() => setStory(i)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
              <span className="h-10 w-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold text-ink">{i.title}</span>
                <span className="block text-[12px] text-ink-muted">{i.subtitle} · {i.readTime}</span>
              </span>
              {state.savedReads.includes(i.id) && <Bookmark className="h-4 w-4 text-brand-turquoise fill-current" />}
              <ChevronRight className="h-4 w-4 text-ink-faint" />
            </button>
          ))}
        </div>
      </PageContainer>

      <BottomSheet
        open={story !== null}
        onClose={() => setStory(null)}
        height="tall"
        footer={
          story ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                leftIcon={<Bookmark className={cn('h-4 w-4', saved && 'fill-current text-brand-turquoise')} />}
                onClick={() => {
                  dispatch({ type: 'TOGGLE_SAVED_READ', id: story.id })
                  toast(saved ? 'Removed from saved reads' : 'Saved for offline reading', 'info')
                }}
              >
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button
                full
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => {
                  dispatch({ type: 'SET_SEARCH', search: { origin: 'CGK', destination: story.code, tripType: 'round' } })
                  setStory(null)
                  navigate('/book')
                }}
              >
                Fly to {getAirport(story.code).city}
              </Button>
            </div>
          ) : undefined
        }
      >
        {story && (
          <article className="animate-fade-in">
            <p className="t-label text-brand-turquoise">Colours · {story.readTime}</p>
            <h2 className="t-h1 mt-1.5">{story.title}</h2>
            <p className="t-caption mt-1">{story.subtitle}</p>
            <div className="mt-4 h-36 rounded-2xl card-navy relative overflow-hidden flex items-end p-4">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-turquoise/30 blur-2xl" aria-hidden />
              <span className="text-[26px] font-bold tracking-tight">{story.code}</span>
              <span className="ml-2 text-[13px] text-white/70 mb-1.5">{getAirport(story.code).city} · {getAirport(story.code).country}</span>
            </div>
            <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-ink-soft">
              {story.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-surface-off p-3.5">
              <p className="text-[12px] font-bold text-ink mb-1.5">Good to know</p>
              <ul className="space-y-1.5">
                {story.tips.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[12.5px] text-ink-soft leading-snug">
                    <Lightbulb className="h-3.5 w-3.5 text-brand-gold shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        )}
      </BottomSheet>
    </div>
  )
}
