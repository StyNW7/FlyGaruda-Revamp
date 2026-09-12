import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HandCoins, Plus, Search } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Inputs'
import { SegmentedTabs } from '../components/common/Tabs'
import { BottomSheet } from '../components/common/Overlays'
import { EmptyState, OfflineBanner, SkeletonCard } from '../components/common/States'
import { TripCard } from '../components/trips/TripCard'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'
import { useOnline } from '../hooks/useOnline'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading'
import type { TripCategory } from '../types'
import { RETRIEVABLE_BOOKINGS } from '../data/user'
import { formatMediumDate } from '../utils/format'

export function TripsPage() {
  const { state, isMember, dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const online = useOnline()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<TripCategory>('upcoming')
  const [add, setAdd] = useState(false)
  const [pnr, setPnr] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [retrieving, setRetrieving] = useState(false)
  const [query, setQuery] = useState('')
  const loading = useSimulatedLoading(600, [isMember])

  useEffect(() => {
    if (params.get('add') === '1') {
      setAdd(true)
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const trips = isMember ? state.trips : []
  const filtered = trips
    .filter((t) => t.category === tab)
    .filter((t) => {
      const q = query.trim().toLowerCase()
      return !q || t.flightNumber.toLowerCase().includes(q) || t.bookingCode.toLowerCase().includes(q) || t.origin.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q)
    })
    .sort((a, b) => (tab === 'upcoming' ? (a.date < b.date ? -1 : 1) : a.date < b.date ? 1 : -1))

  const counts = {
    upcoming: trips.filter((t) => t.category === 'upcoming').length,
    past: trips.filter((t) => t.category === 'past').length,
    cancelled: trips.filter((t) => t.category === 'cancelled').length,
  }

  const closeAdd = () => {
    setAdd(false)
    setPnr('')
    setLastName('')
    setError(null)
  }

  /** Looks the booking up by code + last name — first in the account, then in bookings made outside the app. */
  const retrieve = () => {
    const code = pnr.trim().toUpperCase()
    const name = lastName.trim().toUpperCase()
    if (code.length !== 6) return setError('Booking codes are 6 characters, e.g. KD7P2Q.')
    if (!name) return setError('Enter the passenger last name as on the booking.')
    setError(null)
    setRetrieving(true)
    window.setTimeout(() => {
      setRetrieving(false)
      const existing = state.trips.find((t) => t.bookingCode === code)
      if (existing) {
        if (!existing.passengerName.toUpperCase().includes(name)) return setError('That last name does not match this booking.')
        closeAdd()
        toast(`${code} is already in your trips`, 'info')
        navigate(`/trips/${existing.id}`)
        return
      }
      const found = RETRIEVABLE_BOOKINGS.find((b) => b.code === code)
      if (!found) return setError('No booking found with that code. Check the confirmation email and try again.')
      if (found.lastName !== name) return setError('That last name does not match this booking.')
      if (!isMember) dispatch({ type: 'LOGIN', auth: 'member' })
      dispatch({ type: 'ADD_TRIP', trip: found.trip })
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: { id: `retrieved-${found.trip.id}`, category: 'travel', title: `Trip added · ${found.trip.flightNumber} on ${formatMediumDate(found.trip.date)}`, body: `${found.trip.origin} → ${found.trip.destination} for ${found.trip.passengerName}. Journey Companion is now active for this trip.`, time: 'Just now', to: `/trips/${found.trip.id}`, iconKey: 'ticket' },
      })
      closeAdd()
      setTab('upcoming')
      toast(`Booking ${code} added to your trips`)
    }, 900)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader
        large
        title="Trips"
        right={
          <Button variant="secondary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAdd(true)}>
            Add trip
          </Button>
        }
      />
      <PageContainer className="py-4 space-y-4">
        {!online && <OfflineBanner />}
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { id: 'past', label: 'Past', count: counts.past },
            { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ]}
        />
        {tab === 'past' && (
          <Input leftIcon={Search} placeholder="Search trip history · flight, code or airport" aria-label="Search trip history" value={query} onChange={(e) => setQuery(e.target.value)} />
        )}

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
        ) : !isMember ? (
          <EmptyState
            mascot="think"
            title="Sign in to see your journeys"
            description="Your upcoming trips, boarding passes and journey updates live here."
            action={
              <div className="flex gap-2">
                <Button onClick={() => navigate('/login')}>Sign in</Button>
                <Button variant="secondary" onClick={() => setAdd(true)}>
                  Add a trip
                </Button>
              </div>
            }
          />
        ) : filtered.length === 0 ? (
          tab === 'upcoming' ? (
            <EmptyState mascot="baggage" title="No upcoming journeys." description="Ready when you are. Search flights and every step of your trip will appear here." action={<Button onClick={() => navigate('/book')}>Search flights</Button>} />
          ) : tab === 'past' ? (
            <EmptyState mascot="chill" title="No past journeys found" description={query ? `Nothing matches “${query}”.` : 'Completed flights will be listed here.'} compact />
          ) : (
            <EmptyState mascot="chill" title="No cancelled journeys" description="Cancelled bookings and refund status will appear here." compact />
          )
        ) : (
          <div className="space-y-3 animate-fade-up">
            {filtered.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
            {tab === 'cancelled' && (
              <button type="button" onClick={() => navigate('/more/refund-request')} className="w-full card p-3.5 flex items-center gap-3 text-left press">
                <span className="h-10 w-10 rounded-xl bg-brand-gold-soft text-[#8A6A1F] flex items-center justify-center">
                  <HandCoins className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold text-ink">Refund request</span>
                  <span className="block text-[12px] text-ink-muted">Track refunds for cancelled bookings</span>
                </span>
              </button>
            )}
          </div>
        )}
      </PageContainer>

      <BottomSheet
        open={add}
        onClose={closeAdd}
        title="Add a trip"
        subtitle="Retrieve a booking made elsewhere"
        footer={
          <Button full loading={retrieving} onClick={retrieve}>
            Retrieve booking
          </Button>
        }
      >
        <div className="space-y-3.5 pt-1">
          <Input label="Booking code" placeholder="e.g. KD7P2Q" value={pnr} onChange={(e) => { setPnr(e.target.value.toUpperCase()); setError(null) }} className="font-mono" maxLength={6} error={error ?? undefined} />
          <Input label="Passenger last name" placeholder="As on the booking" value={lastName} onChange={(e) => { setLastName(e.target.value); setError(null) }} autoComplete="family-name" />
          <p className="text-[11.5px] text-ink-faint">Bookings from garuda-indonesia.com, travel agents and partners can be added here.</p>
          <div className="rounded-xl border border-dashed border-brand-turquoise/40 bg-brand-turquoise-soft/50 p-3">
            <p className="text-[12px] font-bold text-ink">Demo bookings to try</p>
            <div className="mt-2 space-y-1.5">
              {RETRIEVABLE_BOOKINGS.map((b) => (
                <button key={b.code} type="button" onClick={() => { setPnr(b.code); setLastName(b.lastName.charAt(0) + b.lastName.slice(1).toLowerCase()); setError(null) }} className="w-full flex items-center justify-between text-left text-[12px] rounded-lg bg-white border border-surface-line px-3 py-2 tap">
                  <span className="font-mono font-semibold text-ink tracking-wider">{b.code}</span>
                  <span className="text-ink-muted">{b.trip.flightNumber} · {b.trip.origin} → {b.trip.destination} · {b.lastName.charAt(0) + b.lastName.slice(1).toLowerCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
