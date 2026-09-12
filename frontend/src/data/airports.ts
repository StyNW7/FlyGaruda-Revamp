import type { Airport, AirportCode } from '../types'

export const AIRPORTS: Airport[] = [
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta International', country: 'Indonesia', region: 'domestic' },
  { code: 'DPS', city: 'Denpasar', name: 'I Gusti Ngurah Rai International', country: 'Indonesia', region: 'domestic' },
  { code: 'SUB', city: 'Surabaya', name: 'Juanda International', country: 'Indonesia', region: 'domestic' },
  { code: 'UPG', city: 'Makassar', name: 'Sultan Hasanuddin International', country: 'Indonesia', region: 'domestic' },
  { code: 'KNO', city: 'Medan', name: 'Kualanamu International', country: 'Indonesia', region: 'domestic' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore', region: 'international' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International', country: 'Japan', region: 'international' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan', region: 'international' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International', country: 'South Korea', region: 'international' },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia', region: 'international' },
]

const byCode = new Map(AIRPORTS.map((a) => [a.code, a]))

export function getAirport(code: AirportCode): Airport {
  return byCode.get(code) ?? AIRPORTS[0]
}

export function cityOf(code: AirportCode): string {
  return getAirport(code).city
}

/** Popular destinations for quick selection in the airport sheet. */
export const POPULAR_CODES: AirportCode[] = ['DPS', 'SIN', 'SUB', 'HND', 'UPG', 'SYD']
