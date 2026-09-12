import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { Check, ChevronRight, Minus, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: LucideIcon
  rightSlot?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon: LeftIcon, rightSlot, className, id, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-[12px] font-semibold text-ink-soft mb-1.5">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2.5 h-12 rounded-xl border bg-white px-3.5 transition-colors',
          'focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15',
          error ? 'border-error' : 'border-surface-line',
        )}
      >
        {LeftIcon && <LeftIcon className="h-[18px] w-[18px] text-ink-faint shrink-0" aria-hidden />}
        <input
          ref={ref}
          id={inputId}
          className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-ink placeholder:text-ink-faint"
          {...rest}
        />
        {rightSlot}
      </div>
      {error ? <p className="mt-1.5 text-[12px] text-error">{error}</p> : hint ? <p className="mt-1.5 text-[12px] text-ink-muted">{hint}</p> : null}
    </div>
  )
})

/** Tappable field row that opens a bottom sheet (airport, date, passengers…). */
export function FieldRow({
  label,
  value,
  placeholder,
  icon: Icon,
  onClick,
  className,
  trailing,
  compact,
}: {
  label: string
  value?: ReactNode
  placeholder?: string
  icon?: LucideIcon
  onClick?: () => void
  className?: string
  trailing?: ReactNode
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 text-left tap rounded-xl',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
        className,
      )}
    >
      {Icon && (
        <span className="h-10 w-10 rounded-full bg-surface-soft text-brand-navy flex items-center justify-center shrink-0">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">{label}</span>
        <span className={cn('block text-[15px] font-semibold truncate mt-0.5', value ? 'text-ink' : 'text-ink-faint font-medium')}>
          {value ?? placeholder}
        </span>
      </span>
      {trailing ?? <ChevronRight className="h-4 w-4 text-ink-faint shrink-0" />}
    </button>
  )
}

export function Toggle({ checked, onChange, label, description, className, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string; className?: string; ariaLabel?: string }) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer select-none', className)}>
      {(label || description) && (
        <span className="flex-1 min-w-0">
          {label && <span className="block text-[14px] font-semibold text-ink">{label}</span>}
          {description && <span className="block text-[12px] text-ink-muted mt-0.5">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 rounded-full transition-colors duration-200 shrink-0',
          checked ? 'bg-brand-turquoise' : 'bg-surface-line',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </label>
  )
}

export function Checkbox({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; className?: string }) {
  return (
    <label className={cn('flex items-start gap-3 cursor-pointer select-none', className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors',
          checked ? 'bg-brand-navy border-brand-navy text-white' : 'bg-white border-surface-line',
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
      <span className="text-[13px] text-ink-soft leading-snug">{label}</span>
    </label>
  )
}

export function RadioRow({
  checked,
  onSelect,
  title,
  description,
  right,
  icon: Icon,
  className,
}: {
  checked: boolean
  onSelect: () => void
  title: string
  description?: string
  right?: ReactNode
  icon?: LucideIcon
  className?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors',
        checked ? 'border-brand-blue bg-brand-blue-light/60' : 'border-surface-line bg-white hover:bg-surface-off',
        className,
      )}
    >
      {Icon && (
        <span className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0', checked ? 'bg-white text-brand-blue' : 'bg-surface-soft text-brand-navy')}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-semibold text-ink">{title}</span>
        {description && <span className="block text-[12px] text-ink-muted mt-0.5">{description}</span>}
      </span>
      {right}
      <span
        className={cn(
          'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0',
          checked ? 'border-brand-blue' : 'border-surface-line',
        )}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
      </span>
    </button>
  )
}

export function Stepper({ value, onChange, min = 0, max = 9, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex items-center gap-2" aria-label={label}>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="h-9 w-9 rounded-full border border-surface-line flex items-center justify-center text-brand-navy disabled:text-ink-faint disabled:border-surface-soft hover:bg-surface-off"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-[15px] font-bold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="h-9 w-9 rounded-full border border-surface-line flex items-center justify-center text-brand-navy disabled:text-ink-faint disabled:border-surface-soft hover:bg-surface-off"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Chip({ active, children, onClick, className }: { active?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-semibold border transition-colors whitespace-nowrap',
        active ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-ink-soft border-surface-line hover:bg-surface-off',
        className,
      )}
    >
      {children}
    </button>
  )
}
