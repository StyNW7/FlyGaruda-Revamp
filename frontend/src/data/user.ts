import type { User } from '../types'

export const DEMO_CREDENTIALS = {
  email: 'demo@flygaruda.app',
  password: 'FlyGaruda2026',
}

export const USER: User = {
  name: 'Raka Wijaya',
  firstName: 'Raka',
  initials: 'RW',
  email: 'raka.wijaya@example.com',
  phone: '+62 812 3456 7890',
  milesId: 'GA-27845193',
  tier: 'Silver',
  homeAirport: 'CGK',
  preferredSeat: 'Window',
  travelPreference: 'Leisure + Education',
  language: 'English / Bahasa Indonesia',
  memberSince: '2021',
}

export const SAVED_PASSENGERS = [
  { id: 'p1', name: 'Raka Wijaya', relation: 'Myself', dob: '14 Mar 1998', milesId: 'GA-27845193', passport: 'X•••••812' },
  { id: 'p2', name: 'Dewi Anggraini', relation: 'Family', dob: '02 Jul 1999', milesId: 'GA-30112788', passport: 'X•••••441' },
  { id: 'p3', name: 'Bima Wijaya', relation: 'Family', dob: '27 Nov 1965', milesId: undefined, passport: 'X•••••209' },
]

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', detail: 'Visa •••• 4821', note: 'Instant confirmation' },
  { id: 'transfer', label: 'Bank Transfer', detail: 'Virtual account · BCA, Mandiri, BNI, BRI', note: 'Pay within 60 minutes' },
  { id: 'qris', label: 'QR Payment', detail: 'QRIS · any supported e-wallet', note: 'Scan to pay' },
  { id: 'wallet', label: 'Travel Wallet', detail: 'Balance Rp 2,150,000', note: 'Use your FlyGaruda wallet' },
  { id: 'miles', label: 'GarudaMiles Cash + Miles', detail: 'Use up to 8,000 miles', note: 'Reduce your fare with miles' },
]
