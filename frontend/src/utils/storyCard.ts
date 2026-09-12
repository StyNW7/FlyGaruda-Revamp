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

interface Palette {
  stops: [string, string, string]
  accent: string
  accentSoft: string
  glowA: string
  glowB: string
  label: string
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(v, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgba(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  const c = (x: number, y: number) => Math.round(x + (y - x) * t)
  return `rgb(${c(r1, r2)},${c(g1, g2)},${c(b1, b2)})`
}

const PRESETS: Record<Exclude<ShareTheme, 'custom'>, Palette> = {
  navy: { stops: ['#123579', '#0C265D', '#081C48'], accent: '#3FC5CF', accentSoft: 'rgba(63,197,207,0.18)', glowA: 'rgba(0,130,149,0.45)', glowB: 'rgba(201,162,75,0.25)', label: 'Midnight Navy' },
  turquoise: { stops: ['#0A8C9E', '#046E80', '#0C3D5E'], accent: '#FFFFFF', accentSoft: 'rgba(255,255,255,0.18)', glowA: 'rgba(255,255,255,0.28)', glowB: 'rgba(12,38,93,0.55)', label: 'Ocean Turquoise' },
  gold: { stops: ['#8A6A1F', '#5C4413', '#2A2110'], accent: '#F1D98A', accentSoft: 'rgba(241,217,138,0.2)', glowA: 'rgba(201,162,75,0.5)', glowB: 'rgba(255,255,255,0.12)', label: 'Heritage Gold' },
  sunset: { stops: ['#B8442F', '#7A1F3D', '#2B1240'], accent: '#FFC978', accentSoft: 'rgba(255,201,120,0.2)', glowA: 'rgba(255,140,80,0.45)', glowB: 'rgba(120,60,200,0.35)', label: 'Bali Sunset' },
}

export const SHARE_THEMES = (Object.keys(PRESETS) as Exclude<ShareTheme, 'custom'>[]).map((id) => ({ id, label: PRESETS[id].label, stops: PRESETS[id].stops }))

export interface CustomColours {
  primary: string
  secondary: string
  accent: string
}

/** Resolves a preset or the traveller's own colours into a full palette. */
export function paletteFor(theme: ShareTheme, custom: CustomColours): Palette {
  if (theme !== 'custom') return PRESETS[theme]
  return {
    stops: [custom.primary, mix(custom.primary, custom.secondary, 0.55), custom.secondary],
    accent: custom.accent,
    accentSoft: rgba(custom.accent, 0.2),
    glowA: rgba(custom.accent, 0.4),
    glowB: 'rgba(255,255,255,0.14)',
    label: 'Custom',
  }
}

function background(ctx: Ctx, t: Palette, w = STORY_W, h = STORY_H) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, t.stops[0])
  g.addColorStop(0.55, t.stops[1])
  g.addColorStop(1, t.stops[2])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // Soft ambient light
  glow(ctx, w - 120, h * 0.2, 520, t.glowA)
  glow(ctx, 120, h - 280, 560, t.glowB)

  // Large translucent rings
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 2
  for (const r of [420, 560, 700]) {
    ctx.beginPath()
    ctx.arc(w - 70, 160, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Dashed flight path across the page
  ctx.save()
  ctx.setLineDash([10, 18])
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-40, h * 0.62)
  ctx.bezierCurveTo(w * 0.24, h * 0.47, w * 0.67, h * 0.47, w + 40, h * 0.32)
  ctx.stroke()
  ctx.restore()

  // Subtle dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  for (let y = 120; y < h; y += 56) {
    for (let x = 60; x < w; x += 56) {
      ctx.beginPath()
      ctx.arc(x, y, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

async function header(ctx: Ctx, rightLabel: string, t: Palette, w = STORY_W) {
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
  const pw = ctx.measureText(rightLabel.toUpperCase()).width + 48
  pill(ctx, w - 80 - pw, 92, rightLabel.toUpperCase(), { fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.22)', color: t.accent, size: 20, padX: 24, height: 54, spacing: 3 })
}

function footer(ctx: Ctx, left: string, right: string, w = STORY_W, h = STORY_H) {
  ctx.textBaseline = 'middle'
  font(ctx, 24, 600, 1)
  ctx.fillStyle = 'rgba(255,255,255,0.62)'
  ctx.textAlign = 'left'
  ctx.fillText(left, 80, h - 84)
  ctx.textAlign = 'right'
  ctx.fillText(right, w - 80, h - 84)
  ctx.textAlign = 'left'
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render image'))), 'image/png'))
}

function makeCanvas(w = STORY_W, h = STORY_H): { canvas: HTMLCanvasElement; ctx: Ctx } {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
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
  /** Optional narrative facts (longest flight, favourite city…) used when the map is hidden. */
  highlights?: { label: string; value: string; sub: string }[]
}

export type StoryMascot = 'wave' | 'hi' | 'love' | 'respect' | 'chill' | 'baggage' | 'none'

export interface PassportRenderOptions {
  theme: ShareTheme
  custom: CustomColours
  format: 'story' | 'square'
  mascot: StoryMascot
  showMap: boolean
  showStamps: boolean
  showBadges: boolean
  showStats: boolean
  showMemberId: boolean
  headline?: string
  caption?: string
}

export const SQUARE_W = 1080
export const SQUARE_H = 1080

const STAMP_ROTATIONS = [-0.12, 0.08, -0.05, 0.1, -0.08, 0.06]
const BADGE_GOLD = '#F1D98A'

function drawRouteMap(ctx: Ctx, x: number, y: number, w: number, h: number, data: PassportCardData, t: Palette) {
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

function sectionLabel(ctx: Ctx, text: string, x: number, y: number) {
  font(ctx, 20, 700, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, x, y)
}

function drawStatTiles(ctx: Ctx, y: number, data: PassportCardData, w: number, height = 150) {
  const tiles = [
    { label: 'Flights', value: String(data.stats.flights) },
    { label: 'Destinations', value: String(data.stats.destinations) },
    { label: 'Distance', value: `${formatNumber(data.stats.distanceKm)} km` },
    { label: 'Miles earned', value: formatNumber(data.stats.miles) },
  ]
  const gap = 18
  const tw = (w - 160 - gap * 3) / 4
  tiles.forEach((tile, i) => {
    const tx = 80 + i * (tw + gap)
    fillRR(ctx, tx, y, tw, height, 28, 'rgba(255,255,255,0.09)', 'rgba(255,255,255,0.16)')
    font(ctx, 19, 700, 2)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(tile.label.toUpperCase(), tx + 24, y + 48)
    font(ctx, tile.value.length > 8 ? 34 : 42, 800, -1)
    ctx.fillStyle = '#fff'
    ctx.fillText(tile.value, tx + 24, y + height - 42)
  })
}

function drawStampsRow(ctx: Ctx, y: number, data: PassportCardData, o: PassportRenderOptions, t: Palette, d: number) {
  const stamps = data.stamps.slice(0, o.mascot === 'none' ? 6 : 4)
  sectionLabel(ctx, 'DESTINATION STAMPS', 80, y + 20)
  stamps.forEach((st, i) => drawStamp(ctx, 80 + d / 2 + i * (d + 14), y + 60 + d / 2, d, st, STAMP_ROTATIONS[i % 6], t.accent))
  return y + 60 + d + 44
}

function drawHighlights(ctx: Ctx, y: number, items: { label: string; value: string; sub: string }[], w: number, t: Palette) {
  sectionLabel(ctx, 'JOURNEY HIGHLIGHTS', 80, y)
  const gap = 18
  const tw = (w - 160 - gap) / 2
  items.slice(0, 4).forEach((it, i) => {
    const tx = 80 + (i % 2) * (tw + gap)
    const ty = y + 22 + Math.floor(i / 2) * (128 + gap)
    fillRR(ctx, tx, ty, tw, 128, 26, 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.15)')
    font(ctx, 18, 700, 2)
    ctx.fillStyle = t.accent
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(it.label.toUpperCase(), tx + 24, ty + 42)
    font(ctx, 32, 800, -0.5)
    ctx.fillStyle = '#fff'
    ctx.fillText(it.value, tx + 24, ty + 82)
    font(ctx, 20, 600, 0)
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.fillText(it.sub, tx + 24, ty + 110)
  })
  return y + 22 + Math.ceil(Math.min(items.length, 4) / 2) * (128 + gap) + 30
}

async function drawMascot(ctx: Ctx, mascot: StoryMascot, x: number, y: number, size: number) {
  if (mascot === 'none') return
  const img = await loadImage(`/mascot/${mascot}.png`)
  if (!img) return
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 18
  ctx.drawImage(img, x, y, size, size)
  ctx.restore()
}

function drawBadgePills(ctx: Ctx, x: number, y: number, badges: string[], maxX: number) {
  let bx = x
  for (const b of badges) {
    font(ctx, 22, 700, 0)
    const w = ctx.measureText(b).width + 44
    if (bx + w > maxX) break
    pill(ctx, bx, y, b, { fill: rgba(BADGE_GOLD, 0.14), stroke: rgba(BADGE_GOLD, 0.5), color: BADGE_GOLD, size: 22, padX: 22, height: 52 })
    bx += w + 12
  }
}

/** Eyebrow, headline, member line and optional caption. Returns the next free y. */
function drawHeadlineBlock(ctx: Ctx, data: PassportCardData, o: PassportRenderOptions, t: Palette, w: number, size: number, top: number, maxLines: number) {
  ctx.textBaseline = 'alphabetic'
  font(ctx, 26, 700, 5)
  ctx.fillStyle = t.accent
  ctx.fillText(`MY GARUDA PASSPORT · ${new Date().getFullYear()}`, 80, top)
  font(ctx, size, 800, -2)
  ctx.fillStyle = '#fff'
  const headline = o.headline?.trim() || `${data.stats.destinations} destinations, ${formatNumber(data.stats.distanceKm)} km flown.`
  const lines = wrap(ctx, headline, w - 160).slice(0, maxLines)
  const lh = size * 1.13
  lines.forEach((l, i) => ctx.fillText(l, 80, top + 108 + i * lh))
  let y = top + 108 + (lines.length - 1) * lh + 60

  font(ctx, 40, 800)
  ctx.fillStyle = '#fff'
  ctx.fillText(data.name, 80, y + 36)
  const nameW = ctx.measureText(data.name).width
  pill(ctx, 80 + nameW + 22, y - 2, `GarudaMiles ${data.tier}`, { fill: 'rgba(255,255,255,0.1)', stroke: 'rgba(255,255,255,0.22)', color: '#fff', size: 22, padX: 22, height: 50 })
  ctx.textBaseline = 'alphabetic'
  font(ctx, 24, 600, 1)
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText([o.showMemberId ? data.milesId : null, `Member since ${data.memberSince}`].filter(Boolean).join(' · '), 80, y + 82)
  y += 100

  if (o.caption?.trim()) {
    font(ctx, 28, 600, 0)
    ctx.fillStyle = t.accent
    const cap = wrap(ctx, `“${o.caption.trim()}”`, w - 160).slice(0, 2)
    cap.forEach((l, i) => ctx.fillText(l, 80, y + 22 + i * 38))
    y += 40 + (cap.length - 1) * 38
  }
  return y + 30
}

/** Instagram story (1080 × 1920). */
async function renderStory(data: PassportCardData, o: PassportRenderOptions, t: Palette): Promise<Blob> {
  const { canvas, ctx } = makeCanvas()
  background(ctx, t)
  await header(ctx, 'Garuda Flight Passport', t)
  // Without the map there is a lot more room: scale the remaining sections up so the card still feels full.
  const roomy = !o.showMap
  let y = drawHeadlineBlock(ctx, data, o, t, STORY_W, roomy ? 100 : 92, roomy ? 320 : 292, 3)
  if (roomy) y += 30

  if (o.showStats) {
    const th = roomy ? 200 : 150
    drawStatTiles(ctx, y, data, STORY_W, th)
    y += th + (roomy ? 70 : 40)
  }
  if (o.showMap) {
    const mapH = o.showStamps && o.showBadges ? 500 : 620
    drawRouteMap(ctx, 80, y, STORY_W - 160, mapH, data, t)
    y += mapH + 40
  }
  const mascotSize = roomy ? 420 : 360
  let anchorY: number | null = null
  if (o.showStamps) {
    anchorY = y
    y = drawStampsRow(ctx, y, data, o, t, roomy ? 176 : 138)
    if (roomy) y += 30
  }
  if (o.showBadges && data.badges.length) {
    anchorY = anchorY ?? y - 20
    sectionLabel(ctx, 'BADGES EARNED', 80, y)
    drawBadgePills(ctx, 80, y + 22, data.badges, o.mascot === 'none' ? STORY_W - 80 : STORY_W - 80 - mascotSize + 40)
    y += 100
  }
  // Mascot sits beside the stamps/badges block, never over the footer.
  const mascotTop = Math.min(anchorY ?? y, STORY_H - 150 - mascotSize)
  await drawMascot(ctx, o.mascot, STORY_W - 80 - mascotSize + 30, mascotTop, mascotSize)
  // Fill leftover space with journey highlights (only when the mascot isn't occupying it).
  const mascotBottom = o.mascot === 'none' ? 0 : mascotTop + mascotSize + 20
  const hy = Math.max(y + 20, mascotBottom)
  const rows = Math.min(2, Math.floor((STORY_H - 150 - hy - 52) / 146))
  if (data.highlights?.length && rows >= 1) drawHighlights(ctx, hy, data.highlights.slice(0, rows * 2), STORY_W, t)
  footer(ctx, 'flygaruda.app  ·  #ActivateTheJourney', 'Garuda Indonesia')
  return toBlob(canvas)
}

/** Square feed post (1080 × 1080) — a tighter composition of the same passport. */
async function renderSquare(data: PassportCardData, o: PassportRenderOptions, t: Palette): Promise<Blob> {
  const { canvas, ctx } = makeCanvas(SQUARE_W, SQUARE_H)
  background(ctx, t, SQUARE_W, SQUARE_H)
  await header(ctx, 'Garuda Flight Passport', t, SQUARE_W)
  let y = drawHeadlineBlock(ctx, data, o, t, SQUARE_W, 72, 250, 2)
  if (o.showStats) {
    drawStatTiles(ctx, y, data, SQUARE_W, 130)
    y += 160
  }
  const mascotSize = 300
  let anchorY: number | null = null
  if (o.showStamps) {
    anchorY = y
    y = drawStampsRow(ctx, y, data, o, t, 128)
  }
  if (o.showBadges && data.badges.length && y < SQUARE_H - 200) {
    anchorY = anchorY ?? y - 20
    sectionLabel(ctx, 'BADGES EARNED', 80, y)
    drawBadgePills(ctx, 80, y + 22, data.badges, o.mascot === 'none' ? SQUARE_W - 80 : SQUARE_W - 80 - mascotSize + 30)
  }
  await drawMascot(ctx, o.mascot, SQUARE_W - 80 - mascotSize + 30, Math.min(anchorY ?? y, SQUARE_H - 140 - mascotSize), mascotSize)
  footer(ctx, 'flygaruda.app  ·  #ActivateTheJourney', 'Garuda Indonesia', SQUARE_W, SQUARE_H)
  return toBlob(canvas)
}

export async function renderPassportStory(data: PassportCardData, options: PassportRenderOptions): Promise<Blob> {
  await ensureFonts()
  const t = paletteFor(options.theme, options.custom)
  return options.format === 'square' ? renderSquare(data, options, t) : renderStory(data, options, t)
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
  background(ctx, PRESETS.navy)
  await header(ctx, 'Digital boarding pass', PRESETS.navy)

  const dep = trip.disruption ? trip.disruption.newDepartTime : trip.departTime
  const arr = trip.disruption ? trip.disruption.newArriveTime : trip.arriveTime
  const boarding = trip.disruption ? trip.disruption.newBoardingTime : trip.boardingTime

  ctx.textBaseline = 'alphabetic'
  font(ctx, 26, 700, 5)
  ctx.fillStyle = PRESETS.navy.accent
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
  ctx.fillStyle = PRESETS.navy.accent
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
  background(ctx, PRESETS.navy)
  await header(ctx, 'GarudaMiles', PRESETS.navy)
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
