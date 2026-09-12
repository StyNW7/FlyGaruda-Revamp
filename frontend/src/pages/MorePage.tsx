import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, Search, Crown } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { Avatar, PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { ListRow } from '../components/common/ListRow'
import { Modal } from '../components/common/Overlays'
import { useToast } from '../components/common/Toast'
import { MORE_GROUPS, ALL_FEATURES } from '../data/more'
import { useApp } from '../store/AppContext'

export function MorePage() {
  const { user, isMember, dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [confirmOut, setConfirmOut] = useState(false)

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return null
    return ALL_FEATURES.filter((f) => f.label.toLowerCase().includes(s) || f.description.toLowerCase().includes(s))
  }, [q])

  const featureTarget = (slug: string, to?: string) => to ?? `/more/${slug}`

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader large title="More" />
      <PageContainer className="py-4 space-y-5">
        <button type="button" onClick={() => navigate(isMember ? '/profile' : '/login')} className="w-full card p-4 flex items-center gap-3 text-left press">
          {isMember ? <Avatar name={user.name} initials={user.initials} size="lg" /> : <span className="h-16 w-16 rounded-full bg-surface-soft flex items-center justify-center"><img src="/brand/mark.png" alt="" className="h-6 w-auto" /></span>}
          <span className="flex-1 min-w-0">
            <span className="block text-[16px] font-bold text-ink">{isMember ? user.name : 'Sign in to FlyGaruda'}</span>
            <span className="block text-[12px] text-ink-muted truncate">{isMember ? user.email : 'Trips, miles and journey updates in one place'}</span>
            {isMember && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-gold-soft text-[#8A6A1F] px-2 py-0.5 text-[11px] font-bold">
                <Crown className="h-3 w-3" /> GarudaMiles {user.tier} · {user.milesId}
              </span>
            )}
          </span>
          <ChevronRight className="h-5 w-5 text-ink-faint" />
        </button>

        <div className="flex items-center gap-2.5 h-12 rounded-xl bg-white border border-surface-line px-3.5 focus-within:border-brand-blue">
          <Search className="h-[18px] w-[18px] text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search features" aria-label="Search features" className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink-faint" />
          {q && (
            <button type="button" onClick={() => setQ('')} className="text-[12px] font-semibold text-ink-muted">
              Clear
            </button>
          )}
        </div>

        {results ? (
          <section className="animate-fade-in">
            <p className="t-label mb-2">{results.length} result{results.length === 1 ? '' : 's'}</p>
            <div className="card divide-y divide-surface-line overflow-hidden">
              {results.map((f) => (
                <ListRow key={f.slug} icon={f.icon} title={f.label} description={f.description} badge={f.badge} to={featureTarget(f.slug, f.to)} />
              ))}
              {results.length === 0 && <p className="p-6 text-center t-body">No features match “{q}”.</p>}
            </div>
          </section>
        ) : (
          MORE_GROUPS.map((g) => (
            <section key={g.id}>
              <p className="t-label mb-2">{g.title}</p>
              <div className="card divide-y divide-surface-line overflow-hidden">
                {g.items.map((f) => (
                  <ListRow key={f.slug} icon={f.icon} title={f.label} description={f.description} badge={f.badge} to={featureTarget(f.slug, f.to)} iconTone={g.id === 'services' ? 'turquoise' : g.id === 'support' ? 'blue' : g.id === 'app' ? 'navy' : 'navy'} />
                ))}
              </div>
            </section>
          ))
        )}

        {isMember && !results && (
          <Button variant="secondary" full leftIcon={<LogOut className="h-4 w-4" />} onClick={() => setConfirmOut(true)}>
            Sign out
          </Button>
        )}
        <p className="text-center text-[11px] text-ink-faint pb-2">FlyGaruda prototype · v2.0 · Garuda Indonesia</p>
      </PageContainer>

      <Modal open={confirmOut} onClose={() => setConfirmOut(false)} title="Sign out?">
        <p className="t-body">Your trips and miles stay safe. Sign in again anytime with the demo account.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" full onClick={() => setConfirmOut(false)}>
            Cancel
          </Button>
          <Button full onClick={() => { dispatch({ type: 'LOGOUT' }); setConfirmOut(false); toast('Signed out', 'info'); navigate('/') }}>
            Sign out
          </Button>
        </div>
      </Modal>
    </div>
  )
}
