import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BellRing, Compass, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Mascot, type MascotName } from '../components/common/Mascot'
import { useApp } from '../store/AppContext'
import { cn } from '../utils/cn'

const SLIDES: { title: string; body: string; mascot: MascotName; icon: typeof Compass; accent: string }[] = [
  {
    title: 'Fly with confidence',
    body: 'Everything you need for your journey, in one place.',
    mascot: 'wave',
    icon: ShieldCheck,
    accent: 'from-[#10306F] to-[#0C265D]',
  },
  {
    title: 'Know what you get',
    body: 'See the full value of flying Garuda before you book.',
    mascot: 'think',
    icon: Compass,
    accent: 'from-[#0C265D] to-[#0A3F6E]',
  },
  {
    title: 'Never miss a step',
    body: 'Get timely reminders and important updates throughout your journey.',
    mascot: 'marketing',
    icon: BellRing,
    accent: 'from-[#0A3F6E] to-[#008295]',
  },
  {
    title: 'Your journey, remembered',
    body: 'Manage trips, GarudaMiles, rewards, and travel history effortlessly.',
    mascot: 'baggage',
    icon: Sparkles,
    accent: 'from-[#008295] to-[#029AA4]',
  },
]

export function OnboardingPage() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const touchX = useRef<number | null>(null)
  const last = index === SLIDES.length - 1

  const finish = () => {
    dispatch({ type: 'ONBOARDING_DONE' })
    navigate('/login', { replace: true })
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (dx < -40 && !last) setIndex((i) => i + 1)
    if (dx > 40 && index > 0) setIndex((i) => i - 1)
    touchX.current = null
  }

  const slide = SLIDES[index]

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className={cn('relative flex-1 min-h-[52%] bg-gradient-to-br text-white flex flex-col safe-top transition-colors duration-500', slide.accent)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="flex items-center justify-between px-5 pt-4">
          <img src="/brand/wordmark-white.png" alt="Garuda Indonesia" className="h-7 w-auto opacity-95" />
          {!last && (
            <button type="button" onClick={finish} className="text-[13px] font-semibold text-white/80 hover:text-white px-2 py-1 rounded-lg">
              Skip
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 h-56 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <div key={index} className="animate-fade-up">
            <Mascot name={slide.mascot} size={230} className="drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)]" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/10 to-transparent" aria-hidden />
      </div>

      <div className="px-6 pt-7 pb-6 safe-bottom flex flex-col">
        <div className="flex items-center gap-1.5 mb-5" aria-label={`Slide ${index + 1} of ${SLIDES.length}`}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn('h-1.5 rounded-full transition-all duration-300', i === index ? 'w-7 bg-brand-turquoise' : 'w-1.5 bg-surface-line')}
            />
          ))}
        </div>
        <div key={`text-${index}`} className="animate-fade-up min-h-[112px]">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-turquoise mb-2">
            <slide.icon className="h-3.5 w-3.5" />
            Step {index + 1} of {SLIDES.length}
          </span>
          <h1 className="t-display">{slide.title}</h1>
          <p className="t-body mt-2 text-[15px]">{slide.body}</p>
        </div>
        <div className="mt-6 flex items-center gap-3">
          {index > 0 && !last && (
            <Button variant="secondary" size="lg" onClick={() => setIndex((i) => i - 1)}>
              Back
            </Button>
          )}
          <Button size="lg" full onClick={last ? finish : () => setIndex((i) => i + 1)} rightIcon={<ArrowRight className="h-4 w-4" />}>
            {last ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
