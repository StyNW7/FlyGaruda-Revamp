import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff, KeyRound, Lock, Mail, Phone, Sparkles, User as UserIcon } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Inputs'
import { Checkbox } from '../components/common/Inputs'
import { BottomSheet } from '../components/common/Overlays'
import { Mascot } from '../components/common/Mascot'
import { TermsSheet, type TermsKind } from '../components/common/TermsSheet'
import { useToast } from '../components/common/Toast'
import { DEMO_CREDENTIALS, USER } from '../data/user'
import { useApp } from '../store/AppContext'
import { initials } from '../utils/format'

function ForgotSheet({ open, onClose, initialEmail }: { open: boolean; onClose: () => void; initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (open) {
      setEmail(initialEmail)
      setSent(false)
    }
  }, [open, initialEmail])
  const valid = /\S+@\S+\.\S+/.test(email) || /^GA-?\d{8}$/i.test(email.trim())
  const submit = () => {
    if (!valid) return
    setBusy(true)
    window.setTimeout(() => {
      setBusy(false)
      setSent(true)
    }, 800)
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Reset your password" subtitle="We will send a secure link to your registered email" footer={sent ? <Button full onClick={onClose}>Back to sign in</Button> : <Button full disabled={!valid} loading={busy} onClick={submit}>Send reset link</Button>}>
      {sent ? (
        <div className="flex flex-col items-center text-center py-3 animate-fade-up">
          <span className="h-14 w-14 rounded-full bg-success-soft text-success flex items-center justify-center mb-3 animate-check-pop">
            <Check className="h-7 w-7" strokeWidth={3} />
          </span>
          <p className="t-h3">Check your inbox</p>
          <p className="t-caption mt-1 max-w-[280px]">A reset link was sent to {email}. It expires in 30 minutes. For the demo account, keep using the password shown on the sign-in screen.</p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          <Input label="Email or GarudaMiles number" leftIcon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" />
          <p className="text-[11.5px] text-ink-faint">If the address is registered, the link arrives within a minute.</p>
        </div>
      )}
    </BottomSheet>
  )
}

function JoinSheet({ open, onClose, onJoined }: { open: boolean; onClose: () => void; onJoined: (name: string, email: string, phone: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [terms, setTerms] = useState<TermsKind | null>(null)
  const valid = name.trim().length >= 3 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 8 && password.length >= 8 && agree
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Join GarudaMiles"
      subtitle="Free to join · earn miles on your first flight"
      height="tall"
      footer={
        <Button
          full
          size="lg"
          disabled={!valid}
          loading={busy}
          onClick={() => {
            setBusy(true)
            window.setTimeout(() => {
              setBusy(false)
              onJoined(name.trim(), email.trim(), phone.trim())
            }, 900)
          }}
        >
          Create my account
        </Button>
      }
    >
      <div className="space-y-3.5 pt-1">
        <Input label="Full name" leftIcon={UserIcon} value={name} onChange={(e) => setName(e.target.value)} placeholder="As on your ID" autoComplete="name" />
        <Input label="Email" type="email" leftIcon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" />
        <Input label="Mobile number" type="tel" leftIcon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62" autoComplete="tel" />
        <Input label="Password" type="password" leftIcon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" hint={password && password.length < 8 ? `${8 - password.length} more characters` : undefined} autoComplete="new-password" />
        <Checkbox checked={agree} onChange={setAgree} label={<>I agree to the GarudaMiles <button type="button" onClick={(e) => { e.preventDefault(); setTerms('programme') }} className="font-semibold text-brand-blue hover:underline">programme terms</button> and <button type="button" onClick={(e) => { e.preventDefault(); setTerms('privacy-policy') }} className="font-semibold text-brand-blue hover:underline">privacy policy</button>.</>} />
        <TermsSheet open={terms !== null} onClose={() => setTerms(null)} kind={terms ?? 'programme'} />
        <div className="rounded-xl bg-brand-gold-soft border border-brand-gold/30 p-3 text-[12.5px] text-ink flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-[#8A6A1F] shrink-0 mt-0.5" />
          <span>Welcome bonus: 500 miles credited after your first Garuda flight. In this prototype your new account uses the demo member data.</span>
        </div>
      </div>
    </BottomSheet>
  )
}

export function LoginPage() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const locState = location.state as { from?: string; join?: boolean } | null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [join, setJoin] = useState(Boolean(locState?.join))
  const redirectTo = locState?.from ?? '/'

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

  const joined = (name: string, joinEmail: string, phone: string) => {
    dispatch({ type: 'SET_PROFILE', patch: { name, firstName: name.split(' ')[0], initials: initials(name), email: joinEmail, phone } })
    dispatch({ type: 'LOGIN', auth: 'member' })
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: { id: `welcome-${Date.now()}`, category: 'miles', title: `Welcome to GarudaMiles, ${name.split(' ')[0]}`, body: 'Your membership is active. Earn miles on every Garuda flight and unlock Silver at 15,000 tier miles.', time: 'Just now', to: '/miles', iconKey: 'award' },
    })
    setJoin(false)
    toast(`Welcome to GarudaMiles, ${name.split(' ')[0]}`)
    navigate(redirectTo, { replace: true })
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
          <button type="button" onClick={() => setForgot(true)} className="text-[13px] font-semibold text-brand-blue">
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
            <button type="button" onClick={() => setJoin(true)} className="font-semibold text-brand-blue">
              Join free
            </button>
          </p>
        </div>
      </form>

      <ForgotSheet open={forgot} onClose={() => setForgot(false)} initialEmail={email} />
      <JoinSheet open={join} onClose={() => setJoin(false)} onJoined={joined} />
    </div>
  )
}
