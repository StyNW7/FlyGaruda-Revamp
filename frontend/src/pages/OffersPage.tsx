import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, SectionHeader } from '../components/common/Layout'
import { OfferCard } from '../components/common/Explore'
import { MascotBanner } from '../components/common/Mascot'
import { Button } from '../components/common/Button'
import { OFFERS } from '../data/offers'
import { useApp } from '../store/AppContext'

export function OffersPage() {
  const navigate = useNavigate()
  const { dispatch, isMember } = useApp()
  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back="/" title="Special Offers" subtitle="Seasonal fares and member offers" />
      <PageContainer className="py-4 space-y-4">
        {OFFERS.map((o) => (
          <OfferCard
            key={o.id}
            offer={o}
            onClick={() => {
              dispatch({ type: 'SET_SEARCH', search: { origin: 'CGK', destination: o.destinationCode } })
              navigate('/book')
            }}
          />
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
    </div>
  )
}
