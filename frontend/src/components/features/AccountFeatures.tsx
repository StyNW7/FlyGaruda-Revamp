import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, CreditCard, Download, Globe, Landmark, Plus, QrCode, ShieldCheck, Smartphone, Star, Trash2, UserPlus, Wallet, Award } from 'lucide-react'
import type { PaymentMethodItem, SavedPassenger } from '../../types'
import { BottomSheet, Modal } from '../common/Overlays'
import { Button } from '../common/Button'
import { Input, Toggle } from '../common/Inputs'
import { useToast } from '../common/Toast'
import { useApp, type Prefs } from '../../store/AppContext'
import { downloadText, todayISO, vibrate } from '../../utils/share'
import { cn } from '../../utils/cn'

/* ---------- Saved passengers ---------- */

export function SavedPassengers() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [add, setAdd] = useState(false)
  const [remove, setRemove] = useState<SavedPassenger | null>(null)
  const [form, setForm] = useState({ name: '', relation: 'Family', dob: '', milesId: '', passport: '' })
  const valid = form.name.trim().length >= 3 && /^\d{4}-\d{2}-\d{2}$/.test(form.dob) && form.passport.trim().length >= 6

  const save = () => {
    if (!valid) return
    const [y, m, d] = form.dob.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    dispatch({
      type: 'ADD_PASSENGER',
      passenger: { id: `p-${Date.now()}`, name: form.name.trim(), relation: form.relation, dob: `${Number(d)} ${months[Number(m) - 1]} ${y}`, milesId: form.milesId.trim() || undefined, passport: `${form.passport.trim().charAt(0).toUpperCase()}•••••${form.passport.trim().slice(-3)}` },
    })
    setAdd(false)
    setForm({ name: '', relation: 'Family', dob: '', milesId: '', passport: '' })
    toast('Traveller saved')
  }

  return (
    <>
      <section className="card divide-y divide-surface-line overflow-hidden">
        {state.savedPassengers.map((p) => (
          <div key={p.id} className="px-4 py-3.5 flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-brand-navy text-white text-[12px] font-bold flex items-center justify-center shrink-0">{p.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[14px] font-semibold text-ink">{p.name} <span className="text-[11px] font-medium text-ink-muted">· {p.relation}</span></span>
              <span className="block text-[12px] text-ink-muted">{p.dob} · {p.milesId ?? 'No GarudaMiles'} · Passport {p.passport}</span>
            </span>
            {p.relation !== 'Myself' && (
              <button type="button" aria-label={`Remove ${p.name}`} onClick={() => setRemove(p)} className="h-8 w-8 rounded-full flex items-center justify-center text-ink-faint hover:text-error">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </section>
      <Button full variant="secondary" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setAdd(true)}>
        Add a traveller
      </Button>

      <BottomSheet open={add} onClose={() => setAdd(false)} title="Add a traveller" subtitle="Saved for faster checkout" height="tall" footer={<Button full disabled={!valid} onClick={save}>Save traveller</Button>}>
        <div className="space-y-3.5 pt-1">
          <Input label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="As on ID or passport" />
          <div>
            <p className="block text-[12px] font-semibold text-ink-soft mb-1.5">Relation</p>
            <div className="flex flex-wrap gap-2">
              {['Family', 'Friend', 'Colleague', 'Child'].map((r) => (
                <button key={r} type="button" onClick={() => setForm((f) => ({ ...f, relation: r }))} className={cn('h-9 px-3.5 rounded-full text-[13px] font-semibold border', form.relation === r ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-surface-line text-ink-soft')}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <Input label="Date of birth" type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} max={todayISO()} />
          <Input label="Passport or ID number" value={form.passport} onChange={(e) => setForm((f) => ({ ...f, passport: e.target.value.toUpperCase() }))} placeholder="Stored masked" className="font-mono" />
          <Input label="GarudaMiles number (optional)" value={form.milesId} onChange={(e) => setForm((f) => ({ ...f, milesId: e.target.value.toUpperCase() }))} placeholder="GA-00000000" />
        </div>
      </BottomSheet>

      <Modal open={remove !== null} onClose={() => setRemove(null)} title="Remove traveller?">
        <p className="t-body">{remove?.name} will be removed from your saved travellers. Existing bookings are not affected.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" full onClick={() => setRemove(null)}>Keep</Button>
          <Button variant="danger" full onClick={() => { if (remove) dispatch({ type: 'REMOVE_PASSENGER', id: remove.id }); setRemove(null); toast('Traveller removed', 'info') }}>Remove</Button>
        </div>
      </Modal>
    </>
  )
}

/* ---------- Payment methods ---------- */

const PAY_ICONS = { card: CreditCard, transfer: Landmark, qris: QrCode, wallet: Wallet, miles: Award } as const

export function PaymentMethods() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [add, setAdd] = useState(false)
  const [remove, setRemove] = useState<PaymentMethodItem | null>(null)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const digits = card.number.replace(/\D/g, '')
  const valid = digits.length === 16 && card.name.trim().length >= 3 && /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry) && /^\d{3}$/.test(card.cvv)
  const brand = digits.startsWith('4') ? 'Visa' : digits.startsWith('5') ? 'Mastercard' : digits.startsWith('3') ? 'Amex' : 'Card'

  const save = () => {
    if (!valid) return
    dispatch({ type: 'ADD_PAYMENT', method: { id: `card-${Date.now()}`, kind: 'card', label: 'Credit / Debit Card', detail: `${brand} •••• ${digits.slice(-4)}`, note: `Expires ${card.expiry}` } })
    setAdd(false)
    setCard({ number: '', name: '', expiry: '', cvv: '' })
    toast(`${brand} •••• ${digits.slice(-4)} added`)
  }

  return (
    <>
      <section className="card divide-y divide-surface-line overflow-hidden">
        {state.paymentMethods.map((m) => {
          const Icon = PAY_ICONS[m.kind]
          return (
            <div key={m.id} className="px-4 py-3.5 flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-surface-soft text-brand-navy flex items-center justify-center shrink-0"><Icon className="h-5 w-5" /></span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink">{m.detail}</span>
                  {m.isDefault && <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-brand-turquoise-soft text-brand-turquoise px-2 py-0.5">Default</span>}
                </span>
                <span className="block text-[12px] text-ink-muted">{m.label} · {m.note}</span>
              </span>
              {!m.isDefault && m.kind === 'card' && (
                <button type="button" aria-label="Set as default" onClick={() => { dispatch({ type: 'SET_DEFAULT_PAYMENT', id: m.id }); toast('Default payment updated') }} className="h-8 w-8 rounded-full flex items-center justify-center text-ink-faint hover:text-brand-gold">
                  <Star className="h-4 w-4" />
                </button>
              )}
              {m.kind === 'card' && !m.isDefault && (
                <button type="button" aria-label="Remove card" onClick={() => setRemove(m)} className="h-8 w-8 rounded-full flex items-center justify-center text-ink-faint hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )
        })}
      </section>
      <Button full variant="secondary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAdd(true)}>
        Add a card
      </Button>

      <BottomSheet open={add} onClose={() => setAdd(false)} title="Add a card" subtitle="Stored securely · demo only, no real card is charged" footer={<Button full disabled={!valid} onClick={save}>Save card</Button>}>
        <div className="space-y-3.5 pt-1">
          <Input label="Card number" inputMode="numeric" value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ') }))} placeholder="4242 4242 4242 4242" className="font-mono" hint={digits.length > 0 ? `${brand} · ${digits.length}/16 digits` : undefined} />
          <Input label="Name on card" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value.toUpperCase() }))} placeholder="RAKA WIJAYA" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Expiry" value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value.replace(/[^\d]/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/, '$1/') }))} placeholder="MM/YY" className="font-mono" inputMode="numeric" />
            <Input label="CVV" type="password" value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))} placeholder="•••" className="font-mono" inputMode="numeric" />
          </div>
          <p className="text-[11.5px] text-ink-faint inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Card details are tokenised; only the last four digits are kept.</p>
        </div>
      </BottomSheet>

      <Modal open={remove !== null} onClose={() => setRemove(null)} title="Remove card?">
        <p className="t-body">{remove?.detail} will be removed from your saved payment methods.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" full onClick={() => setRemove(null)}>Keep</Button>
          <Button variant="danger" full onClick={() => { if (remove) dispatch({ type: 'REMOVE_PAYMENT', id: remove.id }); setRemove(null); toast('Card removed', 'info') }}>Remove</Button>
        </div>
      </Modal>
    </>
  )
}

/* ---------- Settings, privacy, notifications, language ---------- */

export function SettingsToggles({ kind }: { kind: 'notifications' | 'settings' | 'privacy' | 'language' }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [sheet, setSheet] = useState<'password' | 'devices' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const pwValid = pw.current.length >= 8 && pw.next.length >= 8 && pw.next === pw.confirm && pw.next !== pw.current
  const setPref = (key: keyof Prefs, value: boolean) => {
    dispatch({ type: 'SET_PREF', key, value })
    if (key === 'haptics' && value) vibrate(20)
  }

  if (kind === 'language') {
    return (
      <section className="card divide-y divide-surface-line overflow-hidden">
        {[
          { id: 'en' as const, label: 'English', note: 'Default' },
          { id: 'id' as const, label: 'Bahasa Indonesia', note: 'Tersedia untuk notifikasi dan WhatsApp' },
        ].map((l) => (
          <button key={l.id} type="button" onClick={() => { dispatch({ type: 'SET_LANGUAGE', value: l.id }); toast(l.id === 'id' ? 'Bahasa Indonesia dipilih · notifikasi akan dikirim dalam Bahasa Indonesia' : 'Language set to English', 'info') }} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
            <Globe className="h-5 w-5 text-brand-navy" />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-ink">{l.label}</span>
              <span className="block text-[12px] text-ink-muted">{l.note}</span>
            </span>
            {state.language === l.id && <Check className="h-5 w-5 text-brand-turquoise" />}
          </button>
        ))}
      </section>
    )
  }
  if (kind === 'notifications') {
    const rows = [
      { key: 'checkin', label: 'Check-in reminders', description: 'When online check-in opens for your flight' },
      { key: 'gate', label: 'Gate & schedule changes', description: 'Instant alerts for any change to your journey' },
      { key: 'boarding', label: 'Boarding reminders', description: '35 minutes before boarding begins' },
      { key: 'miles', label: 'GarudaMiles updates', description: 'Miles credited, tier progress and rewards' },
      { key: 'promo', label: 'Offers & inspiration', description: 'Occasional destination offers' },
      { key: 'whatsapp', label: 'WhatsApp journey updates', description: 'Receive the same reminders on WhatsApp' },
    ]
    return (
      <section className="card divide-y divide-surface-line overflow-hidden">
        {rows.map((r) => (
          <div key={r.key} className="px-4 py-3.5">
            <Toggle label={r.label} description={r.description} checked={r.key === 'whatsapp' ? state.whatsappOptIn : state.notificationPrefs[r.key] ?? true} onChange={(v) => (r.key === 'whatsapp' ? dispatch({ type: 'SET_WHATSAPP', value: v }) : dispatch({ type: 'SET_NOTIFICATION_PREF', key: r.key, value: v }))} />
          </div>
        ))}
      </section>
    )
  }
  if (kind === 'privacy') {
    const exportData = () => {
      downloadText(JSON.stringify({ exportedAt: new Date().toISOString(), profile: state.profile, trips: state.trips, miles: state.miles, purchases: state.purchases, preferences: state.prefs, notificationPrefs: state.notificationPrefs }, null, 2), `flygaruda-data-${todayISO()}.json`, 'application/json')
      toast('Your data has been exported (JSON)')
    }
    return (
      <>
        <section className="card divide-y divide-surface-line overflow-hidden">
          <div className="px-4 py-3.5"><Toggle label="Biometric sign-in" description="Face ID / fingerprint" checked={state.prefs.biometrics} onChange={(v) => setPref('biometrics', v)} /></div>
          <div className="px-4 py-3.5"><Toggle label="Location for airport guidance" description="Used only for arrival recommendations" checked={state.prefs.location} onChange={(v) => setPref('location', v)} /></div>
          <div className="px-4 py-3.5"><Toggle label="Share usage analytics" description="Help improve FlyGaruda" checked={state.prefs.analytics} onChange={(v) => setPref('analytics', v)} /></div>
          <button type="button" onClick={() => setSheet('password')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
            <ShieldCheck className="h-5 w-5 text-brand-navy" />
            <span className="flex-1 text-[14px] font-semibold text-ink">Change password</span>
            <ArrowRight className="h-4 w-4 text-ink-faint" />
          </button>
          <button type="button" onClick={() => setSheet('devices')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
            <Smartphone className="h-5 w-5 text-brand-navy" />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-ink">Signed-in devices</span>
              <span className="block text-[12px] text-ink-muted">{state.devices.length} active</span>
            </span>
            <ArrowRight className="h-4 w-4 text-ink-faint" />
          </button>
          <button type="button" onClick={exportData} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
            <Download className="h-5 w-5 text-brand-navy" />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-ink">Export my data</span>
              <span className="block text-[12px] text-ink-muted">Download a copy of your trips, miles and preferences</span>
            </span>
            <ArrowRight className="h-4 w-4 text-ink-faint" />
          </button>
          <button type="button" onClick={() => setConfirmDelete(true)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
            <Trash2 className="h-5 w-5 text-error" />
            <span className="flex-1 text-[14px] font-semibold text-error">Delete my data</span>
            <ArrowRight className="h-4 w-4 text-ink-faint" />
          </button>
        </section>

        <BottomSheet open={sheet === 'password'} onClose={() => setSheet(null)} title="Change password" subtitle="At least 8 characters" footer={<Button full disabled={!pwValid} onClick={() => { setSheet(null); setPw({ current: '', next: '', confirm: '' }); dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `pw-${Date.now()}`, category: 'travel', title: 'Password changed', body: 'Your FlyGaruda password was updated. If this was not you, contact support immediately.', time: 'Just now', to: '/more/privacy-security', iconKey: 'bell' } }); toast('Password updated') }}>Update password</Button>}>
          <div className="space-y-3.5 pt-1">
            <Input label="Current password" type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} autoComplete="current-password" />
            <Input label="New password" type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} autoComplete="new-password" hint={pw.next && pw.next.length < 8 ? `${8 - pw.next.length} more characters` : pw.next && pw.next === pw.current ? 'Choose a different password' : undefined} />
            <Input label="Confirm new password" type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" error={pw.confirm && pw.confirm !== pw.next ? 'Passwords do not match' : undefined} />
          </div>
        </BottomSheet>

        <BottomSheet open={sheet === 'devices'} onClose={() => setSheet(null)} title="Signed-in devices" subtitle="Sign out of any device you do not recognise">
          <div className="card divide-y divide-surface-line overflow-hidden mb-2">
            {state.devices.map((d) => (
              <div key={d.id} className="px-4 py-3 flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-brand-navy" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-semibold text-ink">{d.name} {d.current && <span className="text-[10px] font-bold uppercase rounded-full bg-success-soft text-success px-2 py-0.5 ml-1">This device</span>}</span>
                  <span className="block text-[12px] text-ink-muted">{d.location} · {d.lastActive}</span>
                </span>
                {!d.current && (
                  <Button size="sm" variant="secondary" onClick={() => { dispatch({ type: 'SIGN_OUT_DEVICE', id: d.id }); toast(`${d.name} signed out`, 'info') }}>
                    Sign out
                  </Button>
                )}
              </div>
            ))}
          </div>
        </BottomSheet>

        <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete all your data?">
          <p className="t-body">This removes your trips, miles, preferences and saved details from this device and signs you out. This cannot be undone.</p>
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" full onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" full onClick={() => { setConfirmDelete(false); dispatch({ type: 'RESET_ALL' }); navigate('/onboarding', { replace: true }) }}>Delete everything</Button>
          </div>
        </Modal>
      </>
    )
  }
  return (
    <section className="card divide-y divide-surface-line overflow-hidden">
      <div className="px-4 py-3.5"><Toggle label="Haptic feedback" description="Subtle vibration on key actions" checked={state.prefs.haptics} onChange={(v) => setPref('haptics', v)} /></div>
      <div className="px-4 py-3.5"><Toggle label="Offline boarding pass" description="Keep passes available without connection" checked={state.prefs.offlinePass} onChange={(v) => setPref('offlinePass', v)} /></div>
      <div className="px-4 py-3.5 flex items-center justify-between">
        <span>
          <span className="block text-[14px] font-semibold text-ink">Dark appearance</span>
          <span className="block text-[12px] text-ink-muted mt-0.5">Follows a later release of FlyGaruda</span>
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wide rounded-full bg-surface-soft text-ink-muted px-2 py-1">Soon</span>
      </div>
    </section>
  )
}
