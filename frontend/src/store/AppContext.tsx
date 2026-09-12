/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { AlertTriangle, Award, BellRing, DoorOpen, Gift, MapPin, Tag, TicketCheck } from 'lucide-react'
import type {
  AirportCode,
  AppNotification,
  BookingDraft,
  Device,
  Disruption,
  FeedbackEntry,
  JourneyStage,
  MilesActivity,
  MilesClaim,
  NotificationCategory,
  PaymentMethodItem,
  Purchase,
  Reward,
  SavedPassenger,
  SearchParams,
  SupportCase,
  Tier,
  Trip,
  User,
  Voucher,
} from '../types'
import { SEED_TRIPS } from '../data/trips'
import { SEED_NOTIFICATIONS } from '../data/notifications'
import { DEVICES, PAYMENT_METHODS, SAVED_PASSENGERS, USER } from '../data/user'
import { MILES_ACTIVITY, MILES_SEED, TIERS, nextTierFor, tierForMiles } from '../data/miles'

const STORAGE_KEY = 'flygaruda.state.v2'

export type AuthState = 'unknown' | 'guest' | 'member'
export type ShareTheme = 'navy' | 'turquoise' | 'gold' | 'sunset' | 'custom'
export type ShareFormat = 'story' | 'square'
export type ShareMascot = 'wave' | 'hi' | 'love' | 'respect' | 'chill' | 'baggage' | 'none'

/** Everything the traveller can customise on the shareable passport card. */
export interface ShareOptions {
  theme: ShareTheme
  custom: { primary: string; secondary: string; accent: string }
  format: ShareFormat
  mascot: ShareMascot
  showMap: boolean
  showStamps: boolean
  showBadges: boolean
  showStats: boolean
  showMemberId: boolean
  headline: string
  caption: string
}

export const DEFAULT_SHARE: ShareOptions = {
  theme: 'navy',
  custom: { primary: '#10306F', secondary: '#0A1F4D', accent: '#3FC5CF' },
  format: 'story',
  mascot: 'wave',
  showMap: true,
  showStamps: true,
  showBadges: true,
  showStats: true,
  showMemberId: true,
  headline: '',
  caption: '',
}

/** Serializable notification created at runtime (icons are resolved by key). */
export interface RuntimeNotification {
  id: string
  category: NotificationCategory
  title: string
  body: string
  time: string
  to?: string
  iconKey: 'alert' | 'award' | 'bell' | 'gate' | 'gift' | 'map' | 'tag' | 'ticket'
}

const ICONS = {
  alert: AlertTriangle,
  award: Award,
  bell: BellRing,
  gate: DoorOpen,
  gift: Gift,
  map: MapPin,
  tag: Tag,
  ticket: TicketCheck,
}

export interface MilesState {
  balance: number
  tierMiles: number
  /** Runtime activity entries (prepended to the seeded history). */
  activity: MilesActivity[]
  vouchers: Voucher[]
  claims: MilesClaim[]
}

export interface Prefs {
  haptics: boolean
  biometrics: boolean
  location: boolean
  analytics: boolean
  offlinePass: boolean
}

export interface AppState {
  onboardingDone: boolean
  auth: AuthState
  trips: Trip[]
  readIds: string[]
  dismissedIds: string[]
  runtimeNotifications: RuntimeNotification[]
  search: SearchParams
  draft: BookingDraft | null
  offlineSim: boolean
  whatsappOptIn: boolean
  language: 'en' | 'id'
  wishlist: AirportCode[]
  notificationPrefs: Record<string, boolean>
  lastBookingId: string | null
  miles: MilesState
  profile: Partial<User>
  savedPassengers: SavedPassenger[]
  paymentMethods: PaymentMethodItem[]
  purchases: Purchase[]
  feedback: FeedbackEntry[]
  cases: SupportCase[]
  savedReads: string[]
  devices: Device[]
  prefs: Prefs
  share: ShareOptions
  /** Reward the member is saving miles for (reward id). */
  milesGoal: string | null
}

export const DEFAULT_SEARCH: SearchParams = {
  tripType: 'oneway',
  origin: 'CGK',
  destination: 'DPS',
  departDate: '2026-09-19',
  returnDate: '2026-09-23',
  passengers: { adults: 1, children: 0, infants: 0 },
  cabin: 'economy',
}

const initialState: AppState = {
  onboardingDone: false,
  auth: 'unknown',
  trips: SEED_TRIPS,
  readIds: SEED_NOTIFICATIONS.filter((n) => n.read).map((n) => n.id),
  dismissedIds: [],
  runtimeNotifications: [],
  search: DEFAULT_SEARCH,
  draft: null,
  offlineSim: false,
  whatsappOptIn: true,
  language: 'en',
  wishlist: ['HND', 'SYD'],
  notificationPrefs: { checkin: true, gate: true, boarding: true, miles: true, promo: false, whatsapp: true },
  lastBookingId: null,
  miles: { balance: MILES_SEED.balance, tierMiles: MILES_SEED.tierMiles, activity: [], vouchers: [], claims: [] },
  profile: {},
  savedPassengers: SAVED_PASSENGERS,
  paymentMethods: PAYMENT_METHODS,
  purchases: [
    { id: 'pu-seed-1', kind: 'transfer', title: 'Airport transfer · Home → Terminal 3', detail: 'Standard sedan · 12 Aug 2026', price: 185000, date: '2026-08-12', status: 'confirmed', reference: 'TR-260812-4471' },
    { id: 'pu-seed-2', kind: 'roaming', title: 'Indosat · Japan 7 days', detail: '10 GB · activated 11 Jun 2026', price: 220000, date: '2026-06-11', status: 'confirmed', reference: 'RM-260611-0912' },
    { id: 'pu-seed-3', kind: 'car', title: 'Car rental · Denpasar', detail: 'Toyota Avanza · 3 days · Mar 2024', price: 960000, date: '2024-03-16', status: 'confirmed', milesEarned: 192 },
  ],
  feedback: [],
  cases: [
    { id: 'case-refund-1', kind: 'refund', title: 'Refund · PM8V3K GA 654', detail: 'Rp 2,347,000 to Visa •••• 4821', reference: 'RF-2026-01188', status: 'in-progress', submittedAt: '2026-07-24' },
  ],
  savedReads: [],
  devices: DEVICES,
  prefs: { haptics: true, biometrics: true, location: true, analytics: false, offlinePass: true },
  share: DEFAULT_SHARE,
  milesGoal: null,
}

type Action =
  | { type: 'ONBOARDING_DONE' }
  | { type: 'LOGIN'; auth: 'guest' | 'member' }
  | { type: 'LOGOUT' }
  | { type: 'SET_SEARCH'; search: Partial<SearchParams> }
  | { type: 'SET_DRAFT'; draft: BookingDraft | null }
  | { type: 'UPDATE_DRAFT'; patch: Partial<BookingDraft> }
  | { type: 'ADD_TRIP'; trip: Trip }
  | { type: 'UPDATE_TRIP'; id: string; patch: Partial<Trip> }
  | { type: 'CHECK_IN'; id: string; seat: string }
  | { type: 'APPLY_DISRUPTION'; id: string; disruption: Disruption }
  | { type: 'CLEAR_DISRUPTION'; id: string }
  | { type: 'SET_STAGE'; id: string; stage: JourneyStage }
  | { type: 'CANCEL_TRIP'; id: string }
  | { type: 'TOGGLE_CHECKLIST'; id: string; item: string }
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DISMISS_ALL' }
  | { type: 'ADD_NOTIFICATION'; notification: RuntimeNotification }
  | { type: 'SET_OFFLINE'; value: boolean }
  | { type: 'SET_WHATSAPP'; value: boolean }
  | { type: 'SET_LANGUAGE'; value: 'en' | 'id' }
  | { type: 'TOGGLE_WISHLIST'; code: AirportCode }
  | { type: 'SET_NOTIFICATION_PREF'; key: string; value: boolean }
  | { type: 'SET_PROFILE'; patch: Partial<User> }
  | { type: 'ADD_PASSENGER'; passenger: SavedPassenger }
  | { type: 'REMOVE_PASSENGER'; id: string }
  | { type: 'ADD_PAYMENT'; method: PaymentMethodItem }
  | { type: 'REMOVE_PAYMENT'; id: string }
  | { type: 'SET_DEFAULT_PAYMENT'; id: string }
  | { type: 'EARN_MILES'; entry: Omit<MilesActivity, 'id'> & { id?: string }; tierMiles?: number }
  | { type: 'SPEND_MILES'; entry: Omit<MilesActivity, 'id'> & { id?: string } }
  | { type: 'REDEEM_REWARD'; reward: Reward; voucher: Voucher; date: string }
  | { type: 'USE_VOUCHER'; id: string }
  | { type: 'SUBMIT_CLAIM'; claim: MilesClaim }
  | { type: 'ADD_PURCHASE'; purchase: Purchase }
  | { type: 'REMOVE_PURCHASE'; id: string }
  | { type: 'ADD_FEEDBACK'; entry: FeedbackEntry }
  | { type: 'ADD_CASE'; entry: SupportCase }
  | { type: 'TOGGLE_SAVED_READ'; id: string }
  | { type: 'SIGN_OUT_DEVICE'; id: string }
  | { type: 'SET_PREF'; key: keyof Prefs; value: boolean }
  | { type: 'SET_SHARE'; patch: Partial<ShareOptions> }
  | { type: 'SET_MILES_GOAL'; rewardId: string | null }
  | { type: 'RESET_TRIPS' }
  | { type: 'RESET_ALL' }

let seq = 0
function uid(prefix: string) {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}-${seq}`
}

function creditTripMiles(state: AppState, trip: Trip): AppState {
  if (trip.milesCredited || trip.milesEstimate <= 0) return state
  const tier = tierForMiles(state.miles.tierMiles)
  const bonus = Math.round((trip.milesEstimate * tier.bonus) / 100)
  const entries: MilesActivity[] = [
    { id: uid('act'), date: trip.date, title: `${trip.flightNumber} · ${trip.origin} → ${trip.destination}`, subtitle: 'Flight miles credited', miles: trip.milesEstimate, type: 'earn' },
  ]
  if (bonus > 0) entries.push({ id: uid('act'), date: trip.date, title: `${tier.name} tier bonus`, subtitle: `${tier.bonus}% tier bonus on ${trip.flightNumber}`, miles: bonus, type: 'bonus' })
  return {
    ...state,
    miles: {
      ...state.miles,
      balance: state.miles.balance + trip.milesEstimate + bonus,
      tierMiles: state.miles.tierMiles + trip.milesEstimate,
      activity: [...entries, ...state.miles.activity],
    },
    trips: state.trips.map((t) => (t.id === trip.id ? { ...t, milesCredited: true } : t)),
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ONBOARDING_DONE':
      return { ...state, onboardingDone: true }
    case 'LOGIN':
      return { ...state, auth: action.auth }
    case 'LOGOUT':
      return { ...state, auth: 'guest', draft: null }
    case 'SET_SEARCH':
      return { ...state, search: { ...state.search, ...action.search } }
    case 'SET_DRAFT':
      return { ...state, draft: action.draft }
    case 'UPDATE_DRAFT':
      return state.draft ? { ...state, draft: { ...state.draft, ...action.patch } } : state
    case 'ADD_TRIP':
      return { ...state, trips: [action.trip, ...state.trips.filter((t) => t.id !== action.trip.id)], lastBookingId: action.trip.id, draft: null }
    case 'UPDATE_TRIP':
      return { ...state, trips: state.trips.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)) }
    case 'CHECK_IN':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.id ? { ...t, checkedIn: true, seat: action.seat, stage: 'airport' } : t,
        ),
      }
    case 'APPLY_DISRUPTION':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.id
            ? {
                ...t,
                disruption: { ...action.disruption, previousGate: t.disruption?.previousGate ?? t.gate },
                gate: action.disruption.newGate ?? t.gate,
                status: action.disruption.delayMin > 0 ? 'delayed' : t.status,
                updateAcknowledged: false,
              }
            : t,
        ),
      }
    case 'CLEAR_DISRUPTION':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.id
            ? { ...t, disruption: undefined, gate: t.disruption?.previousGate ?? t.gate, status: t.status === 'delayed' ? 'on-time' : t.status, updateAcknowledged: undefined }
            : t,
        ),
      }
    case 'SET_STAGE': {
      const stageOrder: JourneyStage[] = ['booked', 'checkin', 'airport', 'boarding', 'inflight', 'arrival']
      const idx = stageOrder.indexOf(action.stage)
      const next: AppState = {
        ...state,
        trips: state.trips.map((t): Trip => {
          if (t.id !== action.id) return t
          const checkedIn = idx >= 2 ? true : t.checkedIn && idx >= 1
          return {
            ...t,
            stage: action.stage,
            checkedIn,
            seat: checkedIn && !t.seat ? '18A' : t.seat,
            status: action.stage === 'arrival' ? 'completed' : action.stage === 'boarding' ? 'boarding' : t.disruption ? 'delayed' : 'on-time',
            category: action.stage === 'arrival' ? 'past' : 'upcoming',
          }
        }),
      }
      const trip = next.trips.find((t) => t.id === action.id)
      return action.stage === 'arrival' && trip ? creditTripMiles(next, trip) : next
    }
    case 'CANCEL_TRIP':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.id ? { ...t, status: 'cancelled', category: 'cancelled', checkedIn: false } : t,
        ),
      }
    case 'TOGGLE_CHECKLIST':
      return {
        ...state,
        trips: state.trips.map((t) => {
          if (t.id !== action.id) return t
          const list = t.checklist ?? []
          return { ...t, checklist: list.includes(action.item) ? list.filter((i) => i !== action.item) : [...list, action.item] }
        }),
      }
    case 'MARK_READ':
      return state.readIds.includes(action.id) ? state : { ...state, readIds: [...state.readIds, action.id] }
    case 'MARK_ALL_READ': {
      const all = [...SEED_NOTIFICATIONS.map((n) => n.id), ...state.runtimeNotifications.map((n) => n.id)]
      return { ...state, readIds: all }
    }
    case 'DISMISS_ALL': {
      const all = [...SEED_NOTIFICATIONS.map((n) => n.id), ...state.runtimeNotifications.map((n) => n.id)]
      return { ...state, dismissedIds: all, readIds: all }
    }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        runtimeNotifications: [action.notification, ...state.runtimeNotifications.filter((n) => n.id !== action.notification.id)],
        dismissedIds: state.dismissedIds.filter((id) => id !== action.notification.id),
        readIds: state.readIds.filter((id) => id !== action.notification.id),
      }
    case 'SET_OFFLINE':
      return { ...state, offlineSim: action.value }
    case 'SET_WHATSAPP':
      return { ...state, whatsappOptIn: action.value }
    case 'SET_LANGUAGE':
      return { ...state, language: action.value }
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.code)
          ? state.wishlist.filter((c) => c !== action.code)
          : [...state.wishlist, action.code],
      }
    case 'SET_NOTIFICATION_PREF':
      return { ...state, notificationPrefs: { ...state.notificationPrefs, [action.key]: action.value } }
    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.patch } }
    case 'ADD_PASSENGER':
      return { ...state, savedPassengers: [...state.savedPassengers, action.passenger] }
    case 'REMOVE_PASSENGER':
      return { ...state, savedPassengers: state.savedPassengers.filter((p) => p.id !== action.id) }
    case 'ADD_PAYMENT':
      return { ...state, paymentMethods: [action.method, ...state.paymentMethods] }
    case 'REMOVE_PAYMENT':
      return { ...state, paymentMethods: state.paymentMethods.filter((m) => m.id !== action.id) }
    case 'SET_DEFAULT_PAYMENT':
      return { ...state, paymentMethods: state.paymentMethods.map((m) => ({ ...m, isDefault: m.id === action.id })) }
    case 'EARN_MILES': {
      const entry: MilesActivity = { ...action.entry, id: action.entry.id ?? uid('act') }
      return {
        ...state,
        miles: {
          ...state.miles,
          balance: state.miles.balance + Math.max(0, entry.miles),
          tierMiles: state.miles.tierMiles + (action.tierMiles ?? 0),
          activity: [entry, ...state.miles.activity.filter((a) => a.id !== entry.id)],
        },
      }
    }
    case 'SPEND_MILES': {
      const entry: MilesActivity = { ...action.entry, id: action.entry.id ?? uid('act'), miles: -Math.abs(action.entry.miles) }
      return {
        ...state,
        miles: { ...state.miles, balance: Math.max(0, state.miles.balance + entry.miles), activity: [entry, ...state.miles.activity] },
      }
    }
    case 'REDEEM_REWARD': {
      if (state.miles.balance < action.reward.miles) return state
      const entry: MilesActivity = { id: uid('act'), date: action.date, title: 'Award redemption', subtitle: action.reward.title, miles: -action.reward.miles, type: 'redeem' }
      return {
        ...state,
        miles: {
          ...state.miles,
          balance: state.miles.balance - action.reward.miles,
          activity: [entry, ...state.miles.activity],
          vouchers: [action.voucher, ...state.miles.vouchers],
        },
      }
    }
    case 'USE_VOUCHER':
      return { ...state, miles: { ...state.miles, vouchers: state.miles.vouchers.map((v) => (v.id === action.id ? { ...v, status: 'used' } : v)) } }
    case 'SUBMIT_CLAIM': {
      const entry: MilesActivity = { id: `claim-${action.claim.id}`, date: action.claim.date, title: `${action.claim.flightNumber} · missing miles claim`, subtitle: `Booking ${action.claim.bookingCode} · under review`, miles: action.claim.miles, type: 'pending' }
      return { ...state, miles: { ...state.miles, claims: [action.claim, ...state.miles.claims], activity: [entry, ...state.miles.activity] } }
    }
    case 'ADD_PURCHASE':
      return { ...state, purchases: [action.purchase, ...state.purchases] }
    case 'REMOVE_PURCHASE':
      return { ...state, purchases: state.purchases.filter((p) => p.id !== action.id) }
    case 'ADD_FEEDBACK':
      return { ...state, feedback: [action.entry, ...state.feedback] }
    case 'ADD_CASE':
      return { ...state, cases: [action.entry, ...state.cases] }
    case 'TOGGLE_SAVED_READ':
      return { ...state, savedReads: state.savedReads.includes(action.id) ? state.savedReads.filter((i) => i !== action.id) : [...state.savedReads, action.id] }
    case 'SIGN_OUT_DEVICE':
      return { ...state, devices: state.devices.filter((d) => d.id !== action.id || d.current) }
    case 'SET_PREF':
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } }
    case 'SET_SHARE':
      return { ...state, share: { ...state.share, ...action.patch } }
    case 'SET_MILES_GOAL':
      return { ...state, milesGoal: action.rewardId }
    case 'RESET_TRIPS':
      return {
        ...state,
        trips: SEED_TRIPS,
        runtimeNotifications: [],
        dismissedIds: [],
        readIds: initialState.readIds,
        lastBookingId: null,
        draft: null,
        miles: initialState.miles,
        purchases: initialState.purchases,
        cases: initialState.cases,
        feedback: [],
      }
    case 'RESET_ALL':
      return initialState
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<AppState>
    const draft = parsed.draft && Array.isArray(parsed.draft.passengers) && Array.isArray(parsed.draft.legIds) ? parsed.draft : null
    return {
      ...initialState,
      ...parsed,
      draft,
      search: { ...DEFAULT_SEARCH, ...(parsed.search ?? {}) },
      miles: { ...initialState.miles, ...(parsed.miles ?? {}) },
      prefs: { ...initialState.prefs, ...(parsed.prefs ?? {}) },
      share: { ...DEFAULT_SHARE, ...(parsed.share ?? {}), custom: { ...DEFAULT_SHARE.custom, ...(parsed.share?.custom ?? {}) } },
    }
  } catch {
    return initialState
  }
}

export interface MilesSummary {
  balance: number
  tierMiles: number
  tier: Tier
  nextTier: Tier | undefined
  /** Progress towards the next tier, 0–100. */
  progressPct: number
  milesToNextTier: number
  activity: MilesActivity[]
  vouchers: Voucher[]
  activeVouchers: Voucher[]
  claims: MilesClaim[]
  earnedThisYear: number
  redeemedThisYear: number
  flightsThisYear: number
  destinations: number
  expiringMiles: number
  expiringOn: string
}

interface AppContextValue {
  state: AppState
  dispatch: (action: Action) => void
  user: User
  isMember: boolean
  notifications: AppNotification[]
  unreadCount: number
  upcomingTrips: Trip[]
  pastTrips: Trip[]
  nextTrip: Trip | undefined
  getTrip: (id: string | undefined) => Trip | undefined
  miles: MilesSummary
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage may be unavailable in private mode — the app still works in memory */
    }
  }, [state])

  const value = useMemo<AppContextValue>(() => {
    const isMember = state.auth === 'member'
    const runtime: AppNotification[] = state.runtimeNotifications.map((n) => ({
      id: n.id,
      category: n.category,
      title: n.title,
      body: n.body,
      time: n.time,
      to: n.to,
      read: state.readIds.includes(n.id),
      icon: ICONS[n.iconKey],
    }))
    const seeded: AppNotification[] = SEED_NOTIFICATIONS.map((n) => ({ ...n, read: state.readIds.includes(n.id) }))
    const notifications = isMember
      ? [...runtime, ...seeded].filter((n) => !state.dismissedIds.includes(n.id))
      : []
    const trips = isMember ? state.trips : []
    const upcomingTrips = trips
      .filter((t) => t.category === 'upcoming')
      .sort((a, b) => (a.date < b.date ? -1 : 1))
    const pastTrips = trips.filter((t) => t.category === 'past').sort((a, b) => (a.date < b.date ? 1 : -1))

    const tier = tierForMiles(state.miles.tierMiles)
    const nextTier = nextTierFor(tier.name)
    const span = nextTier ? nextTier.threshold - tier.threshold : 1
    const progressPct = nextTier ? Math.min(100, Math.round(((state.miles.tierMiles - tier.threshold) / span) * 100)) : 100
    const activity = [...state.miles.activity, ...MILES_ACTIVITY].sort((a, b) => (a.date < b.date ? 1 : -1))
    const thisYear = activity.filter((a) => a.date.startsWith('2026'))
    const user: User = { ...USER, ...state.profile, tier: tier.name }
    const visited = new Set<string>(['CGK', 'DPS', 'SUB', 'SIN', 'HND'])
    pastTrips.forEach((t) => visited.add(t.destination))

    const miles: MilesSummary = {
      balance: state.miles.balance,
      tierMiles: state.miles.tierMiles,
      tier,
      nextTier,
      progressPct,
      milesToNextTier: nextTier ? Math.max(0, nextTier.threshold - state.miles.tierMiles) : 0,
      activity,
      vouchers: state.miles.vouchers,
      activeVouchers: state.miles.vouchers.filter((v) => v.status === 'active'),
      claims: state.miles.claims,
      earnedThisYear: thisYear.filter((a) => a.miles > 0 && a.type !== 'pending').reduce((s, a) => s + a.miles, 0),
      redeemedThisYear: thisYear.filter((a) => a.miles < 0).reduce((s, a) => s + Math.abs(a.miles), 0),
      flightsThisYear: 7 + pastTrips.filter((t) => t.date.startsWith('2026') && !SEED_TRIPS.some((s) => s.id === t.id)).length,
      destinations: visited.size,
      expiringMiles: MILES_SEED.expiringMiles,
      expiringOn: MILES_SEED.expiringOn,
    }

    return {
      state,
      dispatch,
      user,
      isMember,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      upcomingTrips,
      pastTrips,
      nextTrip: upcomingTrips[0],
      getTrip: (id) => (id ? trips.find((t) => t.id === id) : undefined),
      miles,
    }
  }, [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { TIERS }
