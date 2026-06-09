import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, ShieldCheck, BadgeCheck, Lock, ArrowRight, PlayCircle,
  TrendingUp, Activity, AlertTriangle, Calculator, MapPin, Ruler,
} from 'lucide-react'
import AISearchBar from './AISearchBar.jsx'
import HeroVideo from './HeroVideo.jsx'
import PincodeAreaHint from './common/PincodeAreaHint.jsx'
import { usePincodeAreaLookup } from '../hooks/usePincodeAreaLookup.js'

const BADGES = [
  { icon: Sparkles, label: 'AI-Powered' },
  { icon: ShieldCheck, label: 'Transparent' },
  { icon: BadgeCheck, label: 'Verified Network' },
  { icon: Lock, label: 'Secure Payments' },
]

function HealthRing() {
  const pct = 92
  const r = 30
  const c = 2 * Math.PI * r
  return (
    <div className="glass-card absolute right-4 top-4 w-[208px] rounded-2xl bg-forest-900/95 p-4 text-white shadow-float">
      <p className="text-[11px] font-semibold text-white/70">Project Health Score</p>
      <div className="mt-2 flex items-center gap-3">
        <svg viewBox="0 0 80 80" className="h-[68px] w-[68px] -rotate-90">
          <circle cx="40" cy="40" r={r} stroke="rgba(255,255,255,0.15)" strokeWidth="7" fill="none" />
          <motion.circle
            cx="40" cy="40" r={r} stroke="#34d17a" strokeWidth="7" fill="none" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c - (c * pct) / 100 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        </svg>
        <div className="-rotate-0">
          <span className="font-display text-3xl font-extrabold leading-none">92</span>
          <span className="text-xs text-white/60">/100</span>
        </div>
      </div>
      <p className="mt-1 text-sm font-semibold text-neon">On Track</p>
      <p className="text-[11px] text-white/60">Everything looks good</p>
    </div>
  )
}

function MiniCard({ icon: Icon, title, children, className }) {
  return (
    <div className={`glass-card w-[200px] rounded-2xl p-3.5 shadow-float ${className}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold text-graphite/60">
        <Icon className="h-4 w-4 text-forest-600" />
        {title}
      </div>
      {children}
    </div>
  )
}

const estimateInitialValues = {
  buildingType: '',
  floors: 'Ground + 1',
  landArea: '1200',
  budget: '25 - 30 Lakhs',
  pincode: '',
  area: '',
  constructionType: 'CONTRACTOR',
}

function ConstructionEstimateWidget() {
  const navigate = useNavigate()
  const [estimateDetails, setEstimateDetails] = useState(() => {
    const savedEstimate = localStorage.getItem('gharbano_pending_estimate')
    return savedEstimate ? { ...estimateInitialValues, ...JSON.parse(savedEstimate) } : estimateInitialValues
  })
  const [areaConverterDetails, setAreaConverterDetails] = useState({
    gaj: '',
    squareFeet: '',
  })

  const gajToSquareFeet = Number(areaConverterDetails.gaj || 0) * 9
  const squareFeetToSquareYard = Number(areaConverterDetails.squareFeet || 0) / 9

  const updateEstimateField = (field, value) => {
    setEstimateDetails((currentEstimateDetails) => ({ ...currentEstimateDetails, [field]: value }))
  }
  const applyResolvedArea = useCallback((areaDetails) => {
    setEstimateDetails((currentEstimateDetails) => ({
      ...currentEstimateDetails,
      pincode: areaDetails.pincode || currentEstimateDetails.pincode,
      area: areaDetails.display || currentEstimateDetails.area,
    }))
  }, [])
  const pincodeLookupState = usePincodeAreaLookup(estimateDetails.pincode, applyResolvedArea)

  const saveEstimateAndLogin = (event) => {
    event.preventDefault()
    localStorage.setItem('gharbano_pending_estimate', JSON.stringify({
      ...estimateDetails,
      savedAt: new Date().toISOString(),
    }))
    navigate('/signup?role=OWNER')
  }

  return (
    <div className="container-x relative z-20 mt-2">
      <form onSubmit={saveEstimateAndLogin} className="rounded-2xl border border-forest-100 bg-white/92 p-5 text-graphite shadow-float ring-1 ring-white/70 backdrop-blur-md md:p-6">
        <div>
          <span className="eyebrow mb-3">Estimate Calculator</span>
          <h2 className="font-display text-xl font-extrabold text-forest-900">Calculate Your Construction Estimate</h2>
          <p className="mt-1 text-sm text-graphite/60">Get instant estimate for your construction project</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1.2fr_1.2fr_0.9fr_1.1fr_auto]">
          <label className="block">
            <span className="text-xs font-bold text-graphite/70">Building Type</span>
            <select
              value={estimateDetails.buildingType}
              onChange={(event) => updateEstimateField('buildingType', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-forest-100 bg-cream/35 px-3 text-sm font-semibold text-graphite outline-none transition focus:border-forest-400 focus:bg-white"
            >
              <option value="">Select Type</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="VILLA">Villa</option>
              <option value="DUPLEX">Duplex</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-graphite/70">No. of Floors</span>
            <select
              value={estimateDetails.floors}
              onChange={(event) => updateEstimateField('floors', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-forest-100 bg-cream/35 px-3 text-sm font-semibold text-graphite outline-none transition focus:border-forest-400 focus:bg-white"
            >
              <option>Ground</option>
              <option>Ground + 1</option>
              <option>Ground + 2</option>
              <option>Ground + 3</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-graphite/70">Land Area</span>
            <div className="mt-2 flex h-11 overflow-hidden rounded-lg border border-forest-100 bg-cream/35 transition focus-within:border-forest-400 focus-within:bg-white">
              <input
                type="number"
                value={estimateDetails.landArea}
                onChange={(event) => updateEstimateField('landArea', event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-graphite outline-none"
              />
              <span className="grid w-14 place-items-center border-l border-forest-100 bg-forest-50 text-xs font-bold text-forest-700">sq ft</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-graphite/70">Budget</span>
            <select
              value={estimateDetails.budget}
              onChange={(event) => updateEstimateField('budget', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-forest-100 bg-cream/35 px-3 text-sm font-semibold text-graphite outline-none transition focus:border-forest-400 focus:bg-white"
            >
              <option>10 - 15 Lakhs</option>
              <option>15 - 25 Lakhs</option>
              <option>25 - 30 Lakhs</option>
              <option>30 - 50 Lakhs</option>
              <option>50 Lakhs+</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-graphite/70">Pincode</span>
            <input
              value={estimateDetails.pincode}
              onChange={(event) => updateEstimateField('pincode', event.target.value)}
              placeholder="110001"
              className="mt-2 h-11 w-full rounded-lg border border-forest-100 bg-cream/35 px-3 text-sm font-semibold text-graphite outline-none transition placeholder:text-graphite/35 focus:border-forest-400 focus:bg-white"
            />
            <PincodeAreaHint lookupState={pincodeLookupState} />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-graphite/70">Construction Type</span>
            <select
              value={estimateDetails.constructionType}
              onChange={(event) => updateEstimateField('constructionType', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-forest-100 bg-cream/35 px-3 text-sm font-semibold text-graphite outline-none transition focus:border-forest-400 focus:bg-white"
            >
              <option value="CONTRACTOR">Contractor Based</option>
              <option value="SELF_CONSTRUCTION">Self Construction</option>
            </select>
          </label>

          <button className="mt-auto h-11 rounded-lg bg-forest-700 px-5 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-float">
            Get Estimate <ArrowRight className="ml-1 inline h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-forest-100 bg-cream/45 p-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto]">
            <div className="rounded-xl border border-forest-100 bg-white p-3">
              <label className="flex items-center gap-2 text-xs font-bold text-graphite/65">
                <Ruler className="h-4 w-4 text-forest-600" /> Gaj to Sq Ft
              </label>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={areaConverterDetails.gaj}
                  onChange={(event) => setAreaConverterDetails({ ...areaConverterDetails, gaj: event.target.value })}
                  placeholder="Gaj"
                  className="h-10 rounded-lg border border-forest-100 bg-cream/35 px-3 text-sm font-semibold outline-none focus:border-forest-400 focus:bg-white"
                />
                <span className="text-xs font-bold text-forest-700">=</span>
                <output className="grid h-10 place-items-center rounded-lg border border-forest-100 bg-forest-50 px-3 text-sm font-bold text-forest-800">
                  {areaConverterDetails.gaj ? gajToSquareFeet.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'} sq ft
                </output>
              </div>
            </div>

            <div className="rounded-xl border border-forest-100 bg-white p-3">
              <label className="flex items-center gap-2 text-xs font-bold text-graphite/65">
                <Ruler className="h-4 w-4 text-forest-600" /> Sq Ft to Sq Yard
              </label>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={areaConverterDetails.squareFeet}
                  onChange={(event) => setAreaConverterDetails({ ...areaConverterDetails, squareFeet: event.target.value })}
                  placeholder="Sq ft"
                  className="h-10 rounded-lg border border-forest-100 bg-cream/35 px-3 text-sm font-semibold outline-none focus:border-forest-400 focus:bg-white"
                />
                <span className="text-xs font-bold text-forest-700">=</span>
                <output className="grid h-10 place-items-center rounded-lg border border-forest-100 bg-forest-50 px-3 text-sm font-bold text-forest-800">
                  {areaConverterDetails.squareFeet ? squareFeetToSquareYard.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'} sq yd
                </output>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-3 py-3 text-xs font-semibold text-graphite/65"><MapPin className="h-4 w-4 text-forest-600" /> Local Area Converter</span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-3 py-3 text-xs font-semibold text-graphite/65"><Calculator className="h-4 w-4 text-forest-600" /> Material Cost Calculator</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-graphite/50">Conversion used: 1 gaj = 1 square yard = 9 square feet.</p>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-forest-700">
          <Lock className="h-4 w-4 text-gold" /> 100% Free - No Hidden Charges
        </p>
      </form>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-cream to-white pt-[88px]">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-forest-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-neon/10 blur-3xl" />

      <div className="container-x relative grid grid-cols-1 items-center gap-10 pb-8 pt-6 lg:grid-cols-[1.05fr_1fr] lg:pt-10">
        {/* LEFT */}
        <div className="relative z-10 max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="h-display text-4xl leading-[1.05] sm:text-5xl md:text-[3.4rem]"
          >
            Build Smarter.<br />
            Build Safer.<br />
            <span className="text-forest-600">Build for Generations.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-5 max-w-md text-[15px] leading-relaxed text-graphite/65"
          >
            India's AI-Powered Construction Operating System for Homeowners,
            Builders, Engineers &amp; Everyone in the Construction Ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 flex flex-wrap gap-2.5"
          >
            {BADGES.map((b) => (
              <span key={b.label} className="pill">
                <b.icon className="h-3.5 w-3.5 text-forest-600" />
                {b.label}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <a href="#solutions" className="btn-primary">
              Start Your Project <ArrowRight className="h-4 w-4" />
            </a>
            <a href="/login" className="btn-ghost">
              Explore Platform <PlayCircle className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-7 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {[
                'photo-1500648767791-00dcc994a43e',
                'photo-1494790108377-be9c29b29330',
                'photo-1507003211169-0a1dd7228f2d',
                'photo-1438761681033-6461ffad8d80',
              ].map((id) => (
                <img
                  key={id}
                  src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=80&q=80`}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-cream object-cover"
                />
              ))}
            </div>
            <div className="text-xs text-graphite/70">
              <p className="font-semibold text-graphite">
                Trusted by 50,000+ Homeowners &amp; Professionals
              </p>
              <p className="flex items-center gap-1 text-gold">
                ★★★★★ <span className="text-graphite/60">4.8/5 (2,300+ reviews)</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — living dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="relative aspect-[4/3.4] w-full overflow-hidden rounded-[28px] shadow-float ring-1 ring-black/5">
            <HeroVideo />
          </div>

          <HealthRing />

          <motion.div className="absolute right-6 top-[150px] animate-floaty">
            <MiniCard icon={TrendingUp} title="Budget Used">
              <p className="mt-1 text-sm font-bold text-graphite">
                ₹18.6L <span className="text-xs font-medium text-graphite/50">/ ₹35L</span>
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-forest-100">
                <div className="h-full w-[53%] rounded-full bg-forest-500" />
              </div>
              <p className="mt-1 text-right text-[10px] font-semibold text-forest-600">53%</p>
            </MiniCard>
          </motion.div>

          <motion.div className="absolute -right-2 top-[262px] animate-floatySlow">
            <MiniCard icon={Activity} title="Project Progress">
              <p className="mt-1 text-sm font-bold text-graphite">62%</p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-forest-100">
                <div className="h-full w-[62%] rounded-full bg-neon" />
              </div>
            </MiniCard>
          </motion.div>

          <motion.div className="absolute -right-2 bottom-3 animate-floaty">
            <MiniCard icon={AlertTriangle} title="Delay Risk">
              <p className="mt-0.5 text-sm font-bold text-forest-600">Low</p>
              <p className="text-[10px] text-graphite/50">AI Prediction</p>
            </MiniCard>
          </motion.div>
        </motion.div>
      </div>

      <ConstructionEstimateWidget />

      {/* AI assistant search bar overlapping bottom of hero */}
      <div className="container-x relative z-20 -mb-10 translate-y-6">
        <AISearchBar />
      </div>
    </section>
  )
}
