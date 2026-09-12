import { Check, X } from 'lucide-react'
import type { FareFamily } from '../../types'
import { formatRupiah } from '../../utils/format'
import { cn } from '../../utils/cn'

export function FareCard({ fare, price, selected, onSelect, recommended }: { fare: FareFamily; price: number; selected: boolean; onSelect: () => void; recommended?: boolean }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'w-full text-left card p-4 transition-all duration-200',
        selected ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'hover:border-ink-faint/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-ink">{fare.name}</h3>
            {recommended && <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-brand-turquoise-soft text-brand-turquoise px-2 py-0.5">Popular</span>}
          </div>
          <p className="text-[12px] text-ink-muted mt-0.5">{fare.tagline}</p>
        </div>
        <span className={cn('h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5', selected ? 'bg-brand-blue border-brand-blue text-white' : 'border-surface-line')}>
          {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
      </div>
      <p className="text-[20px] font-bold text-brand-navy tracking-tight mt-3">{formatRupiah(price)}</p>
      <p className="text-[11px] text-ink-muted -mt-0.5">per adult · {fare.milesMultiplier}</p>
      <ul className="mt-3 grid grid-cols-1 gap-1.5">
        {fare.features.map((f) => (
          <li key={f.label} className="flex items-center gap-2 text-[12.5px]">
            {f.included ? (
              <Check className="h-4 w-4 text-success shrink-0" strokeWidth={2.5} />
            ) : (
              <X className="h-4 w-4 text-ink-faint shrink-0" strokeWidth={2.5} />
            )}
            <span className="text-ink-soft">{f.label}</span>
            <span className={cn('ml-auto font-semibold', f.included ? 'text-ink' : 'text-ink-muted')}>{f.value}</span>
          </li>
        ))}
      </ul>
    </button>
  )
}
