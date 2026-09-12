import type { AirportCode } from '../types'
import { AIRPORT_COORDS } from '../data/miles'

/** Great-circle distance in km between two airports. */
export function distanceKm(a: AirportCode, b: AirportCode): number {
  const p = AIRPORT_COORDS[a]
  const q = AIRPORT_COORDS[b]
  if (!p || !q) return 0
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(q.lat - p.lat)
  const dLon = toRad(q.lon - p.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(p.lat)) * Math.cos(toRad(q.lat)) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)))
}

export interface Bounds {
  lonMin: number
  lonMax: number
  latMin: number
  latMax: number
}

/** Default bounding box covering the whole Garuda network in this prototype. */
export const MAP_BOUNDS: Bounds = { lonMin: 94, lonMax: 156, latMin: -40, latMax: 44 }

/** Bounds that fit the given airports, padded and with a sensible minimum span so short routes still read. */
export function boundsFor(codes: AirportCode[], minSpanLon = 22, minSpanLat = 16): Bounds {
  const pts = codes.map((c) => AIRPORT_COORDS[c]).filter(Boolean)
  if (pts.length === 0) return MAP_BOUNDS
  let lonMin = Math.min(...pts.map((p) => p.lon))
  let lonMax = Math.max(...pts.map((p) => p.lon))
  let latMin = Math.min(...pts.map((p) => p.lat))
  let latMax = Math.max(...pts.map((p) => p.lat))
  const padLon = Math.max(3, (lonMax - lonMin) * 0.18)
  const padLat = Math.max(3, (latMax - latMin) * 0.2)
  lonMin -= padLon
  lonMax += padLon
  latMin -= padLat
  latMax += padLat
  if (lonMax - lonMin < minSpanLon) {
    const mid = (lonMin + lonMax) / 2
    lonMin = mid - minSpanLon / 2
    lonMax = mid + minSpanLon / 2
  }
  if (latMax - latMin < minSpanLat) {
    const mid = (latMin + latMax) / 2
    latMin = mid - minSpanLat / 2
    latMax = mid + minSpanLat / 2
  }
  return { lonMin, lonMax, latMin, latMax }
}

/** Projects lat/lon into a box of the given size (simple equirectangular, good enough for the region). */
export function project(code: AirportCode, width: number, height: number, pad = 0, bounds: Bounds = MAP_BOUNDS): { x: number; y: number } {
  const c = AIRPORT_COORDS[code]
  const { lonMin, lonMax, latMin, latMax } = bounds
  const x = pad + ((c.lon - lonMin) / (lonMax - lonMin)) * (width - pad * 2)
  const y = pad + ((latMax - c.lat) / (latMax - latMin)) * (height - pad * 2)
  return { x, y }
}

/** Control point for a gently curved flight arc between two projected points. */
export function arcControl(a: { x: number; y: number }, b: { x: number; y: number }, lift = 0.22): { x: number; y: number } {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  // Perpendicular offset, always bowing "upwards" on screen.
  const nx = -dy / len
  const ny = dx / len
  const sign = ny < 0 ? 1 : -1
  return { x: mx + nx * len * lift * sign, y: my + ny * len * lift * sign }
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

function intersects(a: Rect, b: Rect, margin = 0) {
  return a.x < b.x + b.w + margin && a.x + a.w + margin > b.x && a.y < b.y + b.h + margin && a.y + a.h + margin > b.y
}

/**
 * Greedy label placement for a set of points: tries right, left, below, above (and diagonals)
 * and returns the first slot that does not collide with other labels or points.
 */
export function placeLabels(
  points: { id: string; x: number; y: number; w: number; h: number }[],
  opts: { gap: number; pointRadius: number; bounds: Rect },
): Record<string, { x: number; y: number; align: 'left' | 'right' | 'center' }> {
  const placed: Rect[] = points.map((p) => ({ x: p.x - opts.pointRadius, y: p.y - opts.pointRadius, w: opts.pointRadius * 2, h: opts.pointRadius * 2 }))
  const out: Record<string, { x: number; y: number; align: 'left' | 'right' | 'center' }> = {}
  const g = opts.gap
  for (const p of points) {
    const candidates: { rect: Rect; align: 'left' | 'right' | 'center' }[] = [
      { rect: { x: p.x + g, y: p.y - p.h / 2, w: p.w, h: p.h }, align: 'left' },
      { rect: { x: p.x - g - p.w, y: p.y - p.h / 2, w: p.w, h: p.h }, align: 'right' },
      { rect: { x: p.x - p.w / 2, y: p.y + g, w: p.w, h: p.h }, align: 'center' },
      { rect: { x: p.x - p.w / 2, y: p.y - g - p.h, w: p.w, h: p.h }, align: 'center' },
      { rect: { x: p.x + g * 0.7, y: p.y + g * 0.7, w: p.w, h: p.h }, align: 'left' },
      { rect: { x: p.x - g * 0.7 - p.w, y: p.y - g * 0.7 - p.h, w: p.w, h: p.h }, align: 'right' },
      { rect: { x: p.x + g * 0.7, y: p.y - g * 0.7 - p.h, w: p.w, h: p.h }, align: 'left' },
      { rect: { x: p.x - g * 0.7 - p.w, y: p.y + g * 0.7, w: p.w, h: p.h }, align: 'right' },
    ]
    const inside = (r: Rect) => r.x >= opts.bounds.x && r.y >= opts.bounds.y && r.x + r.w <= opts.bounds.x + opts.bounds.w && r.y + r.h <= opts.bounds.y + opts.bounds.h
    const pick = candidates.find((c) => inside(c.rect) && !placed.some((r) => intersects(c.rect, r, 2))) ?? candidates[0]
    placed.push(pick.rect)
    out[p.id] = { x: pick.align === 'left' ? pick.rect.x : pick.align === 'right' ? pick.rect.x + pick.rect.w : pick.rect.x + pick.rect.w / 2, y: pick.rect.y + pick.rect.h / 2, align: pick.align }
  }
  return out
}
