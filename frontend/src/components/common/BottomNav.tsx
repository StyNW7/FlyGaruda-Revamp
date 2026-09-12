import { NavLink } from 'react-router-dom'
import { Award, Grid2X2, Home, Luggage, PlaneTakeoff } from 'lucide-react'
import { cn } from '../../utils/cn'

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/book', label: 'Book', icon: PlaneTakeoff, end: false },
  { to: '/trips', label: 'Trips', icon: Luggage, end: false },
  { to: '/miles', label: 'Miles', icon: Award, end: false },
  { to: '/more', label: 'More', icon: Grid2X2, end: false },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="shrink-0 bg-white/95 backdrop-blur border-t border-surface-line shadow-nav safe-bottom z-40"
    >
      <ul className="grid grid-cols-5 h-[var(--nav-height)]">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group h-full w-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-brand-navy' : 'text-ink-faint hover:text-ink-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'relative flex items-center justify-center h-8 w-14 rounded-full transition-all duration-200',
                      isActive ? 'bg-brand-turquoise-soft text-brand-turquoise' : 'bg-transparent',
                    )}
                  >
                    <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span className={cn(isActive && 'font-semibold')}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
