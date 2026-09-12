import { Check } from 'lucide-react'
import type { JourneyStage } from '../../types'
import { STAGES, stageIndex } from '../../data/trips'
import { cn } from '../../utils/cn'

/** Horizontal six-stage journey progress: Booking → Check-in → Airport → Boarding → In Flight → Arrival. */
export function JourneyTimeline({ stage, tone = 'light', className, compact }: { stage: JourneyStage; tone?: 'light' | 'navy'; className?: string; compact?: boolean }) {
  const current = stageIndex(stage)
  const dark = tone === 'navy'
  return (
    <ol className={cn('flex items-start', className)} aria-label="Journey progress">
      {STAGES.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s.id} className="flex-1 flex flex-col items-center relative min-w-0">
            {i > 0 && (
              <span
                className={cn(
                  'absolute top-[11px] right-1/2 left-[-50%] h-[2px]',
                  done || active ? (dark ? 'bg-brand-turquoise-light' : 'bg-brand-turquoise') : dark ? 'bg-white/15' : 'bg-surface-line',
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                'relative z-10 h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors',
                done && (dark ? 'bg-brand-turquoise-light border-brand-turquoise-light text-brand-navy' : 'bg-brand-turquoise border-brand-turquoise text-white'),
                active && (dark ? 'bg-white border-white' : 'bg-white border-brand-turquoise'),
                !done && !active && (dark ? 'bg-brand-navy border-white/20' : 'bg-white border-surface-line'),
              )}
            >
              {done ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : active ? (
                <span className={cn('h-2.5 w-2.5 rounded-full animate-pulse-soft', dark ? 'bg-brand-navy' : 'bg-brand-turquoise')} />
              ) : (
                <span className={cn('h-1.5 w-1.5 rounded-full', dark ? 'bg-white/30' : 'bg-surface-line')} />
              )}
            </span>
            {!compact && (
              <span
                className={cn(
                  'mt-1.5 text-[10px] leading-tight text-center font-medium px-0.5',
                  active ? (dark ? 'text-white font-bold' : 'text-brand-navy font-bold') : dark ? 'text-white/60' : done ? 'text-ink-soft' : 'text-ink-faint',
                )}
              >
                {s.short}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
