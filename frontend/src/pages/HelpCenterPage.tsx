import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Headphones, MessageCircle, Phone, Search } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, SectionHeader } from '../components/common/Layout'
import { Input } from '../components/common/Inputs'
import { Button } from '../components/common/Button'
import { SupportChat } from '../components/common/SupportChat'
import { cn } from '../utils/cn'

const FAQS = [
  { q: 'When does online check-in open?', a: 'Online check-in opens 24 hours before departure and closes 90 minutes before domestic and 2 hours before international flights. FlyGaruda reminds you the moment it opens.' },
  { q: 'What is included in my Garuda fare?', a: 'Every Garuda fare includes checked baggage, a complimentary meal and beverage, entertainment where available and GarudaMiles earning. Flex fares add free changes and preferred seating.' },
  { q: 'My flight is delayed. What should I do?', a: 'Nothing, in most cases. FlyGaruda updates your trip, boarding pass and reminders automatically and shows your options. For delays over 2 hours you can move to another flight free of charge.' },
  { q: 'How do I change my seat after check-in?', a: 'Open your trip and tap Change Seat. Standard seats are included; preferred seats are complimentary on Flex fares and for Gold members.' },
  { q: 'How long until my miles are credited?', a: 'Garuda flights credit within 72 hours of arrival. Partner airlines and hotels post within 14 days.' },
  { q: 'Can I get a refund?', a: 'Refund eligibility depends on your fare family. Value and Flex fares are refundable with the conditions shown at booking; Saver fares refund taxes only.' },
]

export function HelpCenterPage() {
  const navigate = useNavigate()
  const [chat, setChat] = useState(false)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<number | null>(0)
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return FAQS.filter((f) => !s || f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s))
  }, [q])

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back title="Help Center" subtitle="We are here 24 hours a day" />
      <PageContainer className="py-4 space-y-5">
        <Input leftIcon={Search} placeholder="Search help topics" aria-label="Search help topics" value={q} onChange={(e) => setQ(e.target.value)} />

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" leftIcon={<MessageCircle className="h-4 w-4" />} onClick={() => setChat(true)}>
            Chat with us
          </Button>
          <a href="tel:+622123519999" className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-[14px] font-semibold bg-white text-brand-navy border border-surface-line hover:bg-surface-off press">
            <Phone className="h-4 w-4" /> Call centre
          </a>
        </div>

        <section>
          <SectionHeader title="Frequently asked" />
          <div className="card divide-y divide-surface-line overflow-hidden">
            {list.map((f, i) => {
              const isOpen = open === i
              return (
                <div key={f.q}>
                  <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="w-full flex items-center gap-3 px-4 py-3.5 text-left tap">
                    <span className="flex-1 text-[14px] font-semibold text-ink">{f.q}</span>
                    <ChevronDown className={cn('h-5 w-5 text-ink-muted transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && <p className="px-4 pb-4 text-[13px] text-ink-soft leading-relaxed animate-fade-in">{f.a}</p>}
                </div>
              )
            })}
            {list.length === 0 && <p className="p-6 text-center t-body">No topics match “{q}”.</p>}
          </div>
        </section>

        <button type="button" onClick={() => navigate('/more/contact-us')} className="w-full card p-4 flex items-center gap-3 text-left press">
          <span className="h-11 w-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
            <Headphones className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-bold text-ink">Still need help?</span>
            <span className="block text-[12px] text-ink-muted">Contact options, city offices and WhatsApp</span>
          </span>
        </button>
      </PageContainer>
      <SupportChat open={chat} onClose={() => setChat(false)} />
    </div>
  )
}
