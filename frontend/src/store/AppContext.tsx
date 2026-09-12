/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { AlertTriangle, Award, BellRing, DoorOpen, Gift, MapPin, Tag, TicketCheck } from 'lucide-react'
import type {
  AirportCode,
  AppNotification,
  BookingDraft,
  Disruption,
  JourneyStage,
  NotificationCategory,
  SearchParams,
  Trip,
} from '../types'
import { SEED_TRIPS } from '../data/trips'
import { SEED_NOTIFICATIONS } from '../data/notifications'
import { USER } from '../data/user'

const STORAGE_KEY = 'flygaruda.state.v1'

export type AuthState = 'unknown' | 'guest' | 'member'

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
  | { type: 'RESET_TRIPS' }
  | { type: 'RESET_ALL' }

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
      return { ...state, trips: [action.trip, ...state.trips], lastBookingId: action.trip.id, draft: null }
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
              }
            : t,
        ),
      }
    case 'CLEAR_DISRUPTION':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.id
            ? { ...t, disruption: undefined, gate: t.disruption?.previousGate ?? t.gate, status: t.status === 'delayed' ? 'on-time' : t.status }
            : t,
        ),
      }
    case 'SET_STAGE':
      return {
        ...state,
        trips: state.trips.map((t) => {
          if (t.id !== action.id) return t
          const stageOrder: JourneyStage[] = ['booked', 'checkin', 'airport', 'boarding', 'inflight', 'arrival']
          const idx = stageOrder.indexOf(action.stage)
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
    case 'RESET_TRIPS':
      return { ...state, trips: SEED_TRIPS, runtimeNotifications: [], dismissedIds: [], readIds: initialState.readIds, lastBookingId: null, draft: null }
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
    return { ...initialState, ...parsed, draft, search: { ...DEFAULT_SEARCH, ...(parsed.search ?? {}) } }
  } catch {
    return initialState
  }
}

interface AppContextValue {
  state: AppState
  dispatch: (action: Action) => void
  user: typeof USER
  isMember: boolean
  notifications: AppNotification[]
  unreadCount: number
  upcomingTrips: Trip[]
  nextTrip: Trip | undefined
  getTrip: (id: string | undefined) => Trip | undefined
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
    return {
      state,
      dispatch,
      user: USER,
      isMember,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      upcomingTrips,
      nextTrip: upcomingTrips[0],
      getTrip: (id) => (id ? trips.find((t) => t.id === id) : undefined),
    }
  }, [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
