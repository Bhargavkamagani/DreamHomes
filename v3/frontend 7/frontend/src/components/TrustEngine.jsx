import { ShieldCheck, Lock, ScanSearch, UserCheck, Boxes, Ruler, Stamp } from 'lucide-react'
import { Reveal, SectionHeading } from '../lib/ui.jsx'

const TRUST = [
  { icon: ShieldCheck, label: 'RERA Verification', desc: 'Every project checked for RERA compliance.' },
  { icon: Lock, label: 'Escrow Payments', desc: 'Funds released only on verified milestones.' },
  { icon: ScanSearch, label: 'AI Fraud Detection', desc: 'Anomaly detection across money & progress.' },
  { icon: UserCheck, label: 'Verified Contractors', desc: 'Background-checked, rated professionals.' },
  { icon: Boxes, label: 'Verified Suppliers', desc: 'Genuine materials from vetted vendors.' },
  { icon: Ruler, label: 'Verified Engineers', desc: 'Credential-checked civil engineers.' },
  { icon: Stamp, label: 'Verified Permit Experts', desc: 'Trusted local approval facilitators.' },
]

export default function TrustEngine() {
  return (
    <section className="relative overflow-hidden bg-forest-950 py-24 text-white">
      <div className="absolute inset-0 bg-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute -right-32 top-10 h-[400px] w-[400px] rounded-full bg-neon/10 blur-3xl" />
      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow mb-4 border-white/15 bg-white/5 text-neon">The Trust Engine</span>
          <h2 className="h-display text-3xl text-white sm:text-4xl md:text-[2.6rem]">
            Trust is built into <span className="text-neon">every brick.</span>
          </h2>
          <p className="mt-4 text-base text-white/55">
            Fear is the biggest barrier in construction. We engineered trust into every layer of the platform.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TRUST.map((t, i) => (
            <Reveal key={t.label} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-neon/40 hover:bg-white/10">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-neon/15 text-neon transition-colors group-hover:bg-neon group-hover:text-forest-950">
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold">{t.label}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50">{t.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
