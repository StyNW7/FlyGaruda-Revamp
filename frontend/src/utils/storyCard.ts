import type { AirportCode, Trip } from '../types'
import type { ShareTheme } from '../store/AppContext'
import { getAirport } from '../data/airports'
import { arcControl, boundsFor, placeLabels, project } from './geo'
import { formatNumber, hashString } from './format'

/* ------------------------------------------------------------------ */
/* Canvas helpers                                                      */
/* ------------------------------------------------------------------ */

export const STORY_W = 1080
export const STORY_H = 1920

const FONT = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string }

const imageCache = new Map<string, Promise<HTMLImageElement | null>>()

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
      }),
    )
  }
  return imageCache.get(src)!
}

async function ensureFonts() {
  try {
    await Promise.all([400, 600, 700, 800].map((w) => document.fonts.load(`${w} 40px "Plus Jakarta Sans"`)))
  } catch {
    /* system font fallback */
  }
}

function font(ctx: Ctx, size: number, weight: number | string = 600, spacing = 0) {
  ctx.font = `${weight} ${size}px ${FONT}`
  ctx.letterSpacing = `${spacing}px`
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

function fillRR(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lineWidth = 2) {
  rr(ctx, x, y, w, h, r)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

function glow(ctx: Ctx, x: number, y: number, radius: number, color: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
}

function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function pill(ctx: Ctx, x: number, y: number, text: string, opts: { fill: string; stroke?: string; color: string; size?: number; padX?: number; height?: number; weight?: number; spacing?: number }) {
  const size = opts.size ?? 24
  const padX = opts.padX ?? 26
  const h = opts.height ?? 56
  font(ctx, size, opts.weight ?? 700, opts.spacing ?? 0)
  const w = ctx.measureText(text).width + padX * 2
  fillRR(ctx, x, y, w, h, h / 2, opts.fill, opts.stroke)
  ctx.fillStyle = opts.color
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(text, x + padX, y + h / 2 + 1)
  return w
}

const THEMES: Record<ShareTheme, { stops: [string, string, string]; accent: string; accentSoft: string; glowA: string; glowB: string; label: string }> = {
  navy: { stops: ['#123579', '#0C265D', '#081C48'], accent: '#3FC5CF', accentSoft: 'rgba(63,197,207,0.18)', glowA: 'rgba(0,130,149,0.45)', glowB: 'rgba(201,162,75,0.25)', label: 'Midnight Navy' },
  turquoise: { stops: ['#0A8C9E', '#046E80', '#0C3D5E'], accent: '#FFFFFF', accentSoft: 'rgba(255,255,255,0.18)', glowA: 'rgba(255,255,255,0.28)', glowB: 'rgba(12,38,93,0.55)', label: 'Ocean Turquoise' },
  gold: { stops: ['#8A6A1F', '#5C4413', '#2A2110'], accent: '#F1D98A', accentSoft: 'rgba(241,217,138,0.2)', glowA: 'rgba(201,162,75,0.5)', glowB: 'rgba(255,255,255,0.12)', label: 'Heritage Gold' },
}

export const SHARE_THEMES = (Object.keys(THEMES) as ShareTheme[]).map((id) => ({ id, label: THEMES[id].label, stops: THEMES[id].stops }))

function background(ctx: Ctx, theme: ShareTheme) {
  const t = THEMES[theme]
  const g = ctx.createLinearGradient(0, 0, STORY_W, STORY_H)
  g.addColorStop(0, t.stops[0])
  g.addColorStop(0.55, t.stops[1])
  g.addColorStop(1, t.stops[2])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, STORY_W, STORY_H)

  // Soft ambient light
  glow(ctx, 960, 380, 520, t.glowA)
  glow(ctx, 120, 1640, 560, t.glowB)

  // Large translucent rings
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 2
  for (const r of [420, 560, 700]) {
    ctx.beginPath()
    ctx.arc(1010, 160, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Dashed flight path across the page
  ctx.save()
  ctx.setLineDash([10, 18])
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-40, 1180)
  ctx.bezierCurveTo(260, 900, 720, 900, 1120, 620)
  ctx.stroke()
  ctx.restore()

  // Subtle dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  for (let y = 120; y < STORY_H; y += 56) {
    for (let x = 60; x < STORY_W; x += 56) {
      ctx.beginPath()
      ctx.arc(x, y, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

async function header(ctx: Ctx, rightLabel: string, theme: ShareTheme) {
  const logo = await loadImage('/brand/wordmark-white.png')
  if (logo) {
    const h = 54
    const w = (logo.width / logo.height) * h
    ctx.drawImage(logo, 80, 92, w, h)
  } else {
    font(ctx, 36, 800)
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('Garuda Indonesia', 80, 135)
  }
  font(ctx, 20, 700, 3)
  const w = ctx.measureText(rightLabel.toUpperCase()).width + 48
  pill(ctx, STORY_W - 80 - w, 92, rightLabel.toUpperCase(), { fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.22)', color: THEMES[theme].accent, size: 20, padX: 24, height: 54, spacing: 3 })
}

function footer(ctx: Ctx, left: string, right: string) {
  ctx.textBaseline = 'middle'
  font(ctx, 24, 600, 1)
  ctx.fillStyle = 'rgba(255,255,255,0.62)'
  ctx.textAlign = 'left'
  ctx.fillText(left, 80, STORY_H - 84)
  ctx.textAlign = 'right'
  ctx.fillText(right, STORY_W - 80, STORY_H - 84)
  ctx.textAlign = 'left'
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render image'))), 'image/png'))
}

function makeCanvas(): { canvas: HTMLCanvasElement; ctx: Ctx } {
  const canvas = document.createElement('canvas')
  canvas.width = STORY_W
  canvas.height = STORY_H
  const ctx = canvas.getContext('2d') as Ctx
  return { canvas, ctx }
}

/* ------------------------------------------------------------------ */
/* Garuda Passport · Instagram story (1080 × 1920)                      */
/* ------------------------------------------------------------------ */

export interface PassportCardData {
  name: string
  tier: string
  milesId: string
  memberSince: string
  stats: { flights: number; destinations: number; distanceKm: number; miles: number }
  stamps: { code: string; city: string; firstVisit: string }[]
  routes: { from: AirportCode; to: AirportCode }[]
  visited: AirportCode[]
  badges: string[]
  theme: ShareTheme
  headline?: string
}

function drawRouteMap(ctx: Ctx, x: number, y: number, w: number, h: number, data: PassportCardData) {
  const t = THEMES[data.theme]
  fillRR(ctx, x, y, w, h, 36, 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0.14)')
  ctx.save()
  rr(ctx, x, y, w, h, 36)
  ctx.clip()

  // Latitude / longitude guide lines
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1.5
  for (let i = 1; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(x, y + (h / 6) * i)
    ctx.lineTo(x + w, y + (h / 6) * i)
    ctx.stroke()
  }
  for (let i = 1; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(x + (w / 8) * i, y)
    ctx.lineTo(x + (w / 8) * i, y + h)
    ctx.stroke()
  }

  const pad = 90
  const bounds = boundsFor(data.visited)
  const pt = (code: AirportCode) => {
    const p = project(code, w, h, pad, bounds)
    return { x: x + p.x, y: y + p.y }
  }

  // Arcs
  for (const r of data.routes) {
    const a = pt(r.from)
    const b = pt(r.to)
    const c = arcControl(a, b)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.quadraticCurveTo(c.x, c.y, b.x, b.y)
    ctx.strokeStyle = t.accentSoft
    ctx.lineWidth = 14
    ctx.stroke()
    ctx.strokeStyle = t.accent
    ctx.lineWidth = 4
    ctx.stroke()
  }

  // Points + collision-free labels
  ctx.textBaseline = 'middle'
  font(ctx, 22, 800, 1)
  const labels = placeLabels(
    data.visited.map((code) => {
      const p = pt(code)
      return { id: code, x: p.x, y: p.y, w: ctx.measureText(code).width, h: 24 }
    }),
    { gap: 24, pointRadius: 16, bounds: { x: x + 16, y: y + 70, w: w - 32, h: h - 86 } },
  )
  for (const code of data.visited) {
    const p = pt(code)
    ctx.beginPath()
    ctx.arc(p.x, p.y, 16, 0, Math.PI * 2)
    ctx.fillStyle = t.accentSoft
    ctx.fill()
    ctx.beginPath()
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    const l = labels[code]
    font(ctx, 22, 800, 1)
    ctx.fillStyle = '#fff'
    ctx.textAlign = l.align
    ctx.fillText(code, l.x, l.y)
  }
  ctx.textAlign = 'left'

  font(ctx, 20, 700, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('ROUTES FLOWN WITH GARUDA', x + 36, y + 42)
  ctx.restore()
}

function drawStamp(ctx: Ctx, cx: number, cy: number, d: number, stamp: { code: string; firstVisit: string }, rotation: number, accent: string) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.beginPath()
  ctx.arc(0, 0, d / 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fill()
  ctx.strokeStyle = accent
  ctx.lineWidth = 6
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, d / 2 - 14, 0, Math.PI * 2)
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 6])
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = accent
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  font(ctx, 14, 700, 3)
  ctx.fillText('GARUDA', 0, -d * 0.22)
  font(ctx, d * 0.3, 800, 1)
  ctx.fillText(stamp.code, 0, 2)
  font(ctx, 13, 700, 2)
  ctx.fillText(stamp.firstVisit.toUpperCase(), 0, d * 0.24)
  ctx.restore()
  ctx.textAlign = 'left'
}

export async function renderPassportStory(data: PassportCardData): Promise<Blob> {
  await ensureFonts()
  const { canvas, ctx } = makeCanvas()
  const t = THEMES[data.theme]
  background(ctx, data.theme)
  await header(ctx, 'Garuda Flight Passport', data.theme)

  // Eyebrow + headline
  ctx.textBaseline = 'alphabetic'
  font(ctx, 26, 700, 5)
  ctx.fillStyle = t.accent
  ctx.fillText(`MY GARUDA PASSPORT · ${new Date().getFullYear()}`, 80, 292)

  font(ctx, 92, 800, -2)
  ctx.fillStyle = '#fff'
  const headline = data.headline ?? `${data.stats.destinations} destinations, ${formatNumber(data.stats.distanceKm)} km flown.`
  const lines = wrap(ctx, headline, 920).slice(0, 3)
  lines.forEach((l, i) => ctx.fillText(l, 80, 400 + i * 104))
  let y = 400 + lines.length * 104 - 40

  // Member line
  font(ctx, 40, 800)
  ctx.fillStyle = '#fff'
  ctx.fillText(data.name, 80, y + 36)
  const nameW = ctx.measureText(data.name).width
  pill(ctx, 80 + nameW + 22, y - 2, `GarudaMiles ${data.tier}`, { fill: 'rgba(255,255,255,0.1)', stroke: 'rgba(255,255,255,0.22)', color: '#fff', size: 22, padX: 22, height: 50 })
  font(ctx, 24, 600, 1)
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText(`${data.milesId} · Member since ${data.memberSince}`, 80, y + 82)
  y += 130

  // Stats tiles
  const tiles = [
    { label: 'Flights', value: String(data.stats.flights) },
    { label: 'Destinations', value: String(data.stats.destinations) },
    { label: 'Distance', value: `${formatNumber(data.stats.distanceKm)} km` },
    { label: 'Miles earned', value: formatNumber(data.stats.miles) },
  ]
  const gap = 18
  const tw = (STORY_W - 160 - gap * 3) / 4
  tiles.forEach((tile, i) => {
    const tx = 80 + i * (tw + gap)
    fillRR(ctx, tx, y, tw, 150, 28, 'rgba(255,255,255,0.09)', 'rgba(255,255,255,0.16)')
    font(ctx, 19, 700, 2)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText(tile.label.toUpperCase(), tx + 24, y + 48)
    font(ctx, tile.value.length > 8 ? 34 : 42, 800, -1)
    ctx.fillStyle = '#fff'
    ctx.fillText(tile.value, tx + 24, y + 108)
  })
  y += 190

  // Route map
  drawRouteMap(ctx, 80, y, STORY_W - 160, 500, data)
  y += 540

  // Stamps (left) + mascot (right)
  const stamps = data.stamps.slice(0, 4)
  font(ctx, 20, 700, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('DESTINATION STAMPS', 80, y + 20)
  const d = 138
  stamps.forEach((s, i) => {
    const rot = [-0.12, 0.08, -0.05, 0.1][i % 4]
    drawStamp(ctx, 80 + d / 2 + i * (d + 14), y + 60 + d / 2, d, s, rot, t.accent)
  })
  const mascot = await loadImage('/mascot/wave.png')
  if (mascot) {
    const size = 360
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 18
    ctx.drawImage(mascot, STORY_W - 80 - size + 30, y - 20, size, size)
    ctx.restore()
  }
  y += 60 + d + 44

  // Badges
  font(ctx, 20, 700, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('BADGES EARNED', 80, y)
  let bx = 80
  const by = y + 22
  for (const b of data.badges.slice(0, 4)) {
    const w = pill(ctx, bx, by, b, { fill: 'rgba(201,162,75,0.16)', stroke: 'rgba(241,217,138,0.5)', color: '#F1D98A', size: 22, padX: 22, height: 52 })
    bx += w + 12
    if (bx > STORY_W - 400) break
  }

  footer(ctx, 'flygaruda.app  ·  #ActivateTheJourney', 'Garuda Indonesia')
  return toBlob(canvas)
}

/* ------------------------------------------------------------------ */
/* Boarding pass · shareable image (1080 × 1920)                        */
/* ------------------------------------------------------------------ */

function drawQr(ctx: Ctx, x: number, y: number, size: number, seed: string) {
  const n = 21
  const cell = size / n
  const finder = (cx: number, cy: number) => (cx < 7 && cy < 7) || (cx >= n - 7 && cy < 7) || (cx < 7 && cy >= n - 7)
  ctx.fillStyle = '#fff'
  ctx.fillRect(x, y, size, size)
  ctx.fillStyle = '#0F1F3D'
  const drawFinder = (fx: number, fy: number) => {
    ctx.fillStyle = '#0F1F3D'
    ctx.fillRect(x + fx * cell, y + fy * cell, 7 * cell, 7 * cell)
    ctx.fillStyle = '#fff'
    ctx.fillRect(x + (fx + 1) * cell, y + (fy + 1) * cell, 5 * cell, 5 * cell)
    ctx.fillStyle = '#0F1F3D'
    ctx.fillRect(x + (fx + 2) * cell, y + (fy + 2) * cell, 3 * cell, 3 * cell)
  }
  drawFinder(0, 0)
  drawFinder(n - 7, 0)
  drawFinder(0, n - 7)
  ctx.fillStyle = '#0F1F3D'
  for (let cy = 0; cy < n; cy++) {
    for (let cx = 0; cx < n; cx++) {
      if (finder(cx, cy)) continue
      if (hashString(`${seed}-${cx}-${cy}`) % 100 < 45) ctx.fillRect(x + cx * cell, y + cy * cell, cell, cell)
    }
  }
}

function drawBarcode(ctx: Ctx, x: number, y: number, w: number, h: number, seed: string) {
  const bars = Array.from({ length: 70 }, (_, i) => (hashString(`${seed}-b-${i}`) % 3) + 1)
  const total = bars.reduce((s, b, i) => s + b + (i % 2 ? 0.6 : 0), 0)
  const unit = w / total
  let cx = x
  ctx.fillStyle = '#0F1F3D'
  bars.forEach((b, i) => {
    if (i % 2 === 0) ctx.fillRect(cx, y, b * unit, h)
    cx += (b + (i % 2 ? 0.6 : 0)) * unit
  })
}

export async function renderBoardingPassStory(trip: Trip, passengerName: string): Promise<Blob> {
  await ensureFonts()
  const { canvas, ctx } = makeCanvas()
  background(ctx, 'navy')
  await header(ctx, 'Digital boarding pass', 'navy')

  const dep = trip.disruption ? trip.disruption.newDepartTime : trip.departTime
  const arr = trip.disruption ? trip.disruption.newArriveTime : trip.arriveTime
  const boarding = trip.disruption ? trip.disruption.newBoardingTime : trip.boardingTime

  ctx.textBaseline = 'alphabetic'
  font(ctx, 26, 700, 5)
  ctx.fillStyle = THEMES.navy.accent
  ctx.fillText('READY TO FLY', 80, 292)
  font(ctx, 72, 800, -1.5)
  ctx.fillStyle = '#fff'
  ctx.fillText(`${getAirport(trip.origin).city} → ${trip.destination === 'DPS' ? 'Bali' : getAirport(trip.destination).city}`, 80, 380)

  // Card
  const cx = 80
  const cy = 440
  const cw = STORY_W - 160
  const ch = 1220
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 60
  ctx.shadowOffsetY = 30
  fillRR(ctx, cx, cy, cw, ch, 44, '#ffffff')
  ctx.restore()

  ctx.save()
  rr(ctx, cx, cy, cw, ch, 44)
  ctx.clip()
  // Navy header inside the card
  const hg = ctx.createLinearGradient(cx, cy, cx + cw, cy + 320)
  hg.addColorStop(0, '#10306F')
  hg.addColorStop(1, '#0A1F4D')
  ctx.fillStyle = hg
  ctx.fillRect(cx, cy, cw, 320)
  glow(ctx, cx + cw - 60, cy + 40, 260, 'rgba(255,255,255,0.08)')
  const logo = await loadImage('/brand/logo-white.png')
  if (logo) {
    const h = 64
    ctx.drawImage(logo, cx + 44, cy + 40, (logo.width / logo.height) * h, h)
  }
  pill(ctx, cx + cw - 44 - 190, cy + 46, trip.disruption ? 'UPDATED' : 'ON TIME', { fill: 'rgba(255,255,255,0.14)', color: '#fff', size: 20, padX: 22, height: 48, spacing: 2 })

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  font(ctx, 22, 600)
  ctx.fillText(getAirport(trip.origin).city, cx + 44, cy + 160)
  ctx.textAlign = 'right'
  ctx.fillText(trip.destination === 'DPS' ? 'Bali' : getAirport(trip.destination).city, cx + cw - 44, cy + 160)
  ctx.textAlign = 'left'
  font(ctx, 96, 800, -3)
  ctx.fillStyle = '#fff'
  ctx.fillText(trip.origin, cx + 44, cy + 258)
  ctx.textAlign = 'right'
  ctx.fillText(trip.destination, cx + cw - 44, cy + 258)
  ctx.textAlign = 'left'
  font(ctx, 30, 700)
  ctx.fillText(dep, cx + 44, cy + 298)
  ctx.textAlign = 'right'
  ctx.fillText(arr, cx + cw - 44, cy + 298)
  // Center route line
  ctx.textAlign = 'center'
  font(ctx, 22, 600)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText(trip.flightNumber, cx + cw / 2, cy + 190)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx + cw / 2 - 90, cy + 222)
  ctx.lineTo(cx + cw / 2 + 90, cy + 222)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + cw / 2, cy + 222, 9, 0, Math.PI * 2)
  ctx.fillStyle = THEMES.navy.accent
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('Direct', cx + cw / 2, cy + 262)
  ctx.textAlign = 'left'

  // Fields
  const fields: { label: string; value: string; big?: boolean }[][] = [
    [
      { label: 'Passenger', value: passengerName },
      { label: 'Date', value: trip.date },
    ],
    [
      { label: 'Boarding', value: boarding, big: true },
      { label: 'Gate', value: trip.gate, big: true },
      { label: 'Seat', value: trip.seat ?? '—', big: true },
    ],
    [
      { label: 'Zone', value: trip.zone },
      { label: 'Sequence', value: trip.sequence },
      { label: 'Terminal', value: trip.terminal.replace('Terminal ', 'T') },
      { label: 'Cabin', value: trip.cabin === 'economy' ? 'Economy' : trip.cabin === 'business' ? 'Business' : 'First' },
    ],
  ]
  let fy = cy + 380
  for (const row of fields) {
    const colW = (cw - 88) / row.length
    row.forEach((f, i) => {
      const fx = cx + 44 + i * colW
      font(ctx, 18, 700, 2)
      ctx.fillStyle = '#6B7690'
      ctx.fillText(f.label.toUpperCase(), fx, fy)
      font(ctx, f.big ? 56 : 30, 800, f.big ? -1 : 0)
      ctx.fillStyle = '#0F1F3D'
      ctx.fillText(f.value, fx, fy + (f.big ? 66 : 46))
    })
    fy += row.some((f) => f.big) ? 130 : 100
  }

  // Tear line with notches
  const ty = cy + 760
  ctx.save()
  ctx.setLineDash([12, 12])
  ctx.strokeStyle = '#E3E8F0'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx + 40, ty)
  ctx.lineTo(cx + cw - 40, ty)
  ctx.stroke()
  ctx.restore()
  ctx.restore()
  // Notches (drawn outside the clip so they cut the card edge)
  ctx.fillStyle = '#0B2456'
  ctx.beginPath()
  ctx.arc(cx, ty, 26, 0, Math.PI * 2)
  ctx.arc(cx + cw, ty, 26, 0, Math.PI * 2)
  ctx.fill()

  // QR + barcode
  drawQr(ctx, cx + cw / 2 - 150, ty + 44, 300, trip.bookingCode + (trip.seat ?? ''))
  drawBarcode(ctx, cx + 60, ty + 372, cw - 120, 56, trip.bookingCode)
  ctx.textAlign = 'center'
  font(ctx, 22, 600, 5)
  ctx.fillStyle = '#6B7690'
  ctx.fillText(`${trip.bookingCode} · 126 2400${trip.sequence}981`, cx + cw / 2, ty + 460)
  ctx.textAlign = 'left'

  // Note under the card
  font(ctx, 24, 600)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText(`Boarding ${boarding} · Gate closes 15 minutes before departure`, 80, cy + ch + 64)
  footer(ctx, 'Saved from FlyGaruda', 'Garuda Indonesia · SkyTeam')
  return toBlob(canvas)
}

/* ------------------------------------------------------------------ */
/* Membership card · wallet-style image (1080 × 1920)                   */
/* ------------------------------------------------------------------ */

export async function renderMembershipCard(data: { name: string; tier: string; milesId: string; memberSince: string; balance: number }): Promise<Blob> {
  await ensureFonts()
  const { canvas, ctx } = makeCanvas()
  background(ctx, 'navy')
  await header(ctx, 'GarudaMiles', 'navy')
  const cx = 80
  const cy = 560
  const cw = STORY_W - 160
  const ch = 580
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 70
  ctx.shadowOffsetY = 30
  const g = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch)
  g.addColorStop(0, '#16397E')
  g.addColorStop(0.6, '#0C265D')
  g.addColorStop(1, '#071A44')
  rr(ctx, cx, cy, cw, ch, 44)
  ctx.fillStyle = g
  ctx.fill()
  ctx.restore()
  ctx.save()
  rr(ctx, cx, cy, cw, ch, 44)
  ctx.clip()
  glow(ctx, cx + cw - 80, cy + ch - 40, 300, 'rgba(201,162,75,0.35)')
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  for (const r of [220, 300, 380]) {
    ctx.beginPath()
    ctx.arc(cx + cw - 60, cy + 40, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  const mark = await loadImage('/brand/mark-white.png')
  if (mark) ctx.drawImage(mark, cx + 48, cy + 48, (mark.width / mark.height) * 60, 60)
  pill(ctx, cx + cw - 48 - 210, cy + 52, data.tier.toUpperCase(), { fill: 'rgba(255,255,255,0.1)', stroke: 'rgba(255,255,255,0.2)', color: '#F1D98A', size: 22, padX: 24, height: 54, spacing: 4 })
  ctx.textBaseline = 'alphabetic'
  font(ctx, 20, 700, 4)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('MILES BALANCE', cx + 48, cy + 220)
  font(ctx, 96, 800, -3)
  ctx.fillStyle = '#fff'
  ctx.fillText(formatNumber(data.balance), cx + 48, cy + 320)
  font(ctx, 34, 800)
  ctx.fillText(data.name, cx + 48, cy + 440)
  font(ctx, 26, 600, 4)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText(data.milesId, cx + 48, cy + 486)
  ctx.textAlign = 'right'
  font(ctx, 22, 600)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText(`Member since ${data.memberSince}`, cx + cw - 48, cy + 486)
  ctx.textAlign = 'left'
  ctx.restore()

  fillRR(ctx, 80, 1220, cw, 300, 36, '#ffffff')
  drawBarcode(ctx, 130, 1268, cw - 100, 120, data.milesId)
  ctx.textAlign = 'center'
  font(ctx, 26, 600, 6)
  ctx.fillStyle = '#6B7690'
  ctx.fillText(data.milesId.replace('-', ' '), STORY_W / 2, 1450)
  ctx.textAlign = 'left'
  font(ctx, 26, 600)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('Show this card at check-in, lounges and partner outlets.', 80, 1590)
  footer(ctx, 'Saved from FlyGaruda', 'GarudaMiles · Garuda Indonesia')
  return toBlob(canvas)
}
