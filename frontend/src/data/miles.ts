import {
  Armchair,
  ArrowUpCircle,
  Award,
  BedDouble,
  Building2,
  Car,
  Compass,
  CreditCard,
  Crown,
  Gift,
  Globe,
  Luggage,
  Moon,
  Plane,
  PlaneTakeoff,
  ShoppingBag,
  Sofa,
  Sparkles,
  Sunrise,
  Ticket,
  Wallet,
  Wifi,
} from 'lucide-react'
import type { AirportCode, Badge, MilesActivity, MonthlyMiles, PassportStamp, Reward, Tier, TierName } from '../types'

/* ---------- Programme structure (illustrative values for the prototype) ---------- */

export const TIERS: Tier[] = [
  { name: 'Blue', threshold: 0, bonus: 0, color: '#1179B7', accent: '#E8F2FA' },
  { name: 'Silver', threshold: 15000, bonus: 25, color: '#8A93A6', accent: '#EEF1F6' },
  { name: 'Gold', threshold: 30000, bonus: 50, color: '#C9A24B', accent: '#FBF5E6' },
  { name: 'Platinum', threshold: 60000, bonus: 75, color: '#3E4C66', accent: '#E9ECF3' },
]

export function tierForMiles(tierMiles: number): Tier {
  return [...TIERS].reverse().find((t) => tierMiles >= t.threshold) ?? TIERS[0]
}

export function nextTierFor(tier: TierName): Tier | undefined {
  const i = TIERS.findIndex((t) => t.name === tier)
  return TIERS[i + 1]
}

/** Seeded starting point for Kevin's account. Everything else is derived from state. */
export const MILES_SEED = {
  balance: 12450,
  tierMiles: 18400,
  expiringMiles: 1200,
  expiringOn: '2026-12-31',
  memberSince: '2021',
  qualifyingPeriodEnds: '2027-03-31',
}

export const MONTHLY_MILES: MonthlyMiles[] = [
  { month: 'Oct', miles: 1050 },
  { month: 'Nov', miles: 0 },
  { month: 'Dec', miles: 2200 },
  { month: 'Jan', miles: 1100 },
  { month: 'Feb', miles: 0 },
  { month: 'Mar', miles: 600 },
  { month: 'Apr', miles: 0 },
  { month: 'May', miles: 1250 },
  { month: 'Jun', miles: 4500 },
  { month: 'Jul', miles: 600 },
  { month: 'Aug', miles: 1062 },
  { month: 'Sep', miles: 0 },
]

export const MILES_ACTIVITY: MilesActivity[] = [
  { id: 'a1', date: '2026-08-20', title: 'GA 418 · Denpasar → Jakarta', subtitle: 'Economy Saver · Flight miles', miles: 850, type: 'earn' },
  { id: 'a2', date: '2026-08-20', title: 'Silver tier bonus', subtitle: '25% tier bonus on GA 418', miles: 212, type: 'bonus' },
  { id: 'a3', date: '2026-07-15', title: 'Nusantara Hotels · Seminyak', subtitle: 'Partner hotel stay · 2 nights', miles: 600, type: 'earn' },
  { id: 'a4', date: '2026-06-13', title: 'GA 874 · Jakarta → Tokyo', subtitle: 'Economy Value · Flight miles', miles: 3600, type: 'earn' },
  { id: 'a5', date: '2026-06-13', title: 'Silver tier bonus', subtitle: '25% tier bonus on GA 874', miles: 900, type: 'bonus' },
  { id: 'a6', date: '2026-05-02', title: 'Award redemption', subtitle: 'Lounge access voucher · Terminal 3', miles: -1500, type: 'redeem' },
  { id: 'a7', date: '2026-05-01', title: 'GarudaMiles Credit Card', subtitle: 'Monthly spend · Rp 6,250,000', miles: 1250, type: 'earn' },
  { id: 'a8', date: '2026-03-18', title: 'GA 306 · Jakarta → Surabaya', subtitle: 'Economy Saver · Flight miles', miles: 600, type: 'earn' },
  { id: 'a9', date: '2026-01-22', title: 'GA 836 · Singapore → Jakarta', subtitle: 'Economy Value · Flight miles', miles: 1100, type: 'earn' },
  { id: 'a10', date: '2025-12-27', title: 'Welcome to Silver', subtitle: 'Tier upgrade bonus', miles: 1000, type: 'bonus' },
  { id: 'a11', date: '2025-12-20', title: 'GA 824 · Jakarta → Singapore', subtitle: 'Economy Flex · Flight miles', miles: 1200, type: 'earn' },
]

/* ---------- Rewards catalogue ---------- */

export const REWARDS: Reward[] = [
  {
    id: 'award-cgk-dps',
    title: 'Award Ticket · Jakarta → Bali',
    description: 'One-way Economy award on any GA flight',
    category: 'flight',
    miles: 7500,
    icon: Ticket,
    validity: 'Book within 12 months',
    terms: ['Taxes and airport charges payable in cash', 'Subject to award seat availability', 'Changes allowed up to 24h before departure'],
  },
  {
    id: 'award-cgk-sin',
    title: 'Award Ticket · Jakarta → Singapore',
    description: 'One-way Economy award to Changi',
    category: 'flight',
    miles: 11000,
    icon: PlaneTakeoff,
    validity: 'Book within 12 months',
    terms: ['Taxes and airport charges payable in cash', 'Subject to award seat availability'],
  },
  {
    id: 'upgrade',
    title: 'Upgrade Award',
    description: 'Economy → Business on a domestic flight',
    category: 'upgrade',
    miles: 12000,
    icon: ArrowUpCircle,
    validity: 'Use on any upcoming booking',
    terms: ['Eligible on Value and Flex fares', 'Confirmed subject to Business Class availability'],
  },
  {
    id: 'cash-miles',
    title: 'Cash + Miles',
    description: 'Reduce any fare with as little as 2,000 miles',
    category: 'cash',
    miles: 2000,
    icon: Wallet,
    validity: 'Apply at checkout',
    terms: ['1,000 miles = Rp 100,000 off', 'Up to 50% of the base fare can be paid with miles'],
  },
  {
    id: 'lounge',
    title: 'Lounge Access Voucher',
    description: 'Garuda Indonesia Lounge · Terminal 3',
    category: 'service',
    miles: 1500,
    icon: Sofa,
    validity: 'Valid 6 months',
    terms: ['One visit for the member', 'Present the voucher QR at the lounge reception'],
  },
  {
    id: 'wifi',
    title: 'In-flight Wi-Fi Pass',
    description: 'Full-flight connectivity on wide-body aircraft',
    category: 'service',
    miles: 900,
    icon: Wifi,
    validity: 'Valid 12 months',
    terms: ['Available on A330 and B777 aircraft', 'One device per pass'],
  },
  {
    id: 'baggage',
    title: 'Extra Baggage +10 kg',
    description: 'Add 10 kg to a checked allowance',
    category: 'service',
    miles: 2500,
    icon: Luggage,
    validity: 'Valid 12 months',
    terms: ['Apply to any upcoming Garuda flight'],
  },
  {
    id: 'seat',
    title: 'Preferred Seat',
    description: 'Front row or extra legroom on a domestic flight',
    category: 'service',
    miles: 1200,
    icon: Armchair,
    validity: 'Valid 12 months',
    terms: ['Subject to seat availability at time of selection'],
  },
  {
    id: 'hotel',
    title: 'Hotel Night · Nusantara Hotels',
    description: 'One night in a Deluxe room, Bali or Jakarta',
    category: 'partner',
    miles: 9000,
    icon: BedDouble,
    validity: 'Valid 9 months',
    terms: ['Blackout dates apply on public holidays'],
  },
  {
    id: 'shop',
    title: 'GarudaShop Voucher · Rp 250,000',
    description: 'Merchandise and duty-free pre-order',
    category: 'partner',
    miles: 2800,
    icon: ShoppingBag,
    validity: 'Valid 6 months',
    terms: ['Single use · no cash change'],
  },
]

export type RewardCategoryFilter = 'all' | Reward['category']

export const REWARD_CATEGORIES: { id: RewardCategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'flight', label: 'Flights' },
  { id: 'upgrade', label: 'Upgrades' },
  { id: 'service', label: 'Services' },
  { id: 'partner', label: 'Partners' },
  { id: 'cash', label: 'Cash + Miles' },
]

export function findReward(id: string): Reward | undefined {
  return REWARDS.find((r) => r.id === id)
}

/* ---------- Benefits matrix by tier ---------- */

export interface BenefitRow {
  icon: typeof Sparkles
  title: string
  description: string
  values: Record<TierName, string | boolean>
}

export const BENEFIT_MATRIX: BenefitRow[] = [
  { icon: Award, title: 'Tier bonus miles', description: 'Extra miles on every eligible Garuda fare', values: { Blue: false, Silver: '+25%', Gold: '+50%', Platinum: '+75%' } },
  { icon: Sparkles, title: 'Priority check-in & boarding', description: 'Dedicated counters and early boarding', values: { Blue: false, Silver: true, Gold: true, Platinum: true } },
  { icon: Luggage, title: 'Extra baggage allowance', description: 'On Garuda-operated flights', values: { Blue: false, Silver: '+5 kg', Gold: '+15 kg', Platinum: '+20 kg' } },
  { icon: Sofa, title: 'Lounge access', description: 'Garuda Indonesia Lounge on any fare', values: { Blue: false, Silver: 'Rp 175k', Gold: true, Platinum: '+1 guest' } },
  { icon: Armchair, title: 'Preferred seat selection', description: 'Front rows and extra legroom', values: { Blue: false, Silver: 'Flex fares', Gold: true, Platinum: true } },
  { icon: Ticket, title: 'Award ticket eligibility', description: 'Redeem miles across the network', values: { Blue: true, Silver: true, Gold: true, Platinum: true } },
  { icon: Crown, title: 'Guaranteed seat', description: 'On sold-out flights, up to 48h before', values: { Blue: false, Silver: false, Gold: false, Platinum: true } },
  { icon: Moon, title: 'Miles validity', description: 'How long earned miles stay active', values: { Blue: '3 years', Silver: '3 years', Gold: 'No expiry', Platinum: 'No expiry' } },
]

/* ---------- Earn partners ---------- */

export const EARN_PARTNERS = [
  { id: 'cc', icon: CreditCard, title: 'GarudaMiles Credit Card', rate: '2 miles / Rp 10,000', note: 'Bank Mandiri · BNI · BCA' },
  { id: 'hotel', icon: Building2, title: 'Partner hotels', rate: 'Up to 900 miles / night', note: 'Nusantara Hotels · Harbour Suites' },
  { id: 'car', icon: Car, title: 'Car rental', rate: '2 miles / Rp 10,000', note: 'Trusted partners at every airport' },
  { id: 'skyteam', icon: Globe, title: 'SkyTeam airlines', rate: 'Flight miles on 18 airlines', note: 'Credit within 14 days' },
]

/* ---------- GarudaMiles Next ---------- */

export const MILES_NEXT = {
  flightsProgress: { current: 2, target: 3, reward: 'Complimentary Wi-Fi Pass', rewardId: 'wifi' },
  destinationProgress: { current: 4, target: 5, milestone: 'Nusantara Explorer' },
}

/* ---------- Garuda Flight Passport ---------- */

export const PASSPORT_STAMPS: PassportStamp[] = [
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', firstVisit: 'Home', visits: 8, collected: true },
  { code: 'DPS', city: 'Bali', country: 'Indonesia', firstVisit: 'Mar 2024', visits: 3, collected: true },
  { code: 'SUB', city: 'Surabaya', country: 'Indonesia', firstVisit: 'Sep 2024', visits: 1, collected: true },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', firstVisit: 'Jan 2025', visits: 2, collected: true },
  { code: 'HND', city: 'Tokyo', country: 'Japan', firstVisit: 'Jun 2026', visits: 1, collected: true },
  { code: 'UPG', city: 'Makassar', country: 'Indonesia', firstVisit: 'Not yet', visits: 0, collected: false },
  { code: 'KNO', city: 'Medan', country: 'Indonesia', firstVisit: 'Not yet', visits: 0, collected: false },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', firstVisit: 'Not yet', visits: 0, collected: false },
  { code: 'SYD', city: 'Sydney', country: 'Australia', firstVisit: 'Not yet', visits: 0, collected: false },
]

/** Approximate coordinates for the passport route map. */
export const AIRPORT_COORDS: Record<AirportCode, { lat: number; lon: number }> = {
  CGK: { lat: -6.13, lon: 106.66 },
  DPS: { lat: -8.75, lon: 115.17 },
  SUB: { lat: -7.38, lon: 112.79 },
  UPG: { lat: -5.06, lon: 119.55 },
  KNO: { lat: 3.64, lon: 98.89 },
  SIN: { lat: 1.36, lon: 103.99 },
  NRT: { lat: 35.77, lon: 140.39 },
  HND: { lat: 35.55, lon: 139.78 },
  ICN: { lat: 37.46, lon: 126.44 },
  SYD: { lat: -33.95, lon: 151.18 },
}

export const BADGES: Badge[] = [
  { id: 'first-wings', name: 'First Wings', description: 'Completed your first Garuda flight', earned: true, current: 1, target: 1, earnedOn: 'Mar 2024', icon: Plane },
  { id: 'silver', name: 'Silver Wings', description: 'Reached GarudaMiles Silver', earned: true, current: 1, target: 1, earnedOn: 'Dec 2025', icon: Crown },
  { id: 'nusantara', name: 'Nusantara Explorer', description: 'Visit 5 Indonesian destinations', earned: false, current: 4, target: 5, icon: Compass },
  { id: 'global', name: 'Global Explorer', description: 'Visit 3 international destinations', earned: false, current: 2, target: 3, icon: Globe },
  { id: 'early', name: 'Early Bird', description: 'Take 3 flights departing before 07:00', earned: false, current: 2, target: 3, icon: Sunrise },
  { id: 'frequent', name: 'Frequent Flyer', description: 'Complete 10 Garuda flights', earned: false, current: 8, target: 10, icon: Award },
  { id: 'loyal', name: 'Loyal Companion', description: 'Fly with Garuda 3 years in a row', earned: true, current: 3, target: 3, earnedOn: 'Jun 2026', icon: Gift },
  { id: 'nightowl', name: 'Night Owl', description: 'Complete an overnight red-eye flight', earned: true, current: 1, target: 1, earnedOn: 'Jun 2026', icon: Moon },
]

/* ---------- Promo codes accepted at checkout ---------- */

export const PROMO_CODES: Record<string, { label: string; percent: number; maxDiscount: number; bonusMiles?: number }> = {
  GARUDA10: { label: '10% off base fare', percent: 10, maxDiscount: 500000 },
  MILES2026: { label: '5% off + 500 bonus miles', percent: 5, maxDiscount: 300000, bonusMiles: 500 },
  BALI15: { label: '15% off Bali fares', percent: 15, maxDiscount: 400000 },
}

/** 1,000 miles = Rp 100,000 when paying with Cash + Miles. */
export const MILES_TO_IDR = 100
