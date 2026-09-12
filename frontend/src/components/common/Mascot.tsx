import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type MascotName = 'hi' | 'wave' | 'think' | 'baggage' | 'chair' | 'chill' | 'love' | 'money' | 'respect' | 'marketing' | 'cry'

const ALT: Record<MascotName, string> = {
  hi: 'Garuda mascot waving hello',
  wave: 'Garuda mascot with wings spread',
  think: 'Garuda mascot thinking',
  baggage: 'Garuda mascot with a suitcase',
  chair: 'Garuda mascot relaxing in a seat',
  chill: 'Garuda mascot enjoying in-flight entertainment',
  love: 'Garuda mascot making a heart',
  money: 'Garuda mascot holding banknotes',
  respect: 'Garuda mascot in pilot uniform saluting',
  marketing: 'Garuda mascot with a megaphone',
  cry: 'Garuda mascot looking sad',
}

export function Mascot({ name, className, size = 120 }: { name: MascotName; className?: string; size?: number }) {
  return (
    <img
      src={`/mascot/${name}.png`}
      alt={ALT[name]}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      className={cn('object-contain select-none pointer-events-none', className)}
      style={{ width: size, height: size }}
    />
  )
}

/** Restrained banner with a mascot on the side; mascot never overlaps text or actions. */
export function MascotBanner({
  mascot,
  title,
  description,
  action,
  tone = 'soft',
  className,
  size = 84,
}: {
  mascot: MascotName
  title: string
  description?: string
  action?: ReactNode
  tone?: 'soft' | 'navy' | 'turquoise' | 'white'
  className?: string
  size?: number
}) {
  const tones = {
    soft: 'bg-surface-off border border-surface-line text-ink',
    white: 'bg-white border border-surface-line text-ink',
    navy: 'card-navy text-white',
    turquoise: 'bg-brand-turquoise-soft border border-brand-turquoise/10 text-ink',
  }
  const dark = tone === 'navy'
  return (
    <div className={cn('rounded-2xl flex items-center gap-3 pl-4 pr-3 py-3 overflow-hidden', tones[tone], className)}>
      <div className="flex-1 min-w-0 py-1">
        <p className={cn('text-[15px] font-bold leading-snug', dark ? 'text-white' : 'text-ink')}>{title}</p>
        {description && <p className={cn('text-[12.5px] mt-1 leading-snug', dark ? 'text-white/75' : 'text-ink-muted')}>{description}</p>}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      <Mascot name={mascot} size={size} className="shrink-0" />
    </div>
  )
}
