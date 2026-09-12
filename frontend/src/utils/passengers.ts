import type { CabinClass, Passengers } from '../types'

export const CABIN_LABELS: Record<CabinClass, string> = { economy: 'Economy', business: 'Business', first: 'First' }

export function passengerLabel(p: Passengers, cabin: CabinClass): string {
  const parts = [`${p.adults} Adult${p.adults > 1 ? 's' : ''}`]
  if (p.children) parts.push(`${p.children} Child${p.children > 1 ? 'ren' : ''}`)
  if (p.infants) parts.push(`${p.infants} Infant${p.infants > 1 ? 's' : ''}`)
  return `${parts.join(', ')} · ${CABIN_LABELS[cabin]}`
}
