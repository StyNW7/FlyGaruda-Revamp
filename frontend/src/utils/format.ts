const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3))
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = DAYS.map((d) => d.slice(0, 3))

export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('en-US')
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/** Parses 'YYYY-MM-DD' into a local Date at 00:00. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 'Saturday, 19 September 2026' */
export function formatLongDate(iso: string): string {
  const d = parseISODate(iso)
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** 'Sat, 19 Sep 2026' */
export function formatMediumDate(iso: string): string {
  const d = parseISODate(iso)
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/** '19 Sep 2026' */
export function formatShortDate(iso: string): string {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/** '19 Sep' */
export function formatDayMonth(iso: string): string {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

/** 'Sat 19' */
export function formatDayNum(iso: string): string {
  const d = parseISODate(iso)
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()}`
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function monthLabel(year: number, monthIndex: number): string {
  return `${MONTHS[monthIndex]} ${year}`
}

export function dayShort(dayIndex: number): string {
  return DAYS_SHORT[dayIndex]
}

/** Adds minutes to 'HH:MM' and returns 'HH:MM'. */
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = (h * 60 + m + minutes + 24 * 60) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function greetingForHour(hour: number): string {
  if (hour < 4) return 'Good evening'
  if (hour < 11) return 'Good morning'
  if (hour < 15) return 'Good afternoon'
  return 'Good evening'
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

/** Deterministic small hash used for pseudo-random visuals (QR pattern, seat availability). */
export function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function generateBookingCode(seed: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let h = hashString(seed)
  let out = ''
  for (let i = 0; i < 6; i++) {
    out += alphabet[h % alphabet.length]
    h = Math.floor(h / alphabet.length) + hashString(seed + i)
  }
  return out
}
