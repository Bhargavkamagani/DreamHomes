import { motion } from 'framer-motion'
import {
  HeartPulse, FileCheck2, Clock, ShieldCheck, LineChart, ScanSearch, TrendingDown,
} from 'lucide-react'
import { Reveal, SectionHeading } from '../lib/ui.jsx'

const TILES = [
  { icon: HeartPulse, label: 'Project Health Score', value: '92%', tone: 'good', bar: 92 },
  { icon: FileCheck2, label: 'Approval Probability', value: '87%', tone: 'good', bar: 87 },
  { icon: Clock, label: 'Delay Risk', value: 'Low', tone: 'good' },
  { icon: ShieldCheck, label: 'Budget Safety', value: 'Good', tone: 'good' },
  { icon: TrendingDown, label: 'Material Price Tracker', value: 'Steel ↓ 3%', tone: 'accent' },
  { icon: ScanSearch, label: 'AI Fraud Detection', value: 'No anomalies', tone: 'good' },
]

export default function ProjectIntelligence() {
  return (
    <section className="relative bg-white py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Live Project Intelligence"
          title="Mission control"
          accent="for your construction."
          sub="Real-time signals across approvals, budget, schedule and risk — so you always know what's happening before it becomes a problem."
        />

        <Reveal>
          <div className="mt-12 overflow-hidden rounded-3xl border border-forest-100 bg-forest-950 p-1.5 shadow-float">
            <div className="rounded-[20px] bg-forest-950 p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/80">
                  <LineChart className="h-5 w-5 text-neon" />
                  <span className="text-sm font-semibold">Villa Project · Hyderabad · Live</span>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-neon/15 px-3 py-1 text-xs font-semibold text-neon">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-neon" /> Monitoring
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {TILES.map((t, i) => (
                  <motion.div
                    key={t.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-medium text-white/55">
                      <t.icon className="h-4 w-4 text-neon" /> {t.label}
                    </div>
                    <p
                      className={`mt-2 font-display text-2xl font-extrabold ${
                        t.tone === 'accent' ? 'text-neon' : 'text-white'
                      }`}
                    >
                      {t.value}
                    </p>
                    {t.bar && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${t.bar}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, delay: 0.2 + i * 0.07 }}
                          className="h-full rounded-full bg-neon"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
