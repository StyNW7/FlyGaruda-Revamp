import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Bell, Bookmark, ChevronDown, CreditCard, Crown, Globe, Pencil, Shield, Stamp, Users } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { Avatar, InfoRow, PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Inputs'
import { ListRow } from '../components/common/ListRow'
import { BottomSheet } from '../components/common/Overlays'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { AIRPORTS, getAirport } from '../data/airports'
import type { AirportCode, User } from '../types'
import { formatNumber, initials } from '../utils/format'
import { cn } from '../utils/cn'

const SEATS = ['Window', 'Aisle', 'Middle', 'No preference']
const STYLES = ['Leisure + Education', 'Business', 'Family', 'Adventure', 'Pilgrimage']

function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-ink-soft mb-1.5">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-surface-line bg-white px-3.5 pr-8 text-[15px] focus:border-brand-blue outline-none">
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="h-4 w-4 text-ink-faint absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { user, isMember, miles, state, dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState<Partial<User>>({})

  if (!isMember) return <Navigate to="/login" replace />

  const openEdit = () => {
    setForm({ name: user.name, phone: user.phone, email: user.email, homeAirport: user.homeAirport, preferredSeat: user.preferredSeat, travelPreference: user.travelPreference })
    setEdit(true)
  }
  const valid = (form.name ?? '').trim().length >= 3 && /\S+@\S+\.\S+/.test(form.email ?? '') && (form.phone ?? '').trim().length >= 8
  const save = () => {
    if (!valid) return
    const name = (form.name ?? '').trim()
    dispatch({ type: 'SET_PROFILE', patch: { ...form, name, firstName: name.split(' ')[0], initials: initials(name) } })
    setEdit(false)
    toast('Profile updated')
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/more" title="Profile" right={<Button variant="ghost" size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={openEdit}>Edit</Button>} />
      <PageContainer className="py-4 space-y-4">
        <section className="card p-5 flex flex-col items-center text-center">
          <Avatar name={user.name} initials={user.initials} size="lg" />
          <h1 className="t-h1 mt-3">{user.name}</h1>
          <p className="t-caption">{user.email}</p>
          <button type="button" onClick={() => navigate('/miles')} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-gold-soft text-[#8A6A1F] px-3 py-1.5 text-[12px] font-bold press">
            <Crown className="h-3.5 w-3.5" /> GarudaMiles {miles.tier.name} · {formatNumber(miles.balance)} miles
          </button>
        </section>

        <section className="card px-4 py-2">
          <div className="divide-y divide-surface-line">
            <InfoRow label="GarudaMiles ID" value={<span className="font-mono">{user.milesId}</span>} />
            <InfoRow label="Membership" value={`GarudaMiles ${miles.tier.name}`} />
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Home airport" value={`${getAirport(user.homeAirport).city} – ${getAirport(user.homeAirport).name.replace(' International', '')}`} />
            <InfoRow label="Preferred seat" value={user.preferredSeat} />
            <InfoRow label="Travel preference" value={user.travelPreference} />
            <InfoRow label="Language" value={state.language === 'id' ? 'Bahasa Indonesia' : 'English'} />
            <InfoRow label="Member since" value={user.memberSince} />
          </div>
        </section>

        <section className="card divide-y divide-surface-line overflow-hidden">
          <ListRow icon={Stamp} iconTone="turquoise" title="My Garuda Passport" description="Stamps, badges and travel stats" to="/miles/passport" />
          <ListRow icon={Users} title="Saved passengers" description={`${state.savedPassengers.length} travellers`} to="/more/saved-passengers" />
          <ListRow icon={CreditCard} title="Payment methods" description={state.paymentMethods.filter((m) => m.kind === 'card').map((m) => m.detail).join(' · ') || 'No cards saved'} to="/more/payment-methods" />
          <ListRow icon={Bookmark} title="Preferences" description="Seat, meal and travel style" to="/more/preferences" />
          <ListRow icon={Bell} title="Notifications" description="Journey alerts and reminders" to="/more/notifications" />
          <ListRow icon={Globe} title="Language" description={state.language === 'id' ? 'Bahasa Indonesia' : 'English'} to="/more/language" />
          <ListRow icon={Shield} title="Privacy & security" description="Password, devices and data" to="/more/privacy-security" />
        </section>
      </PageContainer>

      <BottomSheet open={edit} onClose={() => setEdit(false)} title="Edit profile" subtitle="Changes apply across bookings and check-in" height="tall" footer={
        <div className="flex gap-2">
          <Button variant="secondary" full onClick={() => setEdit(false)}>Cancel</Button>
          <Button full disabled={!valid} onClick={save}>Save changes</Button>
        </div>
      }>
        <div className="space-y-3.5 pt-1">
          <Input label="Full name" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="As on your ID" />
          <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Mobile number" type="tel" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Select label="Home airport" value={form.homeAirport ?? 'CGK'} onChange={(v) => setForm((f) => ({ ...f, homeAirport: v as AirportCode }))} options={AIRPORTS.map((a) => ({ value: a.code, label: `${a.city} (${a.code})` }))} />
          <div>
            <p className="block text-[12px] font-semibold text-ink-soft mb-1.5">Preferred seat</p>
            <div className="flex flex-wrap gap-2">
              {SEATS.map((s) => (
                <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, preferredSeat: s }))} className={cn('h-9 px-3.5 rounded-full text-[13px] font-semibold border', form.preferredSeat === s ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-surface-line text-ink-soft')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Select label="Travel preference" value={form.travelPreference ?? STYLES[0]} onChange={(v) => setForm((f) => ({ ...f, travelPreference: v }))} options={STYLES.map((s) => ({ value: s, label: s }))} />
          <p className="text-[11.5px] text-ink-faint">GarudaMiles ID and membership tier cannot be edited here.</p>
        </div>
      </BottomSheet>
    </div>
  )
}
