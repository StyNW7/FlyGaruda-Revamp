import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { MONTHLY_MILES } from '../../data/miles'
import { formatNumber } from '../../utils/format'

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-ink text-white px-3 py-2 text-[12px] shadow-float">
      <p className="text-white/70">{label} 2026</p>
      <p className="font-semibold">{formatNumber(payload[0].value)} miles</p>
    </div>
  )
}

/** Small single-series chart: miles earned by month. */
export function MilesChart() {
  const last = MONTHLY_MILES.length - 1
  return (
    <div className="h-[150px] w-full" role="img" aria-label="Miles earned by month, April to September 2026">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={MONTHLY_MILES} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barCategoryGap="32%">
          <CartesianGrid vertical={false} stroke="#E3E8F0" strokeDasharray="0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#6B7690', fontSize: 11 }} dy={6} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9AA3B8', fontSize: 10 }} ticks={[0, 2000, 4000]} domain={[0, 4000]} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))} width={44} />
          <Tooltip cursor={{ fill: 'rgba(15,31,61,0.04)' }} content={<ChartTooltip />} />
          <Bar dataKey="miles" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {MONTHLY_MILES.map((entry, i) => (
              <Cell key={entry.month} fill={i === last ? '#0C265D' : '#008295'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
