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
  /** Outbound flight chosen on a round trip while the return flight is being selected. */
  outboundFlightId?: string
}

export interface AddOn {
  id: string
  label: string
  description: string
  price: number
}

export interface DraftPassenger {
  id: string
  type: 'adult' | 'child' | 'infant'
  title: string
  firstName: string
  lastName: string
  milesId?: string
}

export interface BookingDraft {
  /** One id per flight leg (outbound, optionally return). */
  legIds: string[]
  fareId: FareId
  passengers: DraftPassenger[]
  contact: { email: string; phone: string }
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
  newGate?: string
  previousGate?: string
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
  /** Travel checklist items ticked by the traveller (persisted per trip). */
  checklist?: string[]
  passengerCount?: number
  /** Boarding pass saved to the device wallet. */
  walletSaved?: boolean
  /** Carbon emissions for this flight have been offset. */
  carbonOffset?: boolean
  /** Miles for this flight have been credited to the balance. */
  milesCredited?: boolean
  /** Traveller acknowledged the latest flight update. */
  updateAcknowledged?: boolean
  /** Bid placed for a Business Class upgrade (IDR). */
  upgradeBid?: number
  /** Distance of the flight in km (used for passport stats). */
  distanceKm?: number
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
  /** ISO date 'YYYY-MM-DD'. */
  date: string
  title: string
  subtitle: string
  miles: number
  type: 'earn' | 'redeem' | 'bonus' | 'pending'
}

export type TierName = 'Blue' | 'Silver' | 'Gold' | 'Platinum'

export interface Tier {
  name: TierName
  /** Tier miles required in a membership year. */
  threshold: number
  bonus: number
  color: string
  accent: string
}

export type RewardCategory = 'flight' | 'upgrade' | 'cash' | 'partner' | 'service'

export interface Reward {
  id: string
  title: string
  description: string
  category: RewardCategory
  miles: number
  icon: LucideIcon
  validity: string
  terms: string[]
}

export interface Voucher {
  id: string
  rewardId: string
  title: string
  code: string
  miles: number
  issuedAt: string
  expires: string
  status: 'active' | 'used'
}

export interface MilesClaim {
  id: string
  flightNumber: string
  date: string
  bookingCode: string
  miles: number
  status: 'pending' | 'credited'
  submittedAt: string
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
  current: number
  target: number
  earnedOn?: string
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
  /** Promo code applied at checkout when the offer is claimed. */
  promoCode?: string
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

/* ---------- Account, services & purchases ---------- */

export interface SavedPassenger {
  id: string
  name: string
  relation: string
  dob: string
  milesId?: string
  passport: string
}

export interface PaymentMethodItem {
  id: string
  kind: 'card' | 'transfer' | 'qris' | 'wallet' | 'miles'
  label: string
  detail: string
  note: string
  isDefault?: boolean
}

export type PurchaseKind = 'transfer' | 'car' | 'roaming' | 'hotel' | 'experience' | 'shop' | 'lounge' | 'offset' | 'insurance' | 'bid' | 'charter' | 'cargo' | 'library'

export interface Purchase {
  id: string
  kind: PurchaseKind
  title: string
  detail: string
  price: number
  date: string
  status: 'confirmed' | 'pending' | 'saved'
  milesEarned?: number
  reference?: string
}

export interface FeedbackEntry {
  id: string
  flight: string
  rating: number
  comment: string
  submittedAt: string
}

export interface SupportCase {
  id: string
  kind: 'lost-item' | 'refund' | 'charter' | 'password'
  title: string
  detail: string
  reference: string
  status: 'open' | 'in-progress' | 'resolved'
  submittedAt: string
}

export interface Device {
  id: string
  name: string
  location: string
  lastActive: string
  current: boolean
}

/* ---------- User ---------- */

export interface User {
  name: string
  firstName: string
  initials: string
  email: string
  phone: string
  milesId: string
  tier: TierName
  homeAirport: AirportCode
  preferredSeat: string
  travelPreference: string
  language: string
  memberSince: string
}
