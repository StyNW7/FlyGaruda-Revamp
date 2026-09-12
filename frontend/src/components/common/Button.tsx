import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'turquoise' | 'inverse' | 'outline-inverse'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-navy text-white hover:bg-brand-navy-deep disabled:bg-surface-soft disabled:text-ink-faint',
  secondary: 'bg-white text-brand-navy border border-surface-line hover:bg-surface-off disabled:text-ink-faint',
  ghost: 'bg-transparent text-brand-blue hover:bg-brand-blue-light disabled:text-ink-faint',
  danger: 'bg-error text-white hover:bg-[#a83232] disabled:bg-surface-soft disabled:text-ink-faint',
  turquoise: 'bg-brand-turquoise text-white hover:bg-[#026f80] disabled:bg-surface-soft disabled:text-ink-faint',
  inverse: 'bg-white text-brand-navy hover:bg-surface-off disabled:opacity-60',
  'outline-inverse': 'bg-transparent text-white border border-white/40 hover:bg-white/10 disabled:opacity-60',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-lg gap-1.5',
  md: 'h-11 px-4 text-[14px] rounded-xl gap-2',
  lg: 'h-[52px] px-5 text-[15px] rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', full, loading, leftIcon, rightIcon, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold select-none whitespace-nowrap',
        'transition-all duration-150 active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
})
