import { Clock, Gift, Plane, Sparkles } from 'lucide-react'
import type { MilesActivity } from '../../types'
import { formatNumber, formatShortDate } from '../../utils/format'
import { cn } from '../../utils/cn'

const STYLES = {
  earn: { cls: 'bg-brand-turquoise-soft text-brand-turquoise', icon: Plane },
  bonus: { cls: 'bg-brand-gold-soft text-[#8A6A1F]', icon: Sparkles },
  redeem: { cls: 'bg-surface-soft text-ink-muted', icon: Gift },
  pending: { cls: 'bg-brand-blue-light text-brand-blue', icon: Clock },
}

export function ActivityRow({ activity: a, compact }: { activity: MilesActivity; compact?: boolean }) {
  const s = STYLES[a.type]
  const Icon = s.icon
  const pending = a.type === 'pending'
  return (
    <div className={cn('px-4 flex items-center gap-3', compact ? 'py-3' : 'py-3.5')}>
      <span className={cn('rounded-xl flex items-center justify-center shrink-0', compact ? 'h-9 w-9' : 'h-10 w-10', s.cls)}>
        <Icon className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn('block font-semibold text-ink truncate', compact ? 'text-[13px]' : 'text-[13.5px]')}>{a.title}</span>
        {!compact && <span className="block text-[12px] text-ink-muted truncate">{a.subtitle}</span>}
        <span className={cn('block text-ink-faint', compact ? 'text-[11.5px]' : 'text-[11px] mt-0.5')}>
          {formatShortDate(a.date)}
          {pending && <span className="ml-1.5 rounded-full bg-brand-blue-light text-brand-blue px-1.5 py-0.5 text-[10px] font-bold">Under review</span>}
        </span>
      </span>
      <span className={cn('font-bold tabular-nums', compact ? 'text-[13px]' : 'text-[14px]', a.miles < 0 ? 'text-ink-muted' : pending ? 'text-brand-blue' : 'text-success')}>
        {a.miles > 0 ? '+' : ''}
        {formatNumber(a.miles)}
      </span>
    </div>
  )
}
