import type { ReactElement } from 'react'
import { hashString } from '../../utils/format'

/** Deterministic QR-like pattern for the prototype (not scannable). */
export function QrVisual({ seed, size = 120, className }: { seed: string; size?: number; className?: string }) {
  const n = 21
  const cell = size / n
  const cells: { x: number; y: number }[] = []
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (finder(x, y)) continue
      if (hashString(`${seed}-${x}-${y}`) % 100 < 45) cells.push({ x, y })
    }
  }
  const Finder = ({ x, y }: { x: number; y: number }) => (
    <>
      <rect x={x * cell} y={y * cell} width={7 * cell} height={7 * cell} fill="#0F1F3D" />
      <rect x={(x + 1) * cell} y={(y + 1) * cell} width={5 * cell} height={5 * cell} fill="white" />
      <rect x={(x + 2) * cell} y={(y + 2) * cell} width={3 * cell} height={3 * cell} fill="#0F1F3D" />
    </>
  )
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label="Boarding pass QR code">
      <rect width={size} height={size} fill="white" />
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x * cell} y={c.y * cell} width={cell} height={cell} fill="#0F1F3D" />
      ))}
    </svg>
  )
}

export function BarcodeVisual({ seed, className }: { seed: string; className?: string }) {
  const bars = Array.from({ length: 60 }, (_, i) => (hashString(`${seed}-b-${i}`) % 3) + 1)
  return (
    <svg viewBox="0 0 140 36" className={className} preserveAspectRatio="none" role="img" aria-label="Boarding pass barcode">
      {bars.reduce<{ x: number; els: ReactElement[] }>(
        (acc, w, i) => {
          if (i % 2 === 0) acc.els.push(<rect key={i} x={acc.x} y={0} width={w} height={36} fill="#0F1F3D" />)
          acc.x += w + (i % 2 === 0 ? 0 : 0.6)
          return acc
        },
        { x: 0, els: [] },
      ).els}
    </svg>
  )
}
