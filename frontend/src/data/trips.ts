import type { JourneyStage, Trip } from '../types'

export const SEED_TRIPS: Trip[] = [
  {
    id: 'trip-ga412',
    bookingCode: 'RW9K2A',
    flightNumber: 'GA 412',
    origin: 'CGK',
    destination: 'DPS',
    date: '2026-09-19',
    departTime: '08:20',
    arriveTime: '10:10',
    boardingTime: '07:50',
    terminal: 'Terminal 3',
    arrivalTerminal: 'Domestic Terminal',
    gate: '12',
    seat: null,
    zone: '3',
    sequence: '042',
    aircraft: 'Boeing 737-800',
    cabin: 'economy',
    fare: 'value',
    status: 'on-time',
    stage: 'checkin',
    category: 'upcoming',
    checkedIn: false,
    checkInOpen: true,
    passengerName: 'Raka Wijaya',
    baggageChecked: '20 kg',
    baggageCabin: '7 kg',
    meal: 'Standard meal',
    milesEstimate: 850,
    belt: '4',
    totalPaid: 1797000,
  },
  {
    id: 'trip-ga860',
    bookingCode: 'TQ4M7D',
    flightNumber: 'GA 860',
    origin: 'CGK',
    destination: 'SIN',
    date: '2026-10-03',
    departTime: '07:40',
    arriveTime: '10:30',
    boardingTime: '07:05',
    terminal: 'Terminal 3',
    arrivalTerminal: 'Terminal 3',
    gate: 'TBA',
    seat: '21C',
    zone: '3',
    sequence: '018',
    aircraft: 'Boeing 737-800',
    cabin: 'economy',
    fare: 'flex',
    status: 'scheduled',
    stage: 'booked',
    category: 'upcoming',
    checkedIn: false,
    checkInOpen: false,
    passengerName: 'Raka Wijaya',
    baggageChecked: '20 kg',
    baggageCabin: '7 kg',
    meal: 'Standard meal',
    milesEstimate: 1100,
    totalPaid: 3961000,
  },
  {
    id: 'trip-ga418',
    bookingCode: 'HL2X9P',
    flightNumber: 'GA 418',
    origin: 'DPS',
    destination: 'CGK',
    date: '2026-08-18',
    departTime: '15:30',
    arriveTime: '17:25',
    boardingTime: '15:00',
    terminal: 'Domestic Terminal',
    arrivalTerminal: 'Terminal 3',
    gate: '5',
    seat: '14F',
    zone: '2',
    sequence: '077',
    aircraft: 'Boeing 737-800',
    cabin: 'economy',
    fare: 'saver',
    status: 'completed',
    stage: 'arrival',
    category: 'past',
    checkedIn: true,
    checkInOpen: false,
    passengerName: 'Raka Wijaya',
    baggageChecked: '20 kg',
    baggageCabin: '7 kg',
    meal: 'Standard meal',
    milesEstimate: 850,
    belt: '7',
    totalPaid: 1489000,
  },
  {
    id: 'trip-ga874',
    bookingCode: 'ZC7N4R',
    flightNumber: 'GA 874',
    origin: 'CGK',
    destination: 'HND',
    date: '2026-06-11',
    departTime: '23:30',
    arriveTime: '08:40',
    boardingTime: '22:50',
    terminal: 'Terminal 3',
    arrivalTerminal: 'Terminal 3',
    gate: '22',
    seat: '31A',
    zone: '3',
    sequence: '154',
    aircraft: 'Airbus A330-900neo',
    cabin: 'economy',
    fare: 'value',
    status: 'completed',
    stage: 'arrival',
    category: 'past',
    checkedIn: true,
    checkInOpen: false,
    passengerName: 'Raka Wijaya',
    baggageChecked: '23 kg',
    baggageCabin: '7 kg',
    meal: 'Japanese set meal',
    milesEstimate: 3600,
    belt: '12',
    totalPaid: 9120000,
  },
  {
    id: 'trip-ga654',
    bookingCode: 'PM8V3K',
    flightNumber: 'GA 654',
    origin: 'CGK',
    destination: 'UPG',
    date: '2026-07-24',
    departTime: '09:10',
    arriveTime: '12:30',
    boardingTime: '08:35',
    terminal: 'Terminal 3',
    arrivalTerminal: 'Domestic Terminal',
    gate: '9',
    seat: null,
    zone: '3',
    sequence: '000',
    aircraft: 'Airbus A330-300',
    cabin: 'economy',
    fare: 'flex',
    status: 'cancelled',
    stage: 'booked',
    category: 'cancelled',
    checkedIn: false,
    checkInOpen: false,
    passengerName: 'Raka Wijaya',
    baggageChecked: '20 kg',
    baggageCabin: '7 kg',
    meal: 'Standard meal',
    milesEstimate: 0,
    totalPaid: 2608000,
  },
]

export const STAGES: { id: JourneyStage; label: string; short: string }[] = [
  { id: 'booked', label: 'Booking Confirmed', short: 'Booked' },
  { id: 'checkin', label: 'Check-in', short: 'Check-in' },
  { id: 'airport', label: 'Airport', short: 'Airport' },
  { id: 'boarding', label: 'Boarding', short: 'Boarding' },
  { id: 'inflight', label: 'In Flight', short: 'In Flight' },
  { id: 'arrival', label: 'Arrival', short: 'Arrival' },
]

export function stageIndex(stage: JourneyStage): number {
  return STAGES.findIndex((s) => s.id === stage)
}

/** Human summary of what the traveller should do next, per stage. */
export function nextActionFor(trip: Trip): { title: string; description: string; cta?: { label: string; to: string } } {
  const disrupted = trip.disruption
  switch (trip.stage) {
    case 'booked':
      return trip.checkInOpen
        ? {
            title: 'Online check-in is now available',
            description: 'Confirm your details and choose a seat in under a minute.',
            cta: { label: 'Check In', to: `/checkin/${trip.id}` },
          }
        : {
            title: 'Check-in opens 24 hours before departure',
            description: 'We will remind you the moment online check-in opens.',
          }
    case 'checkin':
      return trip.checkedIn
        ? {
            title: 'You are checked in',
            description: `Boarding pass ready. Recommended airport arrival ${disrupted ? '06:50' : '06:15'}.`,
            cta: { label: 'Boarding Pass', to: `/boarding-pass/${trip.id}` },
          }
        : {
            title: 'Online check-in is now available',
            description: 'Confirm your details and choose a seat in under a minute.',
            cta: { label: 'Check In', to: `/checkin/${trip.id}` },
          }
    case 'airport':
      return {
        title: 'Head to the airport',
        description: `Recommended arrival ${disrupted ? '06:50' : '06:15'} · ${trip.terminal} · Estimated travel time 52 min.`,
        cta: { label: 'Boarding Pass', to: `/boarding-pass/${trip.id}` },
      }
    case 'boarding':
      return {
        title: `Boarding at Gate ${trip.gate}`,
        description: `Boarding ${disrupted ? disrupted.newBoardingTime : trip.boardingTime} · Zone ${trip.zone} · About 8 min walk from security.`,
        cta: { label: 'Boarding Pass', to: `/boarding-pass/${trip.id}` },
      }
    case 'inflight':
      return {
        title: 'Enjoy your flight',
        description: `Arriving ${trip.arriveTime} local time. Baggage on belt ${trip.belt ?? 'TBA'}.`,
      }
    case 'arrival':
      return {
        title: `Welcome to ${trip.destination === 'DPS' ? 'Bali' : 'your destination'}`,
        description: `Baggage on belt ${trip.belt ?? 'TBA'}. Miles will be credited within 72 hours.`,
        cta: { label: 'View Trip', to: `/trips/${trip.id}` },
      }
  }
}
