import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer, StickyCTA } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/States'
import { SeatLegend, SeatMap } from '../components/booking/SeatMap'
import { seatType } from '../utils/seats'
import { useToast } from '../components/common/Toast'
import { useApp } from '../store/AppContext'

export function SeatSelectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getTrip, dispatch } = useApp()
  const trip = getTrip(id)
  const [seat, setSeat] = useState<string | null>(trip?.seat ?? null)

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col bg-surface-off">
        <AppHeader back="/trips" title="Select seat" />
        <EmptyState mascot="think" title="Trip not found" action={<Button onClick={() => navigate('/trips')}>Go to Trips</Button>} />
      </div>
    )
  }

  const confirm = () => {
    if (!seat) return
    dispatch({ type: 'UPDATE_TRIP', id: trip.id, patch: { seat } })
    toast(`Seat ${seat} confirmed`)
    navigate(-1)
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader back title="Select seat" subtitle={`${trip.flightNumber} · ${trip.aircraft}`} />
      <PageContainer className="py-4 space-y-4">
        <div className="card p-4">
          <p className="t-label">Selected</p>
          <p className="text-[20px] font-bold text-ink leading-tight">{seat ? `${seat} · ${seatType(seat)}` : 'Tap a seat'}</p>
          <p className="text-[12px] text-ink-muted mt-0.5">Standard seats are included. Preferred seating is complimentary on Flex fares and Gold tier.</p>
        </div>
        <SeatLegend />
        <SeatMap selected={seat} onSelect={setSeat} seed={trip.flightNumber} />
      </PageContainer>
      <StickyCTA>
        <Button size="lg" full disabled={!seat || seat === trip.seat} onClick={confirm}>
          {seat === trip.seat ? `Seat ${seat} is your current seat` : 'Confirm Seat'}
        </Button>
      </StickyCTA>
    </div>
  )
}
