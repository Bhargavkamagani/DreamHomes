import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { Reveal, SectionHeading } from '../lib/ui.jsx'

const MATERIALS = [
  { name: 'Cement (OPC 53)', price: '₹385', unit: '/bag', change: -2.1, up: false },
  { name: 'TMT Steel (Fe500)', price: '₹54,200', unit: '/tonne', change: -3.0, up: false },
  { name: 'River Sand', price: '₹62', unit: '/cft', change: 1.4, up: true },
  { name: 'Red Bricks', price: '₹8.5', unit: '/pc', change: 0.6, up: true },
  { name: 'Vitrified Tiles', price: '₹48', unit: '/sqft', change: -1.2, up: false },
  { name: 'M-Sand', price: '₹45', unit: '/cft', change: 0.0, up: true },
]

const TICKER = [
  'Steel ↓ 3% this week', 'Cement stable in Hyderabad', 'Sand ↑ 1.4% in Telangana',
  'Best tile deals in Bengaluru', 'Aggregate prices easing', 'Bulk discounts available',
]

export default function MaterialMarket() {
  return (
    <section className="bg-cream py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Live Material Market"
          title="Buy at the right price."
          accent="Every single day."
          sub="Track real-time material prices, regional trends and supplier competition — and never overpay again."
        />
      </div>

      {/* ticker */}
      <div className="relative mt-10 overflow-hidden border-y border-forest-100 bg-forest-900 py-3">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-sm font-medium text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" /> {t}
            </span>
          ))}
        </div>
      </div>

      <div className="container-x">
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MATERIALS.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.05}>
              <div className="flex items-center justify-between rounded-2xl border border-forest-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float">
                <div>
                  <p className="text-sm font-semibold text-graphite">{m.name}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-graphite">
                    {m.price}
                    <span className="text-sm font-medium text-graphite/40">{m.unit}</span>
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                    m.up ? 'bg-warm/10 text-warm' : 'bg-forest-50 text-forest-600'
                  }`}
                >
                  {m.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {m.change > 0 ? '+' : ''}{m.change}%
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-8 text-center">
            <a href="/login" className="btn-primary">
              Explore Material Market <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
