import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { ToastProvider } from './components/common/Toast'
import { useApp } from './store/AppContext'

import { OnboardingPage } from './pages/OnboardingPage'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { BookPage } from './pages/BookPage'
import { SearchResultsPage } from './pages/SearchResultsPage'
import { SelectFarePage } from './pages/SelectFarePage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { TripsPage } from './pages/TripsPage'
import { TripDetailPage } from './pages/TripDetailPage'
import { JourneyCompanionPage } from './pages/JourneyCompanionPage'
import { ManageBookingPage } from './pages/ManageBookingPage'
import { CheckInPage } from './pages/CheckInPage'
import { SeatSelectionPage } from './pages/SeatSelectionPage'
import { BoardingPassPage } from './pages/BoardingPassPage'
import { FlightUpdatePage } from './pages/FlightUpdatePage'
import { MilesPage } from './pages/MilesPage'
import { MilesBenefitsPage } from './pages/MilesBenefitsPage'
import { PassportPage } from './pages/PassportPage'
import { MilesActivityPage } from './pages/MilesActivityPage'
import { MilesRewardsPage } from './pages/MilesRewardsPage'
import { MorePage } from './pages/MorePage'
import { FeaturePage } from './pages/FeaturePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { OffersPage } from './pages/OffersPage'
import { DestinationsPage } from './pages/DestinationsPage'
import { FlightStatusPage } from './pages/FlightStatusPage'
import { HelpCenterPage } from './pages/HelpCenterPage'
import { ProfilePage } from './pages/ProfilePage'
import { PrototypePage } from './pages/PrototypePage'
import { NotFoundPage } from './pages/NotFoundPage'

function Gate({ children }: { children: React.ReactElement }) {
  const { state } = useApp()
  const { pathname } = useLocation()
  if (!state.onboardingDone && pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  if (state.onboardingDone && state.auth === 'unknown' && pathname !== '/login' && pathname !== '/onboarding') {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell>
        <Gate>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route path="/fare/:flightId" element={<SelectFarePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation/:tripId" element={<ConfirmationPage />} />

            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
            <Route path="/trips/:id/companion" element={<JourneyCompanionPage />} />
            <Route path="/manage/:id" element={<ManageBookingPage />} />
            <Route path="/checkin/:id" element={<CheckInPage />} />
            <Route path="/seat/:id" element={<SeatSelectionPage />} />
            <Route path="/boarding-pass/:id" element={<BoardingPassPage />} />
            <Route path="/flight-update/:id" element={<FlightUpdatePage />} />

            <Route path="/miles" element={<MilesPage />} />
            <Route path="/miles/benefits" element={<MilesBenefitsPage />} />
            <Route path="/miles/passport" element={<PassportPage />} />
            <Route path="/miles/activity" element={<MilesActivityPage />} />
            <Route path="/miles/rewards" element={<MilesRewardsPage />} />

            <Route path="/more" element={<MorePage />} />
            <Route path="/more/:slug" element={<FeaturePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/flight-status" element={<FlightStatusPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/prototype" element={<PrototypePage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Gate>
      </AppShell>
    </ToastProvider>
  )
}
