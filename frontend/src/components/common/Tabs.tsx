import { cn } from '../../utils/cn'

export interface TabItem<T extends string> {
  id: T
  label: string
  count?: number
}

/** Segmented control style tabs (used inside cards / headers). */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  tone = 'light',
  className,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (v: T) => void
  tone?: 'light' | 'navy'
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn('relative grid rounded-xl p-1', tone === 'navy' ? 'bg-white/10' : 'bg-surface-soft', className)}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'h-9 rounded-lg text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5',
              active
                ? tone === 'navy'
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'bg-white text-brand-navy shadow-sm'
                : tone === 'navy'
                  ? 'text-white/75 hover:text-white'
                  : 'text-ink-muted hover:text-ink',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span className={cn('text-[11px] rounded-full px-1.5 py-0.5', active ? 'bg-brand-turquoise-soft text-brand-turquoise' : 'bg-surface-line text-ink-muted')}>
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Underline tabs for page-level sections. */
export function UnderlineTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div role="tablist" className={cn('flex gap-1 border-b border-surface-line overflow-x-auto no-scrollbar', className)}>
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'relative h-11 px-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors',
              active ? 'text-brand-navy' : 'text-ink-muted hover:text-ink',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {item.label}
              {typeof item.count === 'number' && item.count > 0 && (
                <span className="text-[11px] rounded-full bg-surface-soft px-1.5 py-0.5 text-ink-muted">{item.count}</span>
              )}
            </span>
            <span
              className={cn(
                'absolute left-2 right-2 bottom-0 h-[3px] rounded-full bg-brand-turquoise transition-transform duration-200 origin-center',
                active ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
