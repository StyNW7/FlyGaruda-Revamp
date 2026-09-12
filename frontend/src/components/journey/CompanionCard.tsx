import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

/** Proactive guidance card used on Home and inside the Journey Companion. */
export function CompanionCard({
  icon: Icon,
  title,
  description,
  to,
  tone = 'default',
  meta,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  to?: string
  tone?: 'default' | 'warning' | 'success' | 'turquoise'
  meta?: string
  className?: string
}) {
  const tones = {
    default: { icon: 'bg-brand-blue-light text-brand-blue', border: 'border-surface-line' },
    warning: { icon: 'bg-warning-soft text-warning', border: 'border-warning/30' },
    success: { icon: 'bg-success-soft text-success', border: 'border-success/25' },
    turquoise: { icon: 'bg-brand-turquoise-soft text-brand-turquoise', border: 'border-surface-line' },
  }
  const t = tones[tone]
  const body = (
    <>
      <span className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', t.icon)}>
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-ink leading-snug">{title}</span>
        </span>
        <span className="block text-[12.5px] text-ink-muted mt-0.5 leading-snug">{description}</span>
        {meta && <span className="block text-[11px] text-ink-faint mt-1">{meta}</span>}
      </span>
      {to && <ChevronRight className="h-4 w-4 text-ink-faint shrink-0 self-center" />}
    </>
  )
  const cls = cn('card flex items-start gap-3 p-3.5 text-left w-full', t.border, to && 'press', className)
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
