import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Target, X } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { findReward } from '../../data/miles'
import { ProgressBar } from '../common/States'
import { formatNumber } from '../../utils/format'
import { cn } from '../../utils/cn'

/** The reward the member is saving for, with progress and a realistic "flights to go" estimate. */
export function GoalCard({ compact, className }: { compact?: boolean; className?: string }) {
  const { state, miles, dispatch } = useApp()
  const navigate = useNavigate()
  const reward = state.milesGoal ? findReward(state.milesGoal) : undefined

  if (!reward) {
    if (compact) return null
    return (
      <button type="button" onClick={() => navigate('/miles/benefits?tab=rewards')} className={cn('w-full card p-4 flex items-center gap-3 text-left press', className)}>
        <span className="h-11 w-11 rounded-xl bg-brand-gold-soft text-[#8A6A1F] flex items-center justify-center shrink-0">
          <Target className="h-5 w-5" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-bold text-ink">Set a miles goal</span>
          <span className="block text-[12px] text-ink-muted">Pick a reward to save for and we will track every mile towards it.</span>
        </span>
        <ArrowRight className="h-4 w-4 text-ink-faint" />
      </button>
    )
  }

  const reached = miles.balance >= reward.miles
  const remaining = Math.max(0, reward.miles - miles.balance)
  const perFlight = Math.round(850 * (1 + miles.tier.bonus / 100))
  const flightsToGo = Math.ceil(remaining / perFlight)
  const Icon = reward.icon

  return (
    <section className={cn('card p-4', className)}>
      <div className="flex items-start gap-3">
        <span className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0', reached ? 'bg-success-soft text-success' : 'bg-brand-gold-soft text-[#8A6A1F]')}>
          {reached ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="t-label">{reached ? 'Goal reached' : 'Saving for'}</p>
          <p className="text-[14.5px] font-bold text-ink leading-snug">{reward.title}</p>
          <p className="text-[12px] text-ink-muted mt-0.5">
            {reached ? 'You have enough miles — redeem it whenever you like.' : `${formatNumber(remaining)} miles to go · about ${flightsToGo} Jakarta–Bali flight${flightsToGo > 1 ? 's' : ''} at your tier`}
          </p>
        </div>
        {!compact && (
          <button type="button" aria-label="Remove goal" onClick={() => dispatch({ type: 'SET_MILES_GOAL', rewardId: null })} className="h-8 w-8 -mr-1 -mt-1 rounded-full flex items-center justify-center text-ink-faint hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <ProgressBar value={Math.min(miles.balance, reward.miles)} max={reward.miles} tone={reached ? 'turquoise' : 'gold'} className="mt-3" label="Goal progress" />
      <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-ink-muted">
        <span>
          <span className="font-semibold text-ink">{formatNumber(Math.min(miles.balance, reward.miles))}</span> / {formatNumber(reward.miles)} miles
        </span>
        <button type="button" onClick={() => navigate(reached ? '/miles/benefits?tab=rewards' : '/book')} className="font-semibold text-brand-blue inline-flex items-center gap-0.5">
          {reached ? 'Redeem now' : 'Book a flight'} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  )
}
