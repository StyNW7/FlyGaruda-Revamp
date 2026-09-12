import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

/** Scrollable page body with consistent horizontal padding. */
export function PageContainer({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return <div className={cn('relative z-10 flex-1 w-full', padded && 'px-4', className)}>{children}</div>
}

/** Sticky call-to-action bar that sits at the bottom of the scroll area (never overlaps the nav). */
export function StickyCTA({ children, className, note }: { children: ReactNode; className?: string; note?: ReactNode }) {
  return (
    <div className={cn('sticky bottom-0 z-30 mt-auto bg-white/95 backdrop-blur border-t border-surface-line safe-bottom', className)}>
      {note && <div className="px-4 pt-3 text-[12px] text-ink-muted">{note}</div>}
      <div className="px-4 py-3 flex items-center gap-3">{children}</div>
    </div>
  )
}

export function SectionHeader({
  title,
  subtitle,
  action,
  to,
  className,
  onAction,
}: {
  title: string
  subtitle?: string
  action?: string
  to?: string
  onAction?: () => void
  className?: string
}) {
  const actionEl =
    action &&
    (to ? (
      <Link to={to} className="text-[13px] font-semibold text-brand-blue inline-flex items-center gap-0.5 hover:underline">
        {action}
        <ChevronRight className="h-4 w-4" />
      </Link>
    ) : (
      <button type="button" onClick={onAction} className="text-[13px] font-semibold text-brand-blue inline-flex items-center gap-0.5 hover:underline">
        {action}
        <ChevronRight className="h-4 w-4" />
      </button>
    ))
  return (
    <div className={cn('flex items-end justify-between gap-3 mb-3', className)}>
      <div>
        <h2 className="t-h2">{title}</h2>
        {subtitle && <p className="t-caption mt-0.5">{subtitle}</p>}
      </div>
      {actionEl}
    </div>
  )
}

export function Card({ children, className, onClick, as: Tag = 'div' }: { children: ReactNode; className?: string; onClick?: () => void; as?: 'div' | 'section' | 'article' }) {
  return (
    <Tag className={cn('card', onClick && 'cursor-pointer press', className)} onClick={onClick}>
      {children}
    </Tag>
  )
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('border-t border-surface-line', className)} />
}

export function InfoRow({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-2', className)}>
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="text-[13px] font-semibold text-ink text-right">{value}</span>
    </div>
  )
}

export function Avatar({ name, initials, size = 'md', className }: { name: string; initials: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-[13px]', lg: 'h-16 w-16 text-[20px]' }
  return (
    <div
      role="img"
      aria-label={name}
      className={cn('rounded-full bg-brand-navy text-white font-bold flex items-center justify-center ring-2 ring-white shadow-card', sizes[size], className)}
    >
      {initials}
    </div>
  )
}
