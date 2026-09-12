import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ListRowProps {
  icon?: LucideIcon
  title: string
  description?: string
  to?: string
  onClick?: () => void
  right?: ReactNode
  badge?: string
  className?: string
  iconTone?: 'navy' | 'turquoise' | 'blue' | 'gold' | 'error'
  chevron?: boolean
}

const ICON_TONES = {
  navy: 'bg-surface-soft text-brand-navy',
  turquoise: 'bg-brand-turquoise-soft text-brand-turquoise',
  blue: 'bg-brand-blue-light text-brand-blue',
  gold: 'bg-brand-gold-soft text-[#8A6A1F]',
  error: 'bg-error-soft text-error',
}

export function ListRow({ icon: Icon, title, description, to, onClick, right, badge, className, iconTone = 'navy', chevron = true }: ListRowProps) {
  const content = (
    <>
      {Icon && (
        <span className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', ICON_TONES[iconTone])}>
          <Icon className="h-[19px] w-[19px]" strokeWidth={1.9} />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-ink truncate">{title}</span>
          {badge && <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-brand-blue-light text-brand-blue px-2 py-0.5">{badge}</span>}
        </span>
        {description && <span className="block text-[12px] text-ink-muted truncate mt-0.5">{description}</span>}
      </span>
      {right}
      {chevron && <ChevronRight className="h-4 w-4 text-ink-faint shrink-0" />}
    </>
  )
  const cls = cn('w-full flex items-center gap-3 px-4 py-3 text-left tap', className)
  if (to) {
    return (
      <Link to={to} className={cls}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {content}
    </button>
  )
}

/** Square icon tile used for quick actions and explore grids. */
export function IconTile({
  icon: Icon,
  label,
  sublabel,
  to,
  onClick,
  disabled,
  tone = 'navy',
  className,
}: {
  icon: LucideIcon
  label: string
  sublabel?: string
  to?: string
  onClick?: () => void
  disabled?: boolean
  tone?: 'navy' | 'turquoise' | 'blue' | 'gold'
  className?: string
}) {
  const tones = {
    navy: 'bg-surface-soft text-brand-navy',
    turquoise: 'bg-brand-turquoise-soft text-brand-turquoise',
    blue: 'bg-brand-blue-light text-brand-blue',
    gold: 'bg-brand-gold-soft text-[#8A6A1F]',
  }
  const inner = (
    <>
      <span className={cn('h-12 w-12 rounded-2xl flex items-center justify-center transition-colors', disabled ? 'bg-surface-soft text-ink-faint' : tones[tone])}>
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
      </span>
      <span className={cn('text-[12px] font-semibold leading-tight text-center', disabled ? 'text-ink-faint' : 'text-ink')}>{label}</span>
      {sublabel && <span className="text-[10.5px] text-ink-faint leading-tight text-center -mt-0.5">{sublabel}</span>}
    </>
  )
  const cls = cn('flex flex-col items-center gap-1.5 py-1 press', disabled && 'cursor-not-allowed active:scale-100', className)
  if (to && !disabled) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-disabled={disabled}>
      {inner}
    </button>
  )
}
