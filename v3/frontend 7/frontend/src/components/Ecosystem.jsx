import { useState } from 'react'
import {
  Home, HardHat, Ruler, Truck, Boxes, Stamp, Landmark, ScanEye, Wallet, Wrench, Cpu,
} from 'lucide-react'
import { Reveal, SectionHeading } from '../lib/ui.jsx'

const NODES = [
  { icon: Home, label: 'Homeowners', stat: '50,000+', angle: -90 },
  { icon: HardHat, label: 'Contractors', stat: '3,200+', angle: -54 },
  { icon: Ruler, label: 'Civil Engineers', stat: '8,500+', angle: -18 },
  { icon: Truck, label: 'Equipment Rentals', stat: '1,200+', angle: 18 },
  { icon: Boxes, label: 'Suppliers', stat: '900+', angle: 54 },
  { icon: Stamp, label: 'Permit Experts', stat: '150+', angle: 90 },
  { icon: Wallet, label: 'Escrow', stat: '₹250Cr+', angle: 126 },
  { icon: ScanEye, label: 'AI Monitoring', stat: '24/7', angle: 162 },
  { icon: Landmark, label: 'Financing', stat: '12 partners', angle: 198 },
  { icon: Wrench, label: 'Maintenance', stat: 'Lifelong', angle: 234 },
]

function polar(angle, radius) {
  const rad = (angle * Math.PI) / 180
  return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) }
}

export default function Ecosystem() {
  const [active, setActive] = useState(null)
  const R = 41

  return (
    <section className="relative overflow-hidden bg-forest-950 py-24 text-white">
      <div className="absolute inset-0 bg-grid opacity-[0.12]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-3xl" />

      <div className="container-x relative">
        <SectionHeading
          eyebrow="The Construction Ecosystem"
          title="One intelligent engine."
          accent="Every player connected."
          sub="GharBanao links every participant in the construction journey into a single, living network — orchestrated by AI."
        />

        <div className="relative mx-auto mt-14 aspect-square w-full max-w-[640px]">
          {/* connecting lines */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {NODES.map((n) => {
              const p = polar(n.angle, R)
              const on = active === n.label
              return (
                <line
                  key={n.label}
                  x1="50" y1="50" x2={p.x} y2={p.y}
                  stroke={on ? '#34d17a' : 'rgba(52,209,122,0.25)'}
                  strokeWidth={on ? 0.7 : 0.4}
                  strokeDasharray="2 2"
                  className="animate-flowDash"
                />
              )
            })}
          </svg>

          {/* center node */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="grid h-28 w-28 place-items-center rounded-full bg-neon/15 ring-1 ring-neon/40 animate-pulseRing">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-forest-800 text-center shadow-glow">
                <div>
                  <Cpu className="mx-auto h-6 w-6 text-neon" />
                  <span className="mt-1 block text-[9px] font-bold leading-tight text-white">
                    GharBanao<br />AI Engine
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* satellite nodes */}
          {NODES.map((n) => {
            const p = polar(n.angle, R)
            const on = active === n.label
            return (
              <button
                key={n.label}
                onMouseEnter={() => setActive(n.label)}
                onMouseLeave={() => setActive(null)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className={`grid h-14 w-14 place-items-center rounded-2xl border transition-all duration-300 sm:h-16 sm:w-16 ${
                    on
                      ? 'scale-110 border-neon bg-forest-700 shadow-glow'
                      : 'border-white/10 bg-white/5 backdrop-blur-sm'
                  }`}
                >
                  <n.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${on ? 'text-neon' : 'text-white/80'}`} />
                </div>
                <div className="mt-1.5 text-center">
                  <p className="text-[10px] font-semibold leading-tight text-white/90 sm:text-xs">
                    {n.label}
                  </p>
                  <p
                    className={`text-[9px] font-bold transition-colors sm:text-[10px] ${
                      on ? 'text-neon' : 'text-white/40'
                    }`}
                  >
                    {n.stat}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <Reveal>
          <p className="mx-auto mt-10 max-w-xl text-center text-sm text-white/50">
            Hover any node to see how the AI engine routes work, payments and intelligence
            between every participant in real time.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
