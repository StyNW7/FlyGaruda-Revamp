import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Check, ChevronRight, Receipt, Trash2 } from 'lucide-react'
import type { CatalogItem } from '../../data/featureContent'
import type { Purchase, PurchaseKind } from '../../types'
import { BottomSheet, Modal } from '../common/Overlays'
import { Button } from '../common/Button'
import { useToast } from '../common/Toast'
import { useApp } from '../../store/AppContext'
import { formatNumber, formatRupiah, formatShortDate, generateBookingCode } from '../../utils/format'
import { todayISO } from '../../utils/share'
import { cn } from '../../utils/cn'

/** Bookable partner catalogue. Purchases are stored in the account and earn miles where applicable. */
export function ServiceCatalog({ kind, items, unit, title = 'Available now' }: { kind: PurchaseKind; items: CatalogItem[]; unit?: string; title?: string }) {
  const { state, dispatch, isMember } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [item, setItem] = useState<CatalogItem | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Purchase | null>(null)
  const [remove, setRemove] = useState<Purchase | null>(null)
  const history = state.purchases.filter((p) => p.kind === kind)

  const confirm = () => {
    if (!item) return
    setBusy(true)
    window.setTimeout(() => {
      const purchase: Purchase = {
        id: `pu-${Date.now()}`,
        kind,
        title: item.title,
        detail: item.detail,
        price: item.price,
        date: todayISO(),
        status: 'confirmed',
        milesEarned: isMember ? item.miles : undefined,
        reference: `${kind.slice(0, 2).toUpperCase()}-${generateBookingCode(item.id + Date.now())}`,
      }
      dispatch({ type: 'ADD_PURCHASE', purchase })
      if (isMember && item.miles) {
        dispatch({ type: 'EARN_MILES', entry: { date: purchase.date, title: item.title, subtitle: 'Partner miles · posted instantly', miles: item.miles, type: 'earn' } })
      }
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: { id: `purchase-${purchase.id}`, category: item.miles ? 'miles' : 'travel', title: `Booked · ${item.title}`, body: `${item.detail}. Reference ${purchase.reference}.${item.miles && isMember ? ` ${formatNumber(item.miles)} miles credited.` : ''}`, time: 'Just now', to: window.location.pathname, iconKey: item.miles ? 'award' : 'ticket' },
      })
      setBusy(false)
      setDone(purchase)
    }, 900)
  }

  const close = () => {
    setItem(null)
    setDone(null)
  }

  return (
    <>
      <section>
        <p className="t-label mb-2">{title}</p>
        <div className="card divide-y divide-surface-line overflow-hidden">
          {items.map((it) => (
            <button key={it.id} type="button" onClick={() => setItem(it)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left tap">
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink">{it.title}</span>
                  {it.tag && <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-brand-turquoise-soft text-brand-turquoise px-2 py-0.5">{it.tag}</span>}
                </span>
                <span className="block text-[12px] text-ink-muted mt-0.5">{it.detail}</span>
              </span>
              <span className="text-right shrink-0">
                <span className="block text-[13px] font-bold text-brand-navy">{formatRupiah(it.price)}</span>
                {unit && <span className="block text-[10.5px] text-ink-faint">{unit}</span>}
                {it.miles && <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#8A6A1F] mt-0.5"><Award className="h-3 w-3" /> +{it.miles} miles</span>}
              </span>
              <ChevronRight className="h-4 w-4 text-ink-faint shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {history.length > 0 && (
        <section>
          <p className="t-label mb-2">Your bookings</p>
          <div className="card divide-y divide-surface-line overflow-hidden">
            {history.map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-success-soft text-success flex items-center justify-center shrink-0">
                  <Receipt className="h-4 w-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold text-ink truncate">{p.title}</span>
                  <span className="block text-[11.5px] text-ink-muted truncate">{formatShortDate(p.date)}{p.reference ? ` · ${p.reference}` : ''}{p.milesEarned ? ` · +${p.milesEarned} miles` : ''}</span>
                </span>
                <span className="text-[12.5px] font-semibold text-ink">{formatRupiah(p.price)}</span>
                {!p.id.startsWith('pu-seed') && (
                  <button type="button" aria-label="Cancel booking" onClick={() => setRemove(p)} className="h-8 w-8 rounded-full flex items-center justify-center text-ink-faint hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <BottomSheet
        open={item !== null}
        onClose={close}
        title={done ? undefined : item?.title}
        subtitle={done ? undefined : item?.detail}
        footer={
          done ? (
            <div className="flex gap-2">
              <Button variant="secondary" full onClick={close}>Done</Button>
              {done.milesEarned ? <Button full onClick={() => navigate('/miles/activity')}>View miles</Button> : null}
            </div>
          ) : (
            <Button full size="lg" loading={busy} onClick={confirm}>
              Confirm · {item ? formatRupiah(item.price) : ''}
            </Button>
          )
        }
      >
        {done ? (
          <div className="flex flex-col items-center text-center py-3 animate-fade-up">
            <span className="h-14 w-14 rounded-full bg-success-soft text-success flex items-center justify-center mb-3 animate-check-pop">
              <Check className="h-7 w-7" strokeWidth={3} />
            </span>
            <p className="t-h3">Booking confirmed</p>
            <p className="t-caption mt-1 max-w-[280px]">{done.title}. Reference <span className="font-mono font-semibold text-ink">{done.reference}</span>. A confirmation is in your notifications.</p>
            {done.milesEarned ? <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-gold-soft text-[#8A6A1F] px-3 py-1.5 text-[12px] font-bold"><Award className="h-3.5 w-3.5" /> +{formatNumber(done.milesEarned)} miles credited</p> : null}
          </div>
        ) : (
          item && (
            <div className="space-y-3">
              <div className="rounded-xl bg-surface-off p-3.5 text-[13px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Price</span>
                  <span className="font-semibold">{formatRupiah(item.price)}{unit ? ` ${unit}` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Payment</span>
                  <span className="font-semibold">{state.paymentMethods.find((m) => m.isDefault)?.detail ?? 'Visa •••• 4821'}</span>
                </div>
                {item.miles && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">GarudaMiles</span>
                    <span className={cn('font-semibold', isMember ? 'text-success' : 'text-ink-muted')}>{isMember ? `+${item.miles} miles` : 'Sign in to earn'}</span>
                  </div>
                )}
              </div>
              <p className="text-[11.5px] text-ink-faint">Free cancellation up to 24 hours before. No real payment is processed in this prototype.</p>
            </div>
          )
        )}
      </BottomSheet>

      <Modal open={remove !== null} onClose={() => setRemove(null)} title="Cancel this booking?">
        <p className="t-body">{remove?.title} will be cancelled and refunded to the original payment method.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" full onClick={() => setRemove(null)}>Keep</Button>
          <Button variant="danger" full onClick={() => { if (remove) dispatch({ type: 'REMOVE_PURCHASE', id: remove.id }); setRemove(null); toast('Booking cancelled · refund in 5 working days', 'info') }}>Cancel booking</Button>
        </div>
      </Modal>
    </>
  )
}
