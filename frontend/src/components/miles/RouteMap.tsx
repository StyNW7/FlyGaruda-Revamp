import type { AirportCode } from '../../types'
import { arcControl, boundsFor, placeLabels, project } from '../../utils/geo'
import { cn } from '../../utils/cn'

const W = 360
const H = 200

/** Abstract route map: flown arcs from the home airport to every visited destination. */
export function RouteMap({
  visited,
  locked = [],
  routes,
  home = 'CGK',
  onSelect,
  selected,
  className,
}: {
  visited: AirportCode[]
  locked?: AirportCode[]
  routes: { from: AirportCode; to: AirportCode }[]
  home?: AirportCode
  onSelect?: (code: AirportCode) => void
  selected?: AirportCode | null
  className?: string
}) {
  const bounds = boundsFor([...visited, ...locked])
  const pt = (code: AirportCode) => project(code, W, H, 28, bounds)
  const all = [...visited, ...locked]
  const labels = placeLabels(
    all.map((code) => ({ id: code, ...pt(code), w: code.length * 6.6, h: 10 })),
    { gap: 9, pointRadius: 6, bounds: { x: 2, y: 2, w: W - 4, h: H - 4 } },
  )
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('w-full h-auto', className)} role="img" aria-label="Map of routes flown with Garuda">
      <defs>
        <linearGradient id="arc" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3FC5CF" />
          <stop offset="1" stopColor="#C9A24B" />
        </linearGradient>
        <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.12)" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#dots)" />
      {[1, 2, 3].map((i) => (
        <line key={`h${i}`} x1="0" x2={W} y1={(H / 4) * i} y2={(H / 4) * i} stroke="rgba(255,255,255,0.07)" />
      ))}
      {[1, 2, 3, 4, 5].map((i) => (
        <line key={`v${i}`} y1="0" y2={H} x1={(W / 6) * i} x2={(W / 6) * i} stroke="rgba(255,255,255,0.07)" />
      ))}

      {routes.map((r) => {
        const a = pt(r.from)
        const b = pt(r.to)
        const c = arcControl(a, b)
        const d = `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`
        return (
          <g key={`${r.from}-${r.to}`}>
            <path d={d} fill="none" stroke="rgba(63,197,207,0.25)" strokeWidth="6" strokeLinecap="round" />
            <path d={d} fill="none" stroke="url(#arc)" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )
      })}
      {locked.map((code) => {
        const h = pt(home)
        const p = pt(code)
        const c = arcControl(h, p)
        return <path key={`locked-${code}`} d={`M ${h.x} ${h.y} Q ${c.x} ${c.y} ${p.x} ${p.y}`} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="3 4" />
      })}

      {[...visited, ...locked].map((code) => {
        const p = pt(code)
        const isLocked = locked.includes(code)
        const isSelected = selected === code
        const l = labels[code]
        return (
          <g key={code} onClick={() => onSelect?.(code)} className={cn(onSelect && 'cursor-pointer')} role={onSelect ? 'button' : undefined} aria-label={code}>
            {!isLocked && <circle cx={p.x} cy={p.y} r={isSelected ? 11 : 8} fill={isSelected ? 'rgba(201,162,75,0.35)' : 'rgba(63,197,207,0.3)'} />}
            <circle cx={p.x} cy={p.y} r={isLocked ? 3 : 4} fill={isLocked ? 'rgba(255,255,255,0.4)' : '#fff'} stroke={isLocked ? 'rgba(255,255,255,0.4)' : isSelected ? '#C9A24B' : '#3FC5CF'} strokeWidth={isLocked ? 1 : 1.5} strokeDasharray={isLocked ? '2 2' : undefined} />
            <text x={l.x} y={l.y + 3.5} textAnchor={l.align === 'left' ? 'start' : l.align === 'right' ? 'end' : 'middle'} fontSize="9.5" fontWeight="700" fill={isLocked ? 'rgba(255,255,255,0.45)' : '#fff'} style={{ fontFamily: 'inherit', letterSpacing: '0.06em' }}>
              {code}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
