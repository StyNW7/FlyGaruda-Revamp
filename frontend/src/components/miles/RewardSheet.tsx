import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Copy, Gift, Info } from 'lucide-react'
import type { Reward, Voucher } from '../../types'
import { BottomSheet } from '../common/Overlays'
import { Button } from '../common/Button'
import { Mascot } from '../common/Mascot'
import { useToast } from '../common/Toast'
import { useApp } from '../../store/AppContext'
import { copyText, todayISO } from '../../utils/share'
import { formatNumber, formatShortDate, generateBookingCode } from '../../utils/format'
import { cn } from '../../utils/cn'

function expiryFor(reward: Reward): string {
  const months = /(\d+)\s*months/.exec(reward.validity)?.[1]
  const d = new Date()
  d.setMonth(d.getMonth() + (months ? Number(months) : 12))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Full redemption flow: review → confirm → voucher issued. Miles are really deducted from the balance. */
export function RewardSheet({ reward, onClose }: { reward: Reward | null; onClose: () => void }) {
  const { miles, dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState<'review' | 'done'>('review')
  const [issued, setIssued] = useState<Voucher | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (reward) {
      setStep('review')
      setIssued(null)
    }
  }, [reward])

  if (!reward) return null
  const enough = miles.balance >= reward.miles
  const after = miles.balance - reward.miles
  const Icon = reward.icon

  const redeem = () => {
    if (!enough) return
    setBusy(true)
    window.setTimeout(() => {
      const date = todayISO()
      const voucher: Voucher = {
        id: `v-${Date.now()}`,
        rewardId: reward.id,
        title: reward.title,
        code: `GM-${generateBookingCode(reward.id + Date.now())}`,
        miles: reward.miles,
        issuedAt: date,
        expires: expiryFor(reward),
        status: 'active',
      }
      dispatch({ type: 'REDEEM_REWARD', reward, voucher, date })
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: `reward-${voucher.id}`,
          category: 'miles',
          title: `Reward issued · ${reward.title}`,
          body: `${formatNumber(reward.miles)} miles redeemed. Voucher ${voucher.code} is in My Rewards.`,
          time: 'Just now',
          to: '/miles/rewards',
          iconKey: 'gift',
        },
      })
      setIssued(voucher)
      setStep('done')
      setBusy(false)
    }, 900)
  }

  return (
    <BottomSheet
      open={reward !== null}
      onClose={onClose}
      title={step === 'done' ? undefined : reward.title}
      subtitle={step === 'done' ? undefined : reward.description}
      footer={
        step === 'done' ? (
          <div className="flex gap-2">
            <Button variant="secondary" full onClick={onClose}>
              Done
            </Button>
            <Button full rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => { onClose(); navigate('/miles/rewards') }}>
              My Rewards
            </Button>
          </div>
        ) : enough ? (
          <Button full size="lg" loading={busy} onClick={redeem} leftIcon={<Gift className="h-4 w-4" />}>
            Redeem for {formatNumber(reward.miles)} miles
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" full onClick={onClose}>
              Close
            </Button>
            <Button full onClick={() => { onClose(); navigate('/book') }}>
              Earn miles · Book a flight
            </Button>
          </div>
        )
      }
    >
      {step === 'review' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-12 w-12 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className="text-[13px] text-ink-muted">{reward.validity}</p>
              <p className="text-[20px] font-bold text-brand-navy leading-tight">{formatNumber(reward.miles)} miles</p>
            </div>
          </div>

          <div className="rounded-xl bg-surface-off p-3.5 text-[13px] space-y-2">
            <div className="flex justify-between">
              <span className="text-ink-muted">Your balance</span>
              <span className="font-semibold">{formatNumber(miles.balance)} miles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">This reward</span>
              <span className="font-semibold">− {formatNumber(reward.miles)} miles</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-surface-line">
              <span className="font-semibold text-ink">Balance after</span>
              <span className={cn('font-bold', enough ? 'text-success' : 'text-error')}>{enough ? `${formatNumber(after)} miles` : `${formatNumber(Math.abs(after))} miles short`}</span>
            </div>
          </div>

          {!enough && (
            <div className="rounded-xl bg-warning-soft border border-warning/20 p-3 text-[12.5px] text-ink flex items-start gap-2">
              <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <span>You need {formatNumber(Math.abs(after))} more miles. A Jakarta → Bali flight earns about 1,062 miles at your tier.</span>
            </div>
          )}

          <div>
            <p className="t-label mb-2">Conditions</p>
            <ul className="space-y-1.5">
              {reward.terms.map((t) => (
                <li key={t} className="flex items-start gap-2 text-[12.5px] text-ink-soft leading-snug">
                  <Check className="h-3.5 w-3.5 text-brand-turquoise shrink-0 mt-0.5" strokeWidth={2.5} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[11px] text-ink-faint">Redemptions are confirmed instantly and appear in your activity. Miles are deducted from your balance in this prototype.</p>
        </div>
      ) : (
        issued && (
          <div className="flex flex-col items-center text-center animate-fade-up pb-2">
            <div className="relative">
              <Mascot name="love" size={150} />
              <span className="absolute -right-1 top-4 h-10 w-10 rounded-full bg-brand-turquoise text-white flex items-center justify-center shadow-float animate-check-pop">
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
            </div>
            <h2 className="t-h1 mt-2">Reward issued</h2>
            <p className="t-body mt-1 max-w-[280px]">{issued.title} is ready to use. {formatNumber(issued.miles)} miles have been deducted.</p>
            <div className="mt-4 w-full rounded-2xl border border-dashed border-brand-turquoise/50 bg-brand-turquoise-soft/50 p-4">
              <p className="t-label text-brand-turquoise">Voucher code</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="font-mono text-[22px] font-bold tracking-[0.18em] text-ink">{issued.code}</span>
                <button type="button" aria-label="Copy voucher code" onClick={() => copyText(issued.code).then((ok) => toast(ok ? 'Voucher code copied' : 'Could not copy', ok ? 'success' : 'warning'))} className="h-8 w-8 rounded-full bg-white border border-surface-line flex items-center justify-center text-brand-navy">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11.5px] text-ink-muted mt-1">Valid until {formatShortDate(issued.expires)}</p>
            </div>
            <p className="text-[12.5px] text-ink-muted mt-3">
              New balance: <span className="font-semibold text-ink">{formatNumber(miles.balance)} miles</span>
            </p>
          </div>
        )
      )}
    </BottomSheet>
  )
}
