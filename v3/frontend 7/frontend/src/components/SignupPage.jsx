import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  Eye,
  EyeOff,
  Globe2,
  HardHat,
  Home,
  Leaf,
  Lock,
  Mail,
  Phone,
  SendHorizontal,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react'
import Logo from './Logo.jsx'
import PincodeAreaHint from './common/PincodeAreaHint.jsx'
import { usePincodeAreaLookup } from '../hooks/usePincodeAreaLookup.js'
import { signupWithProfile } from '../redux/authSlice.js'
import { googleOAuthUrl, microsoftOAuthUrl } from '../services/oauthService.js'

const ROLES = [
  { icon: Home, title: 'Homeowner', desc: 'Plan your dream home' },
  { icon: HardHat, title: 'Builder', desc: 'Grow your business' },
  { icon: Truck, title: 'Supplier', desc: 'Deliver quality materials' },
]

function SocialMark({ type }) {
  if (type === 'google') {
    return <span className="mr-2 text-sm font-black text-[#4285f4]">G</span>
  }
  return (
    <span className="mr-2 grid h-4 w-4 grid-cols-2 gap-0.5">
      <span className="bg-[#f25022]" />
      <span className="bg-[#7fba00]" />
      <span className="bg-[#00a4ef]" />
      <span className="bg-[#ffb900]" />
    </span>
  )
}

export default function SignupPage() {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'CONTRACTOR'
    ? 'Builder'
    : searchParams.get('role') === 'SUPPLIER'
      ? 'Supplier'
      : 'Homeowner'
  const [role, setRole] = useState(initialRole)
  const [profileDetails, setProfileDetails] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    pincode: '',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [signupAlert, setSignupAlert] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const applyResolvedArea = useCallback((areaDetails) => {
    setProfileDetails((currentProfileDetails) => ({
      ...currentProfileDetails,
      address: areaDetails.display || currentProfileDetails.address,
      pincode: areaDetails.pincode || currentProfileDetails.pincode,
    }))
  }, [])
  const pincodeLookupState = usePincodeAreaLookup(profileDetails.pincode, applyResolvedArea)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, errorMessage } = useSelector((state) => state.auth)

  const selectedApiRole = role === 'Builder' ? 'CONTRACTOR' : role === 'Supplier' ? 'SUPPLIER' : 'OWNER'

  const updateProfileField = (field, value) => {
    setSignupAlert('')
    setProfileDetails((currentProfileDetails) => ({ ...currentProfileDetails, [field]: value }))
  }

  const validateSignupForm = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneDigits = profileDetails.phone.replace(/\D/g, '')
    const pincodeDigits = profileDetails.pincode.replace(/\D/g, '')

    if (profileDetails.name.trim().length < 2) return 'Enter your full name.'
    if (!emailPattern.test(profileDetails.email.trim())) return 'Enter a valid email address.'
    if (phoneDigits.length < 10) return 'Enter a valid phone number.'
    if (profileDetails.address.trim().length < 5) return 'Enter your complete address.'
    if (pincodeDigits.length < 5) return 'Enter a valid pincode / zip code.'
    if (profileDetails.password.length < 8) return 'Password must be at least 8 characters.'
    if (!acceptedTerms) return 'Please accept the Terms of Service and Privacy Policy.'
    return ''
  }

  const submitSignup = async (event) => {
    event.preventDefault()
    const validationMessage = validateSignupForm()
    if (validationMessage) {
      setSignupAlert(validationMessage)
      return
    }

    const result = await dispatch(signupWithProfile({
      ...profileDetails,
      name: profileDetails.name.trim(),
      email: profileDetails.email.trim().toLowerCase(),
      phone: profileDetails.phone.trim(),
      address: profileDetails.address.trim(),
      pincode: profileDetails.pincode.trim(),
      role: selectedApiRole,
      building_type: 'RESIDENTIAL',
      construction_type: 'CONTRACTOR',
      budget: 0,
      land_area: 0,
      floors: 1,
      company_name: profileDetails.name,
      license_number: '',
      experience_years: 0,
      store_name: profileDetails.name,
      categories: '',
    }))
    if (!result.payload?.user) {
      setSignupAlert(result.payload || errorMessage || 'Unable to create account.')
      return
    }
    const profileIsIncomplete = result.payload.user.profile_complete === false || selectedApiRole === 'CONTRACTOR'
    navigate(profileIsIncomplete ? '/complete-profile' : selectedApiRole === 'CONTRACTOR' ? '/contractor' : selectedApiRole === 'SUPPLIER' ? '/supplier' : '/owner')
  }

  return (
    <main className="relative grid min-h-screen grid-rows-[70px_minmax(0,1fr)] overflow-hidden bg-cream text-graphite">
      <img src="/login-background.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,244,236,0.68)_0%,rgba(247,244,236,0.46)_45%,rgba(247,244,236,0.30)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_58%_0%,rgba(255,255,255,0.72),transparent_34%)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-[48%] bg-grid opacity-30" />

      <header className="relative z-10 flex items-center justify-between px-6 lg:px-10">
        <Logo />
        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 items-center gap-2 rounded-full bg-white/85 px-4 text-sm font-semibold shadow-sm ring-1 ring-black/10 backdrop-blur">
            <Globe2 className="h-4 w-4" /> English
          </button>
          <a href="/" className="inline-flex h-9 items-center gap-2 rounded-full bg-white/85 px-4 text-sm font-semibold shadow-sm ring-1 ring-black/10 backdrop-blur">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </a>
        </div>
      </header>

      <section className="relative z-10 grid min-h-0 grid-cols-1 items-center gap-6 px-6 pb-6 lg:grid-cols-[minmax(0,1fr)_500px] lg:px-10">
        <div className="max-w-[620px]">
          <h1 className="h-display text-[clamp(2.5rem,4.4vw,4rem)] leading-[1.08] text-forest-950">
            Build with trust.<br />Serve for generations.
          </h1>
          <div className="mt-4 h-1 w-14 bg-forest-600" />
          <p className="mt-4 max-w-[470px] text-base leading-relaxed text-graphite/80">
            Join the connected platform for Homeowners, Builders and Suppliers. One ecosystem.
            Shared intelligence. Stronger homes. Better India.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {ROLES.map((item) => (
              <div key={item.title} className="flex min-w-[132px] items-center gap-2.5 rounded-xl bg-white/70 px-3 py-2 shadow-sm ring-1 ring-white/70 backdrop-blur">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-forest-50 text-forest-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold">{item.title}</span>
                  <span className="block text-[9px] text-graphite/65">{item.desc}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-16 grid max-w-[250px] grid-cols-2 gap-2">
            {['RERA', 'BUILDING PERMIT'].map((label, index) => (
              <div key={label} className="rounded-xl bg-forest-900/68 p-3 text-center text-white shadow-soft backdrop-blur">
                <p className="text-base font-black leading-tight">{label}</p>
                <p className="text-[10px] font-semibold">{index === 0 ? 'COMPLIANT' : 'VERIFIED'}</p>
                <BadgeCheck className={`mx-auto mt-1.5 h-6 w-6 ${index === 0 ? 'text-neon' : 'text-sky-400'}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full justify-self-start">
          <div className="rounded-2xl bg-white/94 p-6 shadow-float ring-1 ring-black/10 backdrop-blur-md">
            <h2 className="font-display text-3xl font-extrabold leading-tight text-graphite">
              Start your journey <Leaf className="inline h-7 w-7 fill-forest-500 text-forest-500" />
            </h2>
            <p className="mt-1.5 text-sm text-graphite/70">Create your account and build with confidence.</p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {ROLES.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setRole(item.title)}
                  className={`rounded-xl border px-2 py-3 text-center transition-colors ${
                    role === item.title
                      ? 'border-forest-600 bg-forest-50 text-forest-800'
                      : 'border-forest-100 bg-white text-graphite/65 hover:border-forest-300'
                  }`}
                >
                  <item.icon className="mx-auto h-5 w-5" />
                  <span className="mt-1.5 block text-xs font-bold">{item.title}</span>
                </button>
              ))}
            </div>

            <form onSubmit={submitSignup} className="mt-4 space-y-3">
              {(signupAlert || errorMessage) && (
                <div className="rounded-xl border border-warm/20 bg-warm/10 px-4 py-3 text-sm font-semibold text-warm">
                  {signupAlert || errorMessage}
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold">Full Name</span>
                  <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-3">
                    <UserRound className="h-4 w-4 text-graphite/45" />
                    <input type="text" required value={profileDetails.name} onChange={(event) => updateProfileField('name', event.target.value)} placeholder="Your name" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
                  </span>
                </label>
                <label className="block">
                  <span className="text-xs font-bold">Phone Number</span>
                  <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-3">
                    <Phone className="h-4 w-4 text-graphite/45" />
                    <input type="tel" required value={profileDetails.phone} onChange={(event) => updateProfileField('phone', event.target.value)} placeholder="+91 98765 43210" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
                  </span>
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-bold">Email Address</span>
                <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-3">
                  <Mail className="h-4 w-4 text-graphite/45" />
                  <input type="email" required value={profileDetails.email} onChange={(event) => updateProfileField('email', event.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
                </span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold">Address</span>
                  <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-3">
                    <input required value={profileDetails.address} onChange={(event) => updateProfileField('address', event.target.value)} placeholder="Street address" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
                  </span>
                </label>
                <label className="block">
                  <span className="text-xs font-bold">Pincode</span>
                  <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-3">
                    <input required value={profileDetails.pincode} onChange={(event) => updateProfileField('pincode', event.target.value)} placeholder="500001" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
                  </span>
                  <PincodeAreaHint lookupState={pincodeLookupState} />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-bold">Create Password</span>
                <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-3">
                  <Lock className="h-4 w-4 text-graphite/45" />
                  <input type={showPassword ? 'text' : 'password'} required value={profileDetails.password} onChange={(event) => updateProfileField('password', event.target.value)} placeholder="Create a strong password" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-graphite/45 transition hover:bg-forest-50 hover:text-forest-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              <label className="flex items-start gap-2 text-[11px] leading-relaxed text-graphite/70">
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => { setAcceptedTerms(event.target.checked); setSignupAlert('') }} className="mt-0.5 h-4 w-4 rounded border-forest-200" />
                I agree to the Terms of Service and Privacy Policy.
              </label>

              <button type="submit" className="btn-primary h-11 w-full rounded-lg text-sm">
                {status === 'loading' ? 'Creating account...' : 'Create account'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="my-4 flex items-center gap-4 text-[11px] text-graphite/55">
              <span className="h-px flex-1 bg-forest-100" /> or continue with <span className="h-px flex-1 bg-forest-100" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={googleOAuthUrl(selectedApiRole)}
                className="flex items-center justify-center rounded-lg border border-forest-100 bg-white py-2.5 text-sm font-semibold"
              >
                <SocialMark type="google" /> Google
              </a>
              <a
                href={microsoftOAuthUrl(selectedApiRole)}
                className="flex items-center justify-center rounded-lg border border-forest-100 bg-white py-2.5 text-sm font-semibold"
              >
                <SocialMark type="microsoft" /> Microsoft
              </a>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-lg border border-forest-100 bg-cream/70 px-4 py-2.5 text-xs text-graphite/70">
              <ShieldCheck className="h-4 w-4 shrink-0 fill-forest-700 text-forest-700" />
              Your data is protected with enterprise-grade security.
            </div>

            <p className="mt-4 text-center text-xs">
              Already have an account? <a href="/login" className="font-bold text-forest-700">Sign in <ArrowRight className="inline h-4 w-4" /></a>
            </p>
          </div>

          <form className="mt-3 flex h-11 items-center rounded-xl bg-white/88 px-4 shadow-card ring-1 ring-white/70 backdrop-blur">
            <span className="flex items-center gap-2 border-r border-forest-100 pr-4 text-xs font-bold text-forest-700">
              <Bot className="h-4 w-4" /> Ask AI
            </span>
            <input
              aria-label="Ask AI"
              placeholder="Estimate my 1200 sqft house in Hyderabad"
              className="min-w-0 flex-1 bg-transparent px-4 text-xs outline-none placeholder:text-graphite/50"
            />
            <button className="grid h-7 w-7 place-items-center rounded-lg bg-forest-700 text-white">
              <SendHorizontal className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
