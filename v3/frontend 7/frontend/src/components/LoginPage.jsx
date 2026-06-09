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
  SendHorizontal,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { loginWithCredentials } from '../redux/authSlice.js'
import { googleOAuthUrl, microsoftOAuthUrl } from '../services/oauthService.js'

const ROLES = [
  { icon: Home, title: 'Homeowner', desc: 'Plan your dream home', tone: 'text-forest-700 bg-forest-50' },
  { icon: HardHat, title: 'Builder', desc: 'Grow your business', tone: 'text-gold bg-gold/10' },
  { icon: Truck, title: 'Supplier', desc: 'Deliver quality materials', tone: 'text-forest-700 bg-forest-50' },
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

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, errorMessage } = useSelector((state) => state.auth)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const submitLogin = async (event) => {
    event.preventDefault()
    const result = await dispatch(loginWithCredentials(credentials))
    if (!result.payload?.user) return
    const role = result.payload.user.role
    const profileIsIncomplete = result.payload.user.profile_complete === false
    navigate(profileIsIncomplete ? '/complete-profile' : role === 'CONTRACTOR' ? '/contractor' : role === 'SUPPLIER' ? '/supplier' : '/owner')
  }

  return (
    <main className="relative grid h-screen grid-rows-[70px_minmax(0,1fr)] overflow-hidden bg-cream text-graphite">
      <img src="/login-background.png" alt="" className="absolute inset-0 h-full w-full object-fill opacity-90" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,244,236,0.62)_0%,rgba(247,244,236,0.42)_45%,rgba(247,244,236,0.30)_100%)]" />
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

      <section className="relative z-10 grid min-h-0 grid-cols-[minmax(0,1fr)_480px] items-center gap-6 px-6 lg:px-10">
        <div className="max-w-[620px]">
          <h1 className="h-display text-[clamp(2.5rem,4.4vw,4rem)] leading-[1.08] text-forest-950">
            Build with trust.<br />Serve for generations.
          </h1>
          <div className="mt-4 h-1 w-14 bg-forest-600" />
          <p className="mt-4 max-w-[470px] text-base leading-relaxed text-graphite/80">
            The connected platform for Homeowners, Builders and Suppliers. One ecosystem. Shared intelligence. Stronger homes. Better India.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {ROLES.map((role) => (
              <div key={role.title} className="flex min-w-[132px] items-center gap-2.5 rounded-xl bg-white/70 px-3 py-2 shadow-sm ring-1 ring-white/70 backdrop-blur">
                <span className={`grid h-9 w-9 place-items-center rounded-full ${role.tone}`}>
                  <role.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold">{role.title}</span>
                  <span className="block text-[9px] text-graphite/65">{role.desc}</span>
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
              Welcome back <Leaf className="inline h-7 w-7 fill-forest-500 text-forest-500" />
            </h2>
            <p className="mt-1.5 text-sm text-graphite/70">Sign in to continue building a better future.</p>

            <form
              className="mt-5 space-y-3.5"
              onSubmit={submitLogin}
            >
              <label className="block">
                <span className="text-xs font-bold">Email Address</span>
                <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-4">
                  <Mail className="h-4 w-4 text-graphite/45" />
                  <input type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
                </span>
              </label>
              <label className="block">
                <span className="text-xs font-bold">Password</span>
                <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-4">
                  <Lock className="h-4 w-4 text-graphite/45" />
                  <input type={showPassword ? 'text' : 'password'} value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} placeholder="Enter your password" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
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

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-graphite/70">
                  <input type="checkbox" className="h-4 w-4 rounded border-forest-200" /> Remember me
                </label>
                <a href="/login" className="font-semibold text-forest-700">Forgot password?</a>
              </div>

              <button type="submit" className="btn-primary h-11 w-full rounded-lg text-sm">
                {status === 'loading' ? 'Signing in...' : 'Sign in'} <ArrowRight className="h-4 w-4" />
              </button>
              {errorMessage && <p className="text-xs font-semibold text-warm">{errorMessage}</p>}
            </form>

            <div className="my-4 flex items-center gap-4 text-[11px] text-graphite/55">
              <span className="h-px flex-1 bg-forest-100" /> or continue with <span className="h-px flex-1 bg-forest-100" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={googleOAuthUrl('OWNER')}
                className="flex items-center justify-center rounded-lg border border-forest-100 bg-white py-2.5 text-sm font-semibold"
              >
                <SocialMark type="google" /> Google
              </a>
              <a
                href={microsoftOAuthUrl('OWNER')}
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
              New to GharBanao? <a href="/signup" className="font-bold text-forest-700">Choose your journey <ArrowRight className="inline h-4 w-4" /></a>
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
