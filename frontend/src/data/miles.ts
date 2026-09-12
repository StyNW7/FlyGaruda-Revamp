import {
  ArrowUpCircle,
  Award,
  Compass,
  Crown,
  Gift,
  Globe,
  Luggage,
  Plane,
  Sparkles,
  Ticket,
  Armchair,
  Wallet,
} from 'lucide-react'
import type { Badge, MilesActivity, MonthlyMiles, PassportStamp } from '../types'

export const MILES_SUMMARY = {
  balance: 12450,
  tier: 'Silver',
  nextTier: 'Gold',
  tierMiles: 18400,
  tierTarget: 30000,
  flightsThisYear: 7,
  destinations: 5,
  expiringMiles: 1200,
  expiringOn: '31 Dec 2026',
}

export const MONTHLY_MILES: MonthlyMiles[] = [
  { month: 'Apr', miles: 0 },
  { month: 'May', miles: 1250 },
  { month: 'Jun', miles: 3600 },
  { month: 'Jul', miles: 850 },
  { month: 'Aug', miles: 1700 },
  { month: 'Sep', miles: 850 },
]

export const MILES_ACTIVITY: MilesActivity[] = [
  { id: 'a1', date: '20 Aug 2026', title: 'GA 418 · Denpasar → Jakarta', subtitle: 'Economy Saver · Flight miles', miles: 850, type: 'earn' },
  { id: 'a2', date: '18 Aug 2026', title: 'Silver tier bonus', subtitle: '25% tier bonus on GA 418', miles: 212, type: 'bonus' },
  { id: 'a3', date: '15 Jul 2026', title: 'Partner hotel stay', subtitle: 'Nusantara Hotels · 2 nights', miles: 600, type: 'earn' },
  { id: 'a4', date: '13 Jun 2026', title: 'GA 874 · Jakarta → Tokyo', subtitle: 'Economy Value · Flight miles', miles: 3600, type: 'earn' },
  { id: 'a5', date: '02 May 2026', title: 'Award redemption', subtitle: 'Lounge access voucher', miles: -1500, type: 'redeem' },
]

export const PASSPORT_STAMPS: PassportStamp[] = [
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', firstVisit: 'Home', visits: 8, collected: true },
  { code: 'DPS', city: 'Bali', country: 'Indonesia', firstVisit: 'Mar 2024', visits: 3, collected: true },
  { code: 'SUB', city: 'Surabaya', country: 'Indonesia', firstVisit: 'Sep 2024', visits: 1, collected: true },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', firstVisit: 'Jan 2025', visits: 2, collected: true },
  { code: 'HND', city: 'Tokyo', country: 'Japan', firstVisit: 'Jun 2026', visits: 1, collected: true },
  { code: 'UPG', city: 'Makassar', country: 'Indonesia', firstVisit: 'Not yet', visits: 0, collected: false },
]

export const PASSPORT_STATS = {
  flights: 8,
  destinations: 5,
  distanceKm: 11840,
  milesEarned: 8250,
}

export const BADGES: Badge[] = [
  { id: 'first-wings', name: 'First Wings', description: 'Completed your first Garuda flight', earned: true, icon: Plane },
  { id: 'nusantara', name: 'Nusantara Explorer', description: 'Visit 5 Indonesian destinations', earned: false, progress: '4 / 5', icon: Compass },
  { id: 'global', name: 'Global Explorer', description: 'Visit 3 international destinations', earned: false, progress: '2 / 3', icon: Globe },
  { id: 'loyal', name: 'Silver Wings', description: 'Reached GarudaMiles Silver', earned: true, icon: Crown },
]

export const MILES_NEXT = {
  flightsProgress: { current: 2, target: 3, reward: 'Complimentary Wi-Fi Pass' },
  destinationProgress: { current: 4, target: 5, milestone: 'Nusantara Explorer' },
}

export const TRAVEL_BENEFITS = [
  { icon: Sparkles, title: 'Priority services', description: 'Priority check-in and boarding at Garuda counters', tier: 'Silver and above' },
  { icon: Luggage, title: 'Extra baggage privilege', description: 'Additional 5 kg checked allowance on Garuda flights', tier: 'Silver and above' },
  { icon: Armchair, title: 'Seat benefit', description: 'Complimentary preferred seat selection on eligible fares', tier: 'Gold and above' },
  { icon: Award, title: 'Miles earning bonus', description: '25% tier bonus miles on every eligible fare', tier: 'Silver' },
  { icon: Ticket, title: 'Award ticket eligibility', description: 'Redeem miles for flights across the Garuda network', tier: 'All members' },
]

export const REWARDS = [
  { icon: Ticket, title: 'Award Ticket', description: 'Jakarta → Bali from 7,500 miles', miles: 7500 },
  { icon: ArrowUpCircle, title: 'Upgrade Award', description: 'Economy → Business from 12,000 miles', miles: 12000 },
  { icon: Wallet, title: 'Cash + Miles', description: 'Reduce any fare with as little as 2,000 miles', miles: 2000 },
  { icon: Gift, title: 'Partner Rewards', description: 'Hotels, lounges and lifestyle partners', miles: 1500 },
]
