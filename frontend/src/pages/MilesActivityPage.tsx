import { Gift, Plane, Sparkles } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { MILES_ACTIVITY, MILES_SUMMARY } from '../data/miles'
import { formatNumber } from '../utils/format'
import { cn } from '../utils/cn'

export function MilesActivityPage() {
  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/miles" title="Miles activity" subtitle={`Balance ${formatNumber(MILES_SUMMARY.balance)} miles`} />
      <PageContainer className="py-4">
        <div className="card divide-y divide-surface-line overflow-hidden">
          {MILES_ACTIVITY.map((a) => (
            <div key={a.id} className="px-4 py-3.5 flex items-center gap-3">
              <span className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', a.type === 'redeem' ? 'bg-surface-soft text-ink-muted' : a.type === 'bonus' ? 'bg-brand-gold-soft text-[#8A6A1F]' : 'bg-brand-turquoise-soft text-brand-turquoise')}>
                {a.type === 'redeem' ? <Gift className="h-[18px] w-[18px]" /> : a.type === 'bonus' ? <Sparkles className="h-[18px] w-[18px]" /> : <Plane className="h-[18px] w-[18px]" />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13.5px] font-semibold text-ink">{a.title}</span>
                <span className="block text-[12px] text-ink-muted">{a.subtitle}</span>
                <span className="block text-[11px] text-ink-faint mt-0.5">{a.date}</span>
              </span>
              <span className={cn('text-[14px] font-bold tabular-nums', a.miles < 0 ? 'text-ink-muted' : 'text-success')}>
                {a.miles > 0 ? '+' : ''}
                {formatNumber(a.miles)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-ink-faint text-center mt-4">Showing the last 6 months. Miles from partner airlines post within 14 days.</p>
      </PageContainer>
    </div>
  )
}
