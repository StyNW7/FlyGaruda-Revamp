import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { MONTHLY_MILES } from '../../data/miles'
import { formatNumber } from '../../utils/format'

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-ink text-white px-3 py-2 text-[12px] shadow-float">
      <p className="text-white/70">{label}</p>
      <p className="font-semibold">{formatNumber(payload[0].value)} miles</p>
    </div>
  )
}

/** Small single-series chart: miles earned by month (last 6 or 12 months). */
export function MilesChart({ months = 6, highlightMax = true }: { months?: 6 | 12; highlightMax?: boolean }) {
  const data = MONTHLY_MILES.slice(-months)
  const max = Math.max(...data.map((d) => d.miles), 1)
  const top = Math.ceil(max / 1000) * 1000
  const ticks = [0, top / 2, top]
  const maxIndex = data.findIndex((d) => d.miles === max)
  return (
    <div className="h-[150px] w-full" role="img" aria-label={`Miles earned by month, last ${months} months`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barCategoryGap={months === 12 ? '22%' : '32%'}>
          <CartesianGrid vertical={false} stroke="#E3E8F0" strokeDasharray="0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#6B7690', fontSize: months === 12 ? 9.5 : 11 }} dy={6} interval={0} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9AA3B8', fontSize: 10 }} ticks={ticks} domain={[0, top]} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))} width={44} />
          <Tooltip cursor={{ fill: 'rgba(15,31,61,0.04)' }} content={<ChartTooltip />} />
          <Bar dataKey="miles" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((entry, i) => (
              <Cell key={`${entry.month}-${i}`} fill={highlightMax && i === maxIndex ? '#0C265D' : entry.miles === 0 ? '#D9E0EA' : '#008295'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
