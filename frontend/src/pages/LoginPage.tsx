import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, Lock, Mail, Sparkles } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Inputs'
import { Mascot } from '../components/common/Mascot'
import { useToast } from '../components/common/Toast'
import { DEMO_CREDENTIALS, USER } from '../data/user'
import { useApp } from '../store/AppContext'

export function LoginPage() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      setError('Email or password is incorrect. Use the demo account below.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      dispatch({ type: 'LOGIN', auth: 'member' })
      toast(`Welcome back, ${USER.firstName}`)
      navigate(redirectTo, { replace: true })
    }, 700)
  }

  const useDemo = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setError(null)
  }

  const continueGuest = () => {
    dispatch({ type: 'LOGIN', auth: 'guest' })
    navigate('/', { replace: true })
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="card-navy rounded-none px-6 pt-8 pb-10 safe-top relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5" aria-hidden />
        <div className="absolute right-6 bottom-4 h-24 w-24 rounded-full bg-brand-turquoise/20 blur-2xl" aria-hidden />
        <img src="/brand/logo-white.png" alt="Garuda Indonesia · SkyTeam" className="h-12 w-auto" />
        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-turquoise-light">FlyGaruda</p>
            <h1 className="text-[26px] font-bold leading-tight mt-1">Welcome back</h1>
            <p className="text-white/70 text-[13.5px] mt-1.5 max-w-[220px]">Sign in to see your trips, miles and journey updates.</p>
          </div>
          <Mascot name="hi" size={104} className="shrink-0 -mb-4" />
        </div>
      </div>

      <form onSubmit={submit} className="px-6 pt-6 flex-1 flex flex-col" noValidate>
        <div className="space-y-4">
          <Input
            label="Email or GarudaMiles number"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            leftIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error ?? undefined}
            rightSlot={
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="text-ink-faint hover:text-ink p-1">
                {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            }
          />
        </div>
        <div className="flex justify-end mt-2">
          <button type="button" onClick={() => toast('A reset link would be sent to your email in the live app', 'info')} className="text-[13px] font-semibold text-brand-blue">
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" full className="mt-5" loading={loading}>
          Sign In
        </Button>

        <div className="mt-4 rounded-xl border border-dashed border-brand-turquoise/40 bg-brand-turquoise-soft/60 p-3.5">
          <div className="flex items-start gap-3">
            <span className="h-9 w-9 rounded-full bg-white text-brand-turquoise flex items-center justify-center shrink-0">
              <KeyRound className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-ink">Demo Account</p>
              <p className="text-[12px] text-ink-soft mt-0.5 font-mono break-all">{DEMO_CREDENTIALS.email}</p>
              <p className="text-[12px] text-ink-soft font-mono">{DEMO_CREDENTIALS.password}</p>
            </div>
            <Button type="button" variant="turquoise" size="sm" onClick={useDemo}>
              Use
            </Button>
          </div>
        </div>

        <div className="mt-auto pt-6 pb-6 safe-bottom text-center">
          <button type="button" onClick={continueGuest} className="text-[14px] font-semibold text-brand-navy hover:underline">
            Continue as guest
          </button>
          <p className="text-[12px] text-ink-muted mt-3 flex items-center gap-1.5 justify-center">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            Not a GarudaMiles member?{' '}
            <button type="button" onClick={() => toast('Membership sign-up is illustrative in this prototype', 'info')} className="font-semibold text-brand-blue">
              Join free
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
