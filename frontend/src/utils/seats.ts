import { hashString } from './format'

export function seatType(seat: string): string {
  const letter = seat.slice(-1)
  if (letter === 'A' || letter === 'F') return 'Window'
  if (letter === 'C' || letter === 'D') return 'Aisle'
  return 'Middle'
}

/** Deterministic occupancy so the same seats stay unavailable across renders. */
export function isUnavailable(seat: string, seed = 'GA412'): boolean {
  if (seat === '18A') return false
  return hashString(seed + seat) % 100 < 38
}
