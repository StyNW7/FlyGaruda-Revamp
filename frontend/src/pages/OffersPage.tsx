import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgePercent, Check, Copy, Crown } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, SectionHeader } from '../components/common/Layout'
import { OfferCard } from '../components/common/Explore'
import { MascotBanner } from '../components/common/Mascot'
import { Button } from '../components/common/Button'
import { BottomSheet } from '../components/common/Overlays'
import { useToast } from '../components/common/Toast'
import { OFFERS } from '../data/offers'
import { PROMO_CODES } from '../data/miles'
import { getAirport } from '../data/airports'
import { useApp } from '../store/AppContext'
import { formatRupiah } from '../utils/format'
import { copyText } from '../utils/share'
import type { Offer } from '../types'

export function OffersPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { dispatch, isMember, state } = useApp()
  const [offer, setOffer] = useState<Offer | null>(null)
  const promo = offer?.promoCode ? PROMO_CODES[offer.promoCode] : undefined

  const claim = (o: Offer) => {
    dispatch({ type: 'SET_SEARCH', search: { origin: 'CGK', destination: o.destinationCode, promoCode: o.promoCode, tripType: 'round' } })
    setOffer(null)
    toast(o.promoCode ? `Promo ${o.promoCode} applied to your search` : 'Destination set')
    navigate('/book')
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/" title="Special Offers" subtitle="Seasonal fares and member offers" />
      <PageContainer className="py-4 space-y-4">
        {state.search.promoCode && (
          <div className="rounded-xl bg-success-soft border border-success/20 px-3.5 py-2.5 text-[12.5px] text-success font-semibold inline-flex items-center gap-2 w-full">
            <Check className="h-4 w-4" /> Promo {state.search.promoCode} is active on your next search
          </div>
        )}
        {OFFERS.map((o) => (
          <OfferCard key={o.id} offer={o} onClick={() => setOffer(o)} />
        ))}
        <SectionHeader title="For members" className="mt-2" />
        <MascotBanner
          mascot="money"
          tone="soft"
          title={isMember ? 'Silver bonus: 25% extra miles' : 'Members earn bonus miles'}
          description={isMember ? 'Applied automatically on every eligible Garuda fare this season.' : 'Join GarudaMiles to unlock member fares and bonus miles.'}
          action={!isMember ? <Button size="sm" leftIcon={<Crown className="h-4 w-4" />} onClick={() => navigate('/miles')}>Join GarudaMiles</Button> : undefined}
        />
        <p className="text-[11px] text-ink-faint text-center">Offers are illustrative for this prototype. Fares shown are starting prices per adult.</p>
      </PageContainer>

      <BottomSheet
        open={offer !== null}
        onClose={() => setOffer(null)}
        title={offer?.title}
        subtitle={offer?.subtitle}
        footer={
          offer ? (
            <Button full size="lg" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => claim(offer)}>
              {offer.promoCode ? `Claim ${offer.promoCode} & search flights` : `Search flights to ${offer.destination}`}
            </Button>
          ) : undefined
        }
      >
        {offer && (
          <div className="space-y-3">
            <div className="rounded-xl bg-surface-off p-3.5 flex items-center justify-between">
              <div>
                <p className="t-label">Fares from</p>
                <p className="text-[20px] font-bold text-brand-navy leading-tight">{formatRupiah(offer.priceFrom)}</p>
              </div>
              <div className="text-right">
                <p className="t-label">Route</p>
                <p className="text-[14px] font-semibold text-ink">CGK → {offer.destinationCode}</p>
                <p className="text-[11px] text-ink-muted">Jakarta – {getAirport(offer.destinationCode).city}</p>
              </div>
            </div>
            {offer.promoCode && promo && (
              <div className="rounded-xl border border-dashed border-brand-turquoise/50 bg-brand-turquoise-soft/50 p-3.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-turquoise">
                  <BadgePercent className="h-4 w-4" /> Promo code
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-mono text-[20px] font-bold tracking-[0.16em] text-ink">{offer.promoCode}</span>
                  <button type="button" onClick={() => copyText(offer.promoCode!).then((ok) => toast(ok ? 'Promo code copied' : 'Could not copy', ok ? 'success' : 'warning'))} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-blue">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                </div>
                <p className="text-[12px] text-ink-soft mt-1">{promo.label} · up to {formatRupiah(promo.maxDiscount)} off. Applied automatically at checkout.</p>
              </div>
            )}
            <ul className="space-y-1.5 text-[12.5px] text-ink-soft">
              {['Valid for travel until 31 March 2027', 'All Garuda fares include baggage, meals and miles', 'Combinable with GarudaMiles tier bonus'].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-brand-turquoise shrink-0 mt-0.5" strokeWidth={2.5} /> {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
