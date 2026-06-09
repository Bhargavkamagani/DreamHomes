import { motion } from 'framer-motion'
import {
  ClipboardList, FileCheck2, Users, ShoppingBag, HardHat, Settings, PlayCircle,
  Brain, FileSpreadsheet, Stamp, Ruler, Truck, Lock, ScanEye, Home,
} from 'lucide-react'
import { Reveal, SectionHeading } from '../lib/ui.jsx'

const BAND = [
  { icon: ClipboardList, title: 'Plan & Estimate', sub: 'AI-powered planning & BOQ generation' },
  { icon: FileCheck2, title: 'Approvals', sub: 'AI Permit Navigator & Expert Assistance' },
  { icon: Users, title: 'Hire & Connect', sub: 'Contractors, Engineers & Experts' },
  { icon: ShoppingBag, title: 'Buy & Rent', sub: 'Materials & Equipment Marketplace' },
  { icon: HardHat, title: 'Build & Track', sub: 'AI Monitoring, Milestone & Payments' },
  { icon: Settings, title: 'Maintain', sub: 'Post-construction Care & Support' },
]

const JOURNEY = [
  { icon: Brain, title: 'AI understands your project' },
  { icon: FileSpreadsheet, title: 'BOQ generated automatically' },
  { icon: Stamp, title: 'Permit experts assist' },
  { icon: Users, title: 'Contractors matched' },
  { icon: Ruler, title: 'Civil engineers hired' },
  { icon: Truck, title: 'Equipment rented' },
  { icon: Lock, title: 'Escrow activated' },
  { icon: ScanEye, title: 'AI monitors construction' },
  { icon: Home, title: 'Home maintained for years' },
]

export default function JourneyFlow() {
  return (
    <section id="journey" className="scroll-mt-24 bg-white py-16">
      <div className="container-x">
        {/* Green band (screenshot) */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-forest-900 p-8 text-white shadow-float sm:p-10">
            <div className="absolute inset-0 bg-grid opacity-[0.10]" />
            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr] lg:items-center">
              <div>
                <h3 className="font-display text-2xl font-extrabold leading-tight sm:text-[1.7rem]">
                  From Planning to Possession, We've Got You Covered
                </h3>
                <p className="mt-3 text-sm text-white/65">
                  A complete 360° solution for every step of your construction journey.
                </p>
                <a
                  href="#features"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  How It Works <PlayCircle className="h-4 w-4" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
                {BAND.map((s, i) => (
                  <div key={s.title} className="relative text-center">
                    {i < BAND.length - 1 && (
                      <span className="absolute left-1/2 top-7 hidden h-px w-full border-t border-dashed border-neon/40 lg:block" />
                    )}
                    <div className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-forest-800">
                      <s.icon className="h-6 w-6 text-neon" />
                    </div>
                    <p className="mt-2.5 text-xs font-bold">{s.title}</p>
                    <p className="mt-1 text-[10px] leading-tight text-white/50">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Cinematic 9-step homeowner journey (vision §4) */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="The Homeowner Experience"
            title="Nine steps."
            accent="One seamless journey."
            sub="From the first idea to a home cared for over decades — GharBanao guides every stage."
          />

          <div className="mt-12 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
            {JOURNEY.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative w-[180px] shrink-0 rounded-2xl border border-forest-100 bg-cream p-5 transition-all duration-300 hover:-translate-y-1 hover:border-forest-300 hover:bg-white hover:shadow-card"
              >
                <span className="font-display text-3xl font-extrabold text-forest-200 transition-colors group-hover:text-forest-400">
                  0{i + 1}
                </span>
                <s.icon className="mt-3 h-6 w-6 text-forest-600" />
                <p className="mt-2 text-sm font-semibold leading-snug text-graphite">{s.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
