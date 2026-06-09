import { motion } from 'framer-motion'
import { UploadCloud, CheckCircle2, FileText, ArrowRight, BadgeCheck } from 'lucide-react'
import { Reveal, SectionHeading } from '../lib/ui.jsx'

const CHECKS = [
  { label: 'Setback compliance', value: 'Within limits' },
  { label: 'Zoning classification', value: 'Residential R2' },
  { label: 'FSI utilisation', value: '1.8 / 2.0 allowed' },
  { label: 'Road width', value: '9m — OK' },
  { label: 'Municipality rules', value: 'GHMC matched' },
]

const TRACK = ['Plan uploaded', 'AI pre-check', 'Expert assigned', 'Docs submitted', 'Approval granted']

export default function PermitNavigator() {
  return (
    <section className="relative overflow-hidden bg-cream py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Permit Facilitation Engine"
          title="Approvals,"
          accent="finally decoded."
          sub="Upload your plan and let AI check it against local building rules — then connect with verified permit facilitation experts to get it sanctioned."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* AI plan check */}
          <Reveal>
            <div className="glass-card h-full rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-forest-200 bg-forest-50/60 p-5">
                <UploadCloud className="h-7 w-7 text-forest-600" />
                <div>
                  <p className="text-sm font-semibold text-graphite">Upload your building plan</p>
                  <p className="text-xs text-graphite/50">PDF, DWG or image · AI Permit Navigator</p>
                </div>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-forest-600">
                AI Compliance Check
              </p>
              <div className="mt-3 space-y-2.5">
                {CHECKS.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm"
                  >
                    <span className="flex items-center gap-2 text-sm text-graphite/80">
                      <CheckCircle2 className="h-4 w-4 text-neon" /> {c.label}
                    </span>
                    <span className="text-xs font-semibold text-forest-700">{c.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Expert connect + tracking */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col gap-6">
              <div className="rounded-3xl bg-forest-900 p-6 text-white shadow-float sm:p-8">
                <BadgeCheck className="h-8 w-8 text-neon" />
                <h3 className="mt-3 font-display text-xl font-bold">
                  Connect with Verified Permit Facilitation Experts
                </h3>
                <p className="mt-2 text-sm text-white/65">
                  Hand-off to vetted local experts who handle documentation, liaison and
                  follow-ups until your approval lands.
                </p>
                <a
                  href="/login"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-2.5 text-sm font-bold text-forest-950 transition-transform hover:-translate-y-0.5"
                >
                  Find a Permit Expert <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="glass-card rounded-3xl p-6 sm:p-8">
                <p className="flex items-center gap-2 text-sm font-semibold text-graphite">
                  <FileText className="h-4 w-4 text-forest-600" /> Live approval tracking
                </p>
                <div className="mt-5 flex items-center justify-between">
                  {TRACK.map((t, i) => (
                    <div key={t} className="flex flex-1 flex-col items-center text-center">
                      <div className="flex w-full items-center">
                        {i > 0 && <span className={`h-0.5 flex-1 ${i <= 3 ? 'bg-neon' : 'bg-forest-100'}`} />}
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${
                            i <= 3 ? 'bg-neon text-forest-950' : 'border border-forest-200 bg-white text-graphite/40'
                          }`}
                        >
                          {i <= 3 ? '✓' : i + 1}
                        </span>
                        {i < TRACK.length - 1 && <span className={`h-0.5 flex-1 ${i < 3 ? 'bg-neon' : 'bg-forest-100'}`} />}
                      </div>
                      <span className="mt-2 text-[10px] font-medium leading-tight text-graphite/60">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
