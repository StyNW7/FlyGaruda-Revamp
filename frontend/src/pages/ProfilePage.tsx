import { Navigate, useNavigate } from 'react-router-dom'
import { Crown, Pencil, Stamp } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { Avatar, InfoRow, PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { ListRow } from '../components/common/ListRow'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { getAirport } from '../data/airports'
import { MILES_SUMMARY } from '../data/miles'
import { formatNumber } from '../utils/format'
import { Bell, CreditCard, Globe, Shield, Users, Bookmark } from 'lucide-react'

export function ProfilePage() {
  const { user, isMember } = useApp()
  const navigate = useNavigate()
  const toast = useToast()

  if (!isMember) return <Navigate to="/login" replace />

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/more" title="Profile" right={<Button variant="ghost" size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => toast('Profile editing opens in the live app', 'info')}>Edit</Button>} />
      <PageContainer className="py-4 space-y-4">
        <section className="card p-5 flex flex-col items-center text-center">
          <Avatar name={user.name} initials={user.initials} size="lg" />
          <h1 className="t-h1 mt-3">{user.name}</h1>
          <p className="t-caption">{user.email}</p>
          <button type="button" onClick={() => navigate('/miles')} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-gold-soft text-[#8A6A1F] px-3 py-1.5 text-[12px] font-bold">
            <Crown className="h-3.5 w-3.5" /> GarudaMiles {user.tier} · {formatNumber(MILES_SUMMARY.balance)} miles
          </button>
        </section>

        <section className="card px-4 py-2">
          <div className="divide-y divide-surface-line">
            <InfoRow label="GarudaMiles ID" value={<span className="font-mono">{user.milesId}</span>} />
            <InfoRow label="Membership" value={`GarudaMiles ${user.tier}`} />
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Home airport" value={`${getAirport(user.homeAirport).city} – Soekarno-Hatta`} />
            <InfoRow label="Preferred seat" value={user.preferredSeat} />
            <InfoRow label="Travel preference" value={user.travelPreference} />
            <InfoRow label="Language" value={user.language} />
            <InfoRow label="Member since" value={user.memberSince} />
          </div>
        </section>

        <section className="card divide-y divide-surface-line overflow-hidden">
          <ListRow icon={Stamp} iconTone="turquoise" title="My Garuda Passport" description="Stamps, badges and travel stats" to="/miles/passport" />
          <ListRow icon={Users} title="Saved passengers" description="3 travellers" to="/more/saved-passengers" />
          <ListRow icon={CreditCard} title="Payment methods" description="Visa •••• 4821 · Travel Wallet" to="/more/payment-methods" />
          <ListRow icon={Bookmark} title="Preferences" description="Seat, meal and travel style" to="/more/preferences" />
          <ListRow icon={Bell} title="Notifications" description="Journey alerts and reminders" to="/more/notifications" />
          <ListRow icon={Globe} title="Language" description="English / Bahasa Indonesia" to="/more/language" />
          <ListRow icon={Shield} title="Privacy & security" description="Password, devices and data" to="/more/privacy-security" />
        </section>
      </PageContainer>
    </div>
  )
}
