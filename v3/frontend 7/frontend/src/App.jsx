import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import SolutionsGrid from './components/SolutionsGrid.jsx'
import Ecosystem from './components/Ecosystem.jsx'
import ProjectIntelligence from './components/ProjectIntelligence.jsx'
import JourneyFlow from './components/JourneyFlow.jsx'
import PermitNavigator from './components/PermitNavigator.jsx'
import CivilEngineeringHub from './components/CivilEngineeringHub.jsx'
import PowerfulFeatures from './components/PowerfulFeatures.jsx'
import TrustEngine from './components/TrustEngine.jsx'
import SiteMonitoring from './components/SiteMonitoring.jsx'
import MaterialMarket from './components/MaterialMarket.jsx'
import EscrowFinance from './components/EscrowFinance.jsx'
import Stats from './components/Stats.jsx'
import TrustBadges from './components/TrustBadges.jsx'
import FutureOfConstruction from './components/FutureOfConstruction.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import Footer from './components/Footer.jsx'
import LoginPage from './components/LoginPage.jsx'
import SignupPage from './components/SignupPage.jsx'
import OAuthCallback from './components/OAuthCallback.jsx'
import CompleteProfilePage from './components/CompleteProfilePage.jsx'
import OwnerDashboard from './dashboard/homeowner/HomeownerDashboard.jsx'
import ContractorDashboard from './screens/contractor/ContractorDashboard.jsx'
import ContractorProfileDetails from './screens/contractor/ContractorProfileDetails.jsx'
import SupplierDashboard from './screens/supplier/SupplierDashboard.jsx'
import { logoutUser } from './redux/authSlice.js'

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-cream">
      <Navbar />
      <main>
        <Hero />
        <SolutionsGrid />
        <Ecosystem />
        <ProjectIntelligence />
        <JourneyFlow />
        <PermitNavigator />
        <CivilEngineeringHub />
        <PowerfulFeatures />
        <TrustEngine />
        <SiteMonitoring />
        <MaterialMarket />
        <EscrowFinance />
        <Stats />
        <TrustBadges />
        <FutureOfConstruction />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

function rolePath(role) {
  if (role === 'CONTRACTOR') return '/contractor'
  if (role === 'SUPPLIER') return '/supplier'
  return '/owner'
}

function ProtectedRoute({ roles, children }) {
  const { user, accessToken } = useSelector((state) => state.auth)
  if (!accessToken || !user) return <Navigate to="/login" replace />
  if (roles?.length && !roles.includes(user.role)) return <Navigate to={rolePath(user.role)} replace />
  return children
}

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const logoutExpiredSession = () => {
      dispatch(logoutUser())
    }
    window.addEventListener('gharbano_auth_expired', logoutExpiredSession)
    return () => window.removeEventListener('gharbano_auth_expired', logoutExpiredSession)
  }, [dispatch])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route
          path="/complete-profile"
          element={<ProtectedRoute roles={['OWNER', 'CONTRACTOR', 'SUPPLIER']}><CompleteProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/owner/*"
          element={<ProtectedRoute roles={['OWNER']}><OwnerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/contractors/:contractorId"
          element={<ProtectedRoute roles={['OWNER', 'CONTRACTOR', 'SUPPLIER']}><ContractorProfileDetails /></ProtectedRoute>}
        />
        <Route
          path="/contractor/*"
          element={<ProtectedRoute roles={['CONTRACTOR']}><ContractorDashboard /></ProtectedRoute>}
        />
        <Route
          path="/supplier/*"
          element={<ProtectedRoute roles={['SUPPLIER']}><SupplierDashboard /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
