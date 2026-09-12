import { useMemo } from 'react'
import { isUnavailable, seatType } from '../../utils/seats'
import { cn } from '../../utils/cn'

const ROWS = Array.from({ length: 12 }, (_, i) => 14 + i) // rows 14–25
const LEFT = ['A', 'B', 'C']
const RIGHT = ['D', 'E', 'F']

export function SeatMap({ selected, onSelect, seed = 'GA412', className }: { selected: string | null; onSelect: (seat: string) => void; seed?: string; className?: string }) {
  const exitRows = useMemo(() => new Set([20]), [])
  const Seat = ({ id }: { id: string }) => {
    const unavailable = isUnavailable(id, seed)
    const isSelected = selected === id
    return (
      <button
        type="button"
        disabled={unavailable}
        aria-label={`Seat ${id} ${unavailable ? 'unavailable' : seatType(id)}`}
        aria-pressed={isSelected}
        onClick={() => onSelect(id)}
        className={cn(
          'h-9 w-9 rounded-t-lg rounded-b-md text-[10.5px] font-semibold border-b-[3px] transition-all duration-150',
          unavailable && 'bg-surface-line border-ink-faint/30 text-ink-faint/60 cursor-not-allowed',
          !unavailable && !isSelected && 'bg-brand-blue-light border-brand-blue/40 text-brand-navy hover:bg-brand-blue/20',
          isSelected && 'bg-brand-turquoise border-brand-turquoise text-white scale-105 shadow-card',
        )}
      >
        {isSelected ? id : id.slice(-1)}
      </button>
    )
  }

  return (
    <div className={cn('rounded-[28px] border border-surface-line bg-white px-4 pt-5 pb-6', className)}>
      <div className="mx-auto w-36 h-9 rounded-t-full bg-surface-off border border-b-0 border-surface-line flex items-end justify-center pb-1 text-[10px] font-semibold text-ink-faint tracking-[0.1em] uppercase">
        Front
      </div>
      <div className="flex justify-center gap-6 text-[10px] font-semibold text-ink-faint mt-3 mb-2">
        <div className="flex gap-1.5">
          {LEFT.map((l) => (
            <span key={l} className="w-9 text-center">
              {l}
            </span>
          ))}
        </div>
        <span className="w-6" />
        <div className="flex gap-1.5">
          {RIGHT.map((l) => (
            <span key={l} className="w-9 text-center">
              {l}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {ROWS.map((row) => (
          <div key={row}>
            {exitRows.has(row) && (
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-success py-1 px-1">
                <span>Exit</span>
                <span>Exit</span>
              </div>
            )}
            <div className="flex justify-center items-center gap-6">
              <div className="flex gap-1.5">
                {LEFT.map((l) => (
                  <Seat key={l} id={`${row}${l}`} />
                ))}
              </div>
              <span className="w-6 text-center text-[10px] font-semibold text-ink-faint">{row}</span>
              <div className="flex gap-1.5">
                {RIGHT.map((l) => (
                  <Seat key={l} id={`${row}${l}`} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SeatLegend() {
  return (
    <div className="flex items-center justify-center gap-5 text-[11px] text-ink-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded-sm bg-brand-blue-light border border-brand-blue/40" /> Available
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded-sm bg-brand-turquoise" /> Selected
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded-sm bg-surface-line" /> Unavailable
      </span>
    </div>
  )
}
