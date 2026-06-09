import { motion } from 'framer-motion'
import { Lock, CheckCircle2, Circle, Landmark, Percent, ArrowRight } from 'lucide-react'
import { Reveal } from '../lib/ui.jsx'

const MILESTONES = [
  { label: 'Foundation', amt: '₹6.0L', done: true },
  { label: 'Structure & Slab', amt: '₹9.5L', done: true },
  { label: 'Brickwork & Plaster', amt: '₹7.0L', done: false, active: true },
  { label: 'Finishing & Handover', amt: '₹8.5L', done: false },
]

export default function EscrowFinance() {
  return (
    <section className="bg-white py-24">
      <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Vault visual */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-forest-950 p-8 text-white shadow-float">
            <div className="absolute inset-0 bg-grid opacity-[0.10]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-neon text-forest-950">
                    <Lock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Escrow Vault</p>
                    <p className="text-[11px] text-white/50">Total secured · ₹31.0L</p>
                  </div>
                </div>
                <span className="rounded-full bg-neon/15 px-3 py-1 text-xs font-semibold text-neon">Protected</span>
              </div>

              <div className="mt-6 space-y-2.5">
                {MILESTONES.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      m.active ? 'border-neon/50 bg-neon/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      {m.done ? (
                        <CheckCircle2 className="h-5 w-5 text-neon" />
                      ) : (
                        <Circle className={`h-5 w-5 ${m.active ? 'text-neon' : 'text-white/30'}`} />
                      )}
                      {m.label}
                    </span>
                    <span className={`text-sm font-bold ${m.done ? 'text-neon' : 'text-white/80'}`}>
                      {m.amt}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Copy + finance */}
        <Reveal delay={0.1}>
          <span className="eyebrow mb-4">Escrow & Finance</span>
          <h2 className="h-display text-3xl sm:text-4xl">
            Protected payments. <span className="text-forest-600">Transparent construction.</span>
          </h2>
          <p className="mt-4 text-base text-graphite/60">
            Money sits safely in escrow and is released only when milestones are verified — so your
            funds always match real progress on the ground.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-forest-100 bg-cream p-5">
              <Landmark className="h-6 w-6 text-forest-600" />
              <p className="mt-3 text-sm font-bold text-graphite">Home Loan Offers</p>
              <p className="mt-1 text-xs text-graphite/55">Compare offers from 12 financing partners.</p>
            </div>
            <div className="rounded-2xl border border-forest-100 bg-cream p-5">
              <Percent className="h-6 w-6 text-forest-600" />
              <p className="mt-3 text-sm font-bold text-graphite">EMI Estimation</p>
              <p className="mt-1 text-xs text-graphite/55">Know your monthly outflow before you commit.</p>
            </div>
          </div>

          <a href="/login" className="btn-primary mt-7">
            Explore Financing <ArrowRight className="h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
