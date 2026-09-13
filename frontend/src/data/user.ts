import type { Device, PaymentMethodItem, SavedPassenger, Trip, User } from '../types'

export const DEMO_CREDENTIALS = {
  email: 'demo@flygaruda.app',
  password: 'FlyGaruda2026',
}

export const USER: User = {
  name: 'Kevin Wijaya',
  firstName: 'Kevin',
  initials: 'RW',
  email: 'kevin.wijaya@example.com',
  phone: '+62 812 3456 7890',
  milesId: 'GA-27845193',
  tier: 'Silver',
  homeAirport: 'CGK',
  preferredSeat: 'Window',
  travelPreference: 'Leisure + Education',
  language: 'English / Bahasa Indonesia',
  memberSince: '2021',
}

export const SAVED_PASSENGERS: SavedPassenger[] = [
  { id: 'p1', name: 'Kevin Wijaya', relation: 'Myself', dob: '14 Mar 1998', milesId: 'GA-27845193', passport: 'X•••••812' },
  { id: 'p2', name: 'Dewi Anggraini', relation: 'Family', dob: '02 Jul 1999', milesId: 'GA-30112788', passport: 'X•••••441' },
  { id: 'p3', name: 'Bima Wijaya', relation: 'Family', dob: '27 Nov 1965', milesId: undefined, passport: 'X•••••209' },
]

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  { id: 'card', kind: 'card', label: 'Credit / Debit Card', detail: 'Visa •••• 4821', note: 'Instant confirmation', isDefault: true },
  { id: 'transfer', kind: 'transfer', label: 'Bank Transfer', detail: 'Virtual account · BCA, Mandiri, BNI, BRI', note: 'Pay within 60 minutes' },
  { id: 'qris', kind: 'qris', label: 'QR Payment', detail: 'QRIS · any supported e-wallet', note: 'Scan to pay' },
  { id: 'wallet', kind: 'wallet', label: 'Travel Wallet', detail: 'Balance Rp 2,150,000', note: 'Use your FlyGaruda wallet' },
  { id: 'miles', kind: 'miles', label: 'GarudaMiles Cash + Miles', detail: 'Pay part of the fare with miles', note: 'Reduce your fare with miles' },
]

export const DEVICES: Device[] = [
  { id: 'd1', name: 'iPhone 15 Pro', location: 'Jakarta, Indonesia', lastActive: 'Active now', current: true },
  { id: 'd2', name: 'Chrome on Windows', location: 'Jakarta, Indonesia', lastActive: '2 hours ago', current: false },
  { id: 'd3', name: 'iPad Air', location: 'Denpasar, Indonesia', lastActive: '3 weeks ago', current: false },
]

/**
 * Bookings made outside the app (website, travel agents) that can be retrieved
 * from Trips → Add trip with the booking code and passenger last name.
 */
export const RETRIEVABLE_BOOKINGS: { code: string; lastName: string; trip: Trip }[] = [
  {
    code: 'KD7P2Q',
    lastName: 'WIJAYA',
    trip: {
      id: 'trip-ga306-kd7p2q',
      bookingCode: 'KD7P2Q',
      flightNumber: 'GA 306',
      origin: 'CGK',
      destination: 'SUB',
      date: '2026-10-17',
      departTime: '06:15',
      arriveTime: '07:40',
      boardingTime: '05:45',
      terminal: 'Terminal 3',
      arrivalTerminal: 'Terminal 2',
      gate: 'TBA',
      seat: null,
      zone: '3',
      sequence: '063',
      aircraft: 'Boeing 737-800',
      cabin: 'economy',
      fare: 'value',
      status: 'scheduled',
      stage: 'booked',
      category: 'upcoming',
      checkedIn: false,
      checkInOpen: false,
      passengerName: 'Kevin Wijaya',
      baggageChecked: '20 kg',
      baggageCabin: '7 kg',
      meal: 'Standard meal',
      milesEstimate: 750,
      totalPaid: 1348000,
      distanceKm: 690,
    },
  },
  {
    code: 'BX3W8N',
    lastName: 'ANGGRAINI',
    trip: {
      id: 'trip-ga402-bx3w8n',
      bookingCode: 'BX3W8N',
      flightNumber: 'GA 402',
      origin: 'CGK',
      destination: 'DPS',
      date: '2026-11-07',
      departTime: '06:15',
      arriveTime: '08:05',
      boardingTime: '05:45',
      terminal: 'Terminal 3',
      arrivalTerminal: 'Domestic Terminal',
      gate: 'TBA',
      seat: '12A',
      zone: '2',
      sequence: '021',
      aircraft: 'Boeing 737-800',
      cabin: 'economy',
      fare: 'flex',
      status: 'scheduled',
      stage: 'booked',
      category: 'upcoming',
      checkedIn: false,
      checkInOpen: false,
      passengerName: 'Dewi Anggraini',
      baggageChecked: '20 kg',
      baggageCabin: '7 kg',
      meal: 'Vegetarian',
      milesEstimate: 1275,
      totalPaid: 2137000,
      distanceKm: 985,
    },
  },
]
