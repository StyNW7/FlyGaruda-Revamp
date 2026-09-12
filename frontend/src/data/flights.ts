import {
  Armchair,
  Award,
  Heart,
  Luggage,
  MonitorPlay,
  RefreshCw,
  UtensilsCrossed,
} from 'lucide-react'
import type { AirportCode, CabinClass, FareFamily, Flight, ValueItem } from '../types'
import { addMinutes, hashString } from '../utils/format'

/** Route metadata used to synthesise realistic schedules for any pair of airports. */
const ROUTE_META: Record<string, { durationMin: number; base: number; aircraft: string; miles: number }> = {
  'CGK-DPS': { durationMin: 110, base: 1549000, aircraft: 'Boeing 737-800', miles: 850 },
  'DPS-CGK': { durationMin: 115, base: 1489000, aircraft: 'Boeing 737-800', miles: 850 },
  'CGK-SUB': { durationMin: 85, base: 1215000, aircraft: 'Boeing 737-800', miles: 600 },
  'SUB-CGK': { durationMin: 90, base: 1198000, aircraft: 'Boeing 737-800', miles: 600 },
  'CGK-UPG': { durationMin: 140, base: 1890000, aircraft: 'Airbus A330-300', miles: 1050 },
  'UPG-CGK': { durationMin: 150, base: 1860000, aircraft: 'Airbus A330-300', miles: 1050 },
  'CGK-KNO': { durationMin: 135, base: 1720000, aircraft: 'Boeing 737-800', miles: 950 },
  'KNO-CGK': { durationMin: 130, base: 1690000, aircraft: 'Boeing 737-800', miles: 950 },
  'CGK-SIN': { durationMin: 110, base: 2870000, aircraft: 'Boeing 737-800', miles: 1100 },
  'SIN-CGK': { durationMin: 105, base: 2790000, aircraft: 'Boeing 737-800', miles: 1100 },
  'CGK-NRT': { durationMin: 435, base: 8940000, aircraft: 'Boeing 777-300ER', miles: 3600 },
  'NRT-CGK': { durationMin: 470, base: 8760000, aircraft: 'Boeing 777-300ER', miles: 3600 },
  'CGK-HND': { durationMin: 430, base: 9120000, aircraft: 'Airbus A330-900neo', miles: 3600 },
  'HND-CGK': { durationMin: 465, base: 8990000, aircraft: 'Airbus A330-900neo', miles: 3600 },
  'CGK-ICN': { durationMin: 415, base: 8450000, aircraft: 'Airbus A330-300', miles: 3300 },
  'ICN-CGK': { durationMin: 440, base: 8320000, aircraft: 'Airbus A330-300', miles: 3300 },
  'CGK-SYD': { durationMin: 415, base: 9860000, aircraft: 'Airbus A330-900neo', miles: 3400 },
  'SYD-CGK': { durationMin: 440, base: 9740000, aircraft: 'Airbus A330-900neo', miles: 3400 },
  'DPS-SIN': { durationMin: 160, base: 3120000, aircraft: 'Boeing 737-800', miles: 1050 },
  'SIN-DPS': { durationMin: 165, base: 3080000, aircraft: 'Boeing 737-800', miles: 1050 },
  'DPS-SYD': { durationMin: 365, base: 8240000, aircraft: 'Airbus A330-300', miles: 2900 },
  'SYD-DPS': { durationMin: 380, base: 8150000, aircraft: 'Airbus A330-300', miles: 2900 },
}

const DEPARTURES = ['06:15', '08:20', '12:45', '17:30']
const FLIGHT_NUMBER_BASE: Partial<Record<string, number[]>> = {
  'CGK-DPS': [400, 412, 420, 428],
  'DPS-CGK': [406, 418, 424, 434],
  'CGK-SIN': [824, 860, 832, 838],
  'CGK-HND': [874, 876, 878, 880],
}

const CABIN_MULTIPLIER: Record<CabinClass, number> = { economy: 1, business: 3.1, first: 5.2 }

function metaFor(origin: AirportCode, destination: AirportCode) {
  const key = `${origin}-${destination}`
  if (ROUTE_META[key]) return ROUTE_META[key]
  const seed = hashString(key)
  const isIntl = ['SIN', 'NRT', 'HND', 'ICN', 'SYD'].includes(origin) || ['SIN', 'NRT', 'HND', 'ICN', 'SYD'].includes(destination)
  return {
    durationMin: isIntl ? 300 + (seed % 200) : 90 + (seed % 90),
    base: isIntl ? 6500000 + (seed % 2500000) : 1300000 + (seed % 700000),
    aircraft: isIntl ? 'Airbus A330-300' : 'Boeing 737-800',
    miles: isIntl ? 2600 + (seed % 900) : 700 + (seed % 400),
  }
}

/** Returns a realistic set of Garuda flights for a route, cabin and date. */
export function getFlights(origin: AirportCode, destination: AirportCode, cabin: CabinClass, date: string): Flight[] {
  if (origin === destination) return []
  const meta = metaFor(origin, destination)
  const key = `${origin}-${destination}`
  const numbers = FLIGHT_NUMBER_BASE[key] ?? DEPARTURES.map((_, i) => 500 + ((hashString(key) + i * 7) % 380))
  const dateSeed = hashString(date) % 7

  return DEPARTURES.map((dep, i) => {
    const offsets = [-75000, 0, -145000, 60000]
    const variance = i === 1 ? 0 : ((hashString(key + dep + date) % 5) - 2) * 15000
    const saver = Math.round((meta.base * CABIN_MULTIPLIER[cabin] + offsets[i] + variance) / 1000) * 1000
    const value = saver + Math.round(saver * 0.16 / 1000) * 1000
    const flex = saver + Math.round(saver * 0.38 / 1000) * 1000
    const tags: Flight['tags'] = []
    if (i === 1) tags.push('best-value')
    if (i === 0) tags.push('earliest')
    if (i === 2) tags.push('lowest-fare')
    return {
      id: `${key}-${numbers[i]}-${date}`,
      number: `GA ${numbers[i]}`,
      origin,
      destination,
      departTime: dep,
      arriveTime: addMinutes(dep, meta.durationMin + (i === 3 ? 10 : 0)),
      durationMin: meta.durationMin + (i === 3 ? 10 : 0),
      aircraft: i === 3 && meta.aircraft === 'Boeing 737-800' ? 'Airbus A330-300' : meta.aircraft,
      terminal: 'Terminal 3',
      arrivalTerminal: destination === 'DPS' ? 'Domestic Terminal' : destination === 'SIN' ? 'Terminal 3' : 'International Terminal',
      stops: 0,
      prices: { saver, value, flex },
      milesEarn: meta.miles,
      seatsLeft: i === 1 ? 6 : i === 3 ? 4 + dateSeed : undefined,
      tags,
    }
  })
}

export function findFlight(id: string): Flight | undefined {
  const parts = id.split('-')
  if (parts.length < 4) return undefined
  const [origin, destination] = parts as [AirportCode, AirportCode, ...string[]]
  const date = parts.slice(3).join('-')
  const cabins: CabinClass[] = ['economy', 'business', 'first']
  for (const cabin of cabins) {
    const hit = getFlights(origin, destination, cabin, date).find((f) => f.id === id)
    if (hit) return hit
  }
  return undefined
}

/** The Garuda Value Card — what every Garuda fare includes (demo values). */
export const VALUE_ITEMS: ValueItem[] = [
  { key: 'baggage', title: 'Checked Baggage', short: 'Baggage', description: '20 kg included on eligible fares', status: 'Included', icon: Luggage },
  { key: 'meal', title: 'Meal & Beverage', short: 'Meal', description: 'Complimentary meal service on board', status: 'Included', icon: UtensilsCrossed },
  { key: 'entertainment', title: 'Entertainment', short: 'Entertainment', description: 'In-flight entertainment access where available', status: 'Included', icon: MonitorPlay },
  { key: 'miles', title: 'GarudaMiles', short: 'Miles', description: 'Earn miles on eligible fares', status: 'Earned', icon: Award },
  { key: 'flexible', title: 'Flexible Journey', short: 'Flexibility', description: 'Selected fares include flexible options', status: 'Selected fares', icon: RefreshCw },
  { key: 'hospitality', title: 'Indonesian Hospitality', short: 'Hospitality', description: 'Full-service cabin experience', status: 'Included', icon: Heart },
]

export const FARE_FAMILIES: FareFamily[] = [
  {
    id: 'saver',
    name: 'Economy Saver',
    tagline: 'Full-service essentials at the lowest fare',
    milesMultiplier: 'Standard miles',
    features: [
      { label: 'Cabin baggage', value: '7 kg', included: true },
      { label: 'Checked baggage', value: '20 kg', included: true },
      { label: 'Meal & beverage', value: 'Included', included: true },
      { label: 'GarudaMiles earning', value: 'Standard', included: true },
      { label: 'Seat selection', value: 'Standard seat', included: true },
      { label: 'Changes', value: 'Change fee applies', included: false },
      { label: 'Refund', value: 'Not refundable', included: false },
    ],
  },
  {
    id: 'value',
    name: 'Economy Value',
    tagline: 'More flexibility and more miles',
    milesMultiplier: 'More miles',
    features: [
      { label: 'Cabin baggage', value: '7 kg', included: true },
      { label: 'Checked baggage', value: '20 kg', included: true },
      { label: 'Meal & beverage', value: 'Included', included: true },
      { label: 'GarudaMiles earning', value: 'More miles', included: true },
      { label: 'Seat selection', value: 'Free standard seat', included: true },
      { label: 'Changes', value: 'Reduced change fee', included: true },
      { label: 'Refund', value: 'Partial refund', included: true },
    ],
  },
  {
    id: 'flex',
    name: 'Economy Flex',
    tagline: 'Highest flexibility and preferred seating',
    milesMultiplier: 'Highest miles',
    features: [
      { label: 'Cabin baggage', value: '7 kg', included: true },
      { label: 'Checked baggage', value: '20 kg', included: true },
      { label: 'Meal & beverage', value: 'Included', included: true },
      { label: 'GarudaMiles earning', value: 'Highest', included: true },
      { label: 'Seat selection', value: 'Preferred seating', included: true },
      { label: 'Changes', value: 'Free changes', included: true },
      { label: 'Refund', value: 'Flexible refund', included: true },
    ],
  },
]

export const ADD_ONS = [
  { id: 'baggage10', label: 'Extra baggage +10 kg', description: 'Add 10 kg to your checked allowance', price: 275000 },
  { id: 'priority', label: 'Priority boarding', description: 'Board early and settle in first', price: 95000 },
  { id: 'insurance', label: 'Travel protection', description: 'Coverage for delays, baggage and medical', price: 68000 },
  { id: 'lounge', label: 'Lounge access', description: 'Garuda Indonesia Lounge, Terminal 3', price: 250000 },
]

/** Neutral comparison: what a typical basic fare includes vs a Garuda fare. */
export const COMPARE_ROWS = [
  { label: 'Checked baggage', basic: 'Usually extra', garuda: '20 kg included' },
  { label: 'Meal & beverage', basic: 'Purchase on board', garuda: 'Complimentary' },
  { label: 'Seat selection', basic: 'Paid', garuda: 'Standard seat included' },
  { label: 'Entertainment', basic: 'Not available', garuda: 'Included where available' },
  { label: 'Loyalty miles', basic: 'Limited', garuda: 'GarudaMiles earned' },
  { label: 'Airport lounge', basic: 'Not included', garuda: 'Available on Business / tier' },
  { label: 'Cabin service', basic: 'Basic', garuda: 'Full-service hospitality' },
]

export const SEAT_ICON = Armchair
