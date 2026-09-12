import type { Trip } from '../types'
import { getAirport } from '../data/airports'
import { downloadText } from './share'

/** UTC offset (hours) of the departure airport, used so calendar events land at the right local time. */
const OFFSETS: Record<string, number> = { CGK: 7, SUB: 7, KNO: 7, DPS: 8, UPG: 8, SIN: 8, HND: 9, NRT: 9, ICN: 9, SYD: 10 }

function toUtcStamp(dateISO: string, time: string, offsetHours: number): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d, hh - offsetHours, mm))
  const p = (n: number) => String(n).padStart(2, '0')
  return `${utc.getUTCFullYear()}${p(utc.getUTCMonth() + 1)}${p(utc.getUTCDate())}T${p(utc.getUTCHours())}${p(utc.getUTCMinutes())}00Z`
}

function escapeText(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Builds an RFC 5545 calendar file for a trip (works with Google, Apple and Outlook calendars). */
export function buildTripICS(trip: Trip): string {
  const origin = getAirport(trip.origin)
  const destination = getAirport(trip.destination)
  const dep = trip.disruption ? trip.disruption.newDepartTime : trip.departTime
  const arr = trip.disruption ? trip.disruption.newArriveTime : trip.arriveTime
  const overnight = arr < dep
  const arrDate = overnight ? addDaysISO(trip.date, 1) : trip.date
  const start = toUtcStamp(trip.date, dep, OFFSETS[trip.origin] ?? 7)
  const end = toUtcStamp(arrDate, arr, OFFSETS[trip.destination] ?? 7)
  const now = toUtcStamp(new Date().toISOString().slice(0, 10), new Date().toISOString().slice(11, 16), 0)
  const description = [
    `Garuda Indonesia ${trip.flightNumber}`,
    `${origin.city} (${trip.origin}) → ${destination.city} (${trip.destination})`,
    `Booking code ${trip.bookingCode}`,
    `Boarding ${trip.disruption ? trip.disruption.newBoardingTime : trip.boardingTime} · Gate ${trip.gate} · ${trip.terminal}`,
    trip.seat ? `Seat ${trip.seat}` : 'Seat: select at check-in',
    'Managed in FlyGaruda',
  ].join('\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FlyGaruda//Trip//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${trip.bookingCode}-${trip.flightNumber.replace(' ', '')}@flygaruda.app`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(`✈ ${trip.flightNumber} ${trip.origin} → ${trip.destination}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(`${origin.name}, ${trip.terminal}`)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT3H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(`Leave for ${trip.terminal} · ${trip.flightNumber} boards at ${trip.boardingTime}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadTripICS(trip: Trip) {
  downloadText(buildTripICS(trip), `${trip.flightNumber.replace(' ', '')}-${trip.date}.ics`, 'text/calendar')
}

function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Plain-text itinerary suitable for the share sheet, WhatsApp or the clipboard. */
export function itineraryText(trip: Trip): string {
  const origin = getAirport(trip.origin)
  const destination = getAirport(trip.destination)
  const dep = trip.disruption ? trip.disruption.newDepartTime : trip.departTime
  const arr = trip.disruption ? trip.disruption.newArriveTime : trip.arriveTime
  return [
    `Garuda Indonesia ${trip.flightNumber}`,
    `${origin.city} (${trip.origin}) ${dep} → ${destination.city} (${trip.destination}) ${arr}`,
    `${trip.date} · ${trip.terminal} · Gate ${trip.gate}${trip.seat ? ` · Seat ${trip.seat}` : ''}`,
    `Booking code: ${trip.bookingCode}`,
  ].join('\n')
}
