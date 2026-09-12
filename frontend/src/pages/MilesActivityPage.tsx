import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Download, PlusCircle } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Chip, Input } from '../components/common/Inputs'
import { BottomSheet } from '../components/common/Overlays'
import { EmptyState } from '../components/common/States'
import { ActivityRow } from '../components/miles/ActivityRow'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import type { MilesActivity } from '../types'
import { formatNumber, parseISODate, monthLabel } from '../utils/format'
import { downloadText, reference, todayISO } from '../utils/share'

type Filter = 'all' | MilesActivity['type']

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'earn', label: 'Earned' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'redeem', label: 'Redeemed' },
  { id: 'pending', label: 'Pending' },
]

function ClaimSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp()
  const toast = useToast()
  const [flight, setFlight] = useState('')
  const [date, setDate] = useState('')
  const [pnr, setPnr] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const valid = /^GA\s?\d{3,4}$/i.test(flight.trim()) && /^\d{4}-\d{2}-\d{2}$/.test(date) && pnr.trim().length === 6

  const submit = () => {
    if (!valid) return
    const id = reference('CL', flight + pnr)
    const estimate = 600 + (Number(flight.replace(/\D/g, '')) % 7) * 150
    dispatch({
      type: 'SUBMIT_CLAIM',
      claim: { id, flightNumber: flight.toUpperCase().replace(/^GA\s?/, 'GA '), date, bookingCode: pnr.toUpperCase(), miles: estimate, status: 'pending', submittedAt: todayISO() },
    })
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: { id: `claim-${id}`, category: 'miles', title: 'Missing miles claim received', body: `${flight.toUpperCase()} on ${date} · reference ${id}. Reviewed within 7 working days.`, time: 'Just now', to: '/miles/activity', iconKey: 'award' },
    })
    setDone(id)
    toast('Claim submitted')
  }

  const reset = () => {
    setFlight('')
    setDate('')
    setPnr('')
    setDone(null)
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={reset}
      title="Claim missing miles"
      subtitle="For Garuda flights taken in the last 6 months"
      footer={done ? <Button full onClick={reset}>Done</Button> : <Button full disabled={!valid} onClick={submit}>Submit claim</Button>}
    >
      {done ? (
        <div className="flex flex-col items-center text-center py-4 animate-fade-up">
          <span className="h-14 w-14 rounded-full bg-success-soft text-success flex items-center justify-center mb-3 animate-check-pop">
            <Check className="h-7 w-7" strokeWidth={3} />
          </span>
          <p className="t-h3">Claim received</p>
          <p className="t-caption mt-1 max-w-[260px]">Reference {done}. Pending miles appear in your activity and are credited once verified.</p>
        </div>
      ) : (
        <div className="space-y-3.5 pt-1">
          <Input label="Flight number" placeholder="e.g. GA 402" value={flight} onChange={(e) => setFlight(e.target.value.toUpperCase())} />
          <Input label="Flight date" type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
          <Input label="Booking code" placeholder="6 characters" value={pnr} onChange={(e) => setPnr(e.target.value.toUpperCase())} maxLength={6} className="font-mono" />
          <p className="text-[11.5px] text-ink-faint">Flight miles normally post within 72 hours. Claims are reviewed within 7 working days.</p>
        </div>
      )}
    </BottomSheet>
  )
}

export function MilesActivityPage() {
  const { miles, user } = useApp()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState<Filter>('all')
  const claimOpen = params.get('claim') === '1'

  const list = useMemo(() => miles.activity.filter((a) => filter === 'all' || a.type === filter), [miles.activity, filter])
  const groups = useMemo(() => {
    const map = new Map<string, MilesActivity[]>()
    for (const a of list) {
      const d = parseISODate(a.date)
      const key = monthLabel(d.getFullYear(), d.getMonth())
      map.set(key, [...(map.get(key) ?? []), a])
    }
    return [...map.entries()]
  }, [list])

  const exportStatement = () => {
    const rows = [['Date', 'Description', 'Detail', 'Miles', 'Type'], ...miles.activity.map((a) => [a.date, a.title, a.subtitle, String(a.miles), a.type])]
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadText(`GarudaMiles statement · ${user.milesId}\nBalance,${miles.balance}\n\n${csv}`, `garudamiles-statement-${todayISO()}.csv`, 'text/csv')
    toast('Statement downloaded (CSV)')
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader
        back="/miles"
        title="Miles activity"
        subtitle={`Balance ${formatNumber(miles.balance)} miles`}
        right={
          <button type="button" onClick={exportStatement} aria-label="Download statement" className="h-10 w-10 rounded-full hover:bg-surface-soft flex items-center justify-center text-brand-navy">
            <Download className="h-5 w-5" />
          </button>
        }
      />
      <PageContainer className="py-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="card p-3">
            <p className="t-label">Earned 2026</p>
            <p className="text-[17px] font-bold text-success mt-1 leading-tight">+{formatNumber(miles.earnedThisYear)}</p>
          </div>
          <div className="card p-3">
            <p className="t-label">Redeemed</p>
            <p className="text-[17px] font-bold text-ink mt-1 leading-tight">−{formatNumber(miles.redeemedThisYear)}</p>
          </div>
          <div className="card p-3">
            <p className="t-label">Pending</p>
            <p className="text-[17px] font-bold text-brand-blue mt-1 leading-tight">{formatNumber(miles.activity.filter((a) => a.type === 'pending').reduce((s, a) => s + a.miles, 0))}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {FILTERS.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>

        {groups.length === 0 ? (
          <EmptyState mascot="think" title="Nothing here yet" description="Activity of this type will appear as soon as it posts." compact />
        ) : (
          groups.map(([month, items]) => (
            <section key={month}>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="t-label">{month}</p>
                <p className="text-[11.5px] font-semibold text-ink-muted tabular-nums">
                  {(() => {
                    const net = items.filter((a) => a.type !== 'pending').reduce((s, a) => s + a.miles, 0)
                    return `${net >= 0 ? '+' : ''}${formatNumber(net)}`
                  })()}
                </p>
              </div>
              <div className="card divide-y divide-surface-line overflow-hidden">
                {items.map((a) => (
                  <ActivityRow key={a.id} activity={a} />
                ))}
              </div>
            </section>
          ))
        )}

        <Button variant="secondary" full leftIcon={<PlusCircle className="h-4 w-4" />} onClick={() => setParams({ claim: '1' })}>
          Claim missing miles
        </Button>
        <p className="text-[11px] text-ink-faint text-center pb-2">Garuda flights credit within 72 hours. Partner airlines and hotels post within 14 days.</p>
      </PageContainer>

      <ClaimSheet open={claimOpen} onClose={() => setParams({}, { replace: true })} />
    </div>
  )
}
