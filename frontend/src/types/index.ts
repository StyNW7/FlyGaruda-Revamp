import type { LucideIcon } from 'lucide-react'

/* ---------- Airports & flights ---------- */

export type AirportCode = 'CGK' | 'DPS' | 'SUB' | 'UPG' | 'KNO' | 'SIN' | 'NRT' | 'HND' | 'ICN' | 'SYD'

export interface Airport {
  code: AirportCode
  city: string
  name: string
  country: string
  region: 'domestic' | 'international'
}

export type CabinClass = 'economy' | 'business' | 'first'
export type TripType = 'round' | 'oneway' | 'multi'
export type FareId = 'saver' | 'value' | 'flex'

export interface FarePrices {
  saver: number
  value: number
  flex: number
}

export interface Flight {
  id: string
  number: string
  origin: AirportCode
  destination: AirportCode
  departTime: string
  arriveTime: string
  durationMin: number
  aircraft: string
  terminal: string
  arrivalTerminal: string
  stops: number
  prices: FarePrices
  milesEarn: number
  seatsLeft?: number
  tags?: ('best-value' | 'earliest' | 'lowest-fare')[]
}

export interface FareFeature {
  label: string
  value: string
  included: boolean
}

export interface FareFamily {
  id: FareId
  name: string
  tagline: string
  features: FareFeature[]
  milesMultiplier: string
}

export interface ValueItem {
  key: string
  title: string
  short: string
  description: string
  status: 'Included' | 'Earned' | 'Selected fares'
  icon: LucideIcon
}

/* ---------- Search & booking ---------- */

export interface Passengers {
  adults: number
  children: number
  infants: number
}

export interface SearchParams {
  tripType: TripType
  origin: AirportCode
  destination: AirportCode
  departDate: string
  returnDate: string
  passengers: Passengers
  cabin: CabinClass
  promoCode?: string
}

export interface AddOn {
  id: string
  label: string
  description: string
  price: number
}

export interface BookingDraft {
  flightId: string
  fareId: FareId
  passenger: {
    title: string
    firstName: string
    lastName: string
    email: string
    phone: string
    milesId?: string
  }
  seat: string | null
  addOns: string[]
  paymentMethod: string | null
}

/* ---------- Trips & journey ---------- */

export type TripStatus = 'on-time' | 'scheduled' | 'delayed' | 'boarding' | 'completed' | 'cancelled'
export type TripCategory = 'upcoming' | 'past' | 'cancelled'
export type JourneyStage = 'booked' | 'checkin' | 'airport' | 'boarding' | 'inflight' | 'arrival'

export interface Disruption {
  type: 'delay' | 'gate-change'
  delayMin: number
  newDepartTime: string
  newBoardingTime: string
  newArriveTime: string
  reason: string
  issuedAt: string
}

export interface Trip {
  id: string
  bookingCode: string
  flightNumber: string
  origin: AirportCode
  destination: AirportCode
  date: string
  departTime: string
  arriveTime: string
  boardingTime: string
  terminal: string
  arrivalTerminal: string
  gate: string
  seat: string | null
  zone: string
  sequence: string
  aircraft: string
  cabin: CabinClass
  fare: FareId
  status: TripStatus
  stage: JourneyStage
  category: TripCategory
  checkedIn: boolean
  checkInOpen: boolean
  passengerName: string
  baggageChecked: string
  baggageCabin: string
  meal: string
  milesEstimate: number
  belt?: string
  disruption?: Disruption
  addOns?: string[]
  totalPaid?: number
}

export interface CompanionEvent {
  id: string
  when: string
  title: string
  description: string
  details?: { label: string; value: string }[]
  cta?: { label: string; to: string }
  state: 'done' | 'current' | 'upcoming'
  icon: LucideIcon
}

/* ---------- Loyalty ---------- */

export interface MilesActivity {
  id: string
  date: string
  title: string
  subtitle: string
  miles: number
  type: 'earn' | 'redeem' | 'bonus'
}

export interface MonthlyMiles {
  month: string
  miles: number
}

export interface PassportStamp {
  code: AirportCode
  city: string
  country: string
  firstVisit: string
  visits: number
  collected: boolean
}

export interface Badge {
  id: string
  name: string
  description: string
  earned: boolean
  progress?: string
  icon: LucideIcon
}

/* ---------- Notifications, offers, more ---------- */

export type NotificationCategory = 'travel' | 'miles' | 'promo'

export interface AppNotification {
  id: string
  category: NotificationCategory
  title: string
  body: string
  time: string
  read: boolean
  to?: string
  icon: LucideIcon
}

export interface Offer {
  id: string
  title: string
  subtitle: string
  destination: string
  destinationCode: AirportCode
  priceFrom: number
  tag: string
  tone: 'navy' | 'turquoise' | 'blue' | 'gold'
}

export interface Destination {
  code: AirportCode
  city: string
  country: string
  priceFrom: number
  tagline: string
  tone: 'navy' | 'turquoise' | 'blue' | 'gold' | 'deep'
}

export interface MoreFeature {
  slug: string
  label: string
  description: string
  icon: LucideIcon
  to?: string
  badge?: string
}

export interface MoreGroup {
  id: string
  title: string
  items: MoreFeature[]
}

/* ---------- User ---------- */

export interface User {
  name: string
  firstName: string
  initials: string
  email: string
  phone: string
  milesId: string
  tier: 'Blue' | 'Silver' | 'Gold' | 'Platinum'
  homeAirport: AirportCode
  preferredSeat: string
  travelPreference: string
  language: string
  memberSince: string
}
