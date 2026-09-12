import { Check, Minus } from 'lucide-react'
import { BottomSheet } from './Overlays'
import { Button } from './Button'
import { FEATURE_CONTENT } from '../../data/featureContent'
import { FARE_FAMILIES } from '../../data/flights'
import type { FareId } from '../../types'
import { cn } from '../../utils/cn'

export type TermsKind = 'terms' | 'privacy-policy' | 'fare-rules' | 'programme'

const TITLES: Record<TermsKind, { title: string; subtitle: string }> = {
  terms: { title: 'Conditions of carriage', subtitle: 'Summary for this prototype' },
  'privacy-policy': { title: 'Privacy policy', subtitle: 'How your data is used' },
  'fare-rules': { title: 'Fare rules', subtitle: 'What your fare family includes' },
  programme: { title: 'GarudaMiles programme terms', subtitle: 'Summary for this prototype' },
}

const PROGRAMME = [
  'Membership is free and open to individuals aged 12 and above.',
  'Miles are credited within 72 hours of a Garuda flight and within 14 days for partners.',
  'Tier status is reviewed every 12 months based on tier miles earned.',
  'Award redemptions are subject to availability; taxes are payable in cash.',
  'Miles are valid for 3 years for Blue and Silver members and do not expire for Gold and Platinum.',
]

/** Inline reader for legal / fare content so a link never dead-ends the flow it sits in. */
export function TermsSheet({ open, onClose, kind, fareId }: { open: boolean; onClose: () => void; kind: TermsKind; fareId?: FareId }) {
  const meta = TITLES[kind]
  const fare = FARE_FAMILIES.find((f) => f.id === (fareId ?? 'value'))
  const content = kind === 'terms' || kind === 'privacy-policy' ? FEATURE_CONTENT[kind] : undefined
  return (
    <BottomSheet open={open} onClose={onClose} title={meta.title} subtitle={kind === 'fare-rules' && fare ? fare.name : meta.subtitle} footer={<Button full onClick={onClose}>Got it</Button>}>
      {kind === 'fare-rules' && fare ? (
        <ul className="divide-y divide-surface-line">
          {fare.features.map((f) => (
            <li key={f.label} className="py-2.5 flex items-center gap-3 text-[13px]">
              <span className={cn('h-6 w-6 rounded-full flex items-center justify-center shrink-0', f.included ? 'bg-success-soft text-success' : 'bg-surface-soft text-ink-faint')}>{f.included ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Minus className="h-3.5 w-3.5" />}</span>
              <span className="flex-1 text-ink">{f.label}</span>
              <span className={cn('font-semibold', f.included ? 'text-ink' : 'text-ink-muted')}>{f.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-3">
          {content?.intro && <p className="t-body">{content.intro}</p>}
          {(content?.sections ?? [{ title: 'Summary', items: PROGRAMME }]).map((s) => (
            <div key={s.title} className="rounded-xl bg-surface-off p-3.5">
              <p className="text-[13px] font-bold text-ink mb-1.5">{s.title}</p>
              <ul className="space-y-1.5">
                {s.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-[12.5px] text-ink-soft leading-snug">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-turquoise mt-2 shrink-0" /> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-[11px] text-ink-faint">{content?.note ?? 'Prototype summary — refer to garuda-indonesia.com for the full terms.'}</p>
        </div>
      )}
    </BottomSheet>
  )
}
