import { motion } from 'framer-motion'
import { Camera, Plane, AlertTriangle, CheckCircle2, Activity } from 'lucide-react'
import { Reveal, SectionHeading, SmartImage } from '../lib/ui.jsx'

const OVERLAYS = [
  { icon: AlertTriangle, text: 'Concrete curing issue detected', tone: 'warn', pos: 'left-4 top-6' },
  { icon: AlertTriangle, text: 'Wall alignment deviation found', tone: 'warn', pos: 'right-4 top-1/3' },
  { icon: Activity, text: 'Delay risk identified', tone: 'warn', pos: 'left-6 bottom-20' },
  { icon: CheckCircle2, text: 'Safety gear compliant', tone: 'ok', pos: 'right-6 bottom-6' },
]

const INPUTS = [
  { icon: Camera, label: 'Site Photos' },
  { icon: Plane, label: 'Drone Footage' },
  { icon: Activity, label: 'Progress' },
  { icon: AlertTriangle, label: 'Safety & Delays' },
]

export default function SiteMonitoring() {
  return (
    <section className="bg-white py-24">
      <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow mb-4">AI Site Monitoring</span>
          <h2 className="h-display text-3xl sm:text-4xl">
            An intelligence layer <span className="text-forest-600">watching your site.</span>
          </h2>
          <p className="mt-4 text-base text-graphite/60">
            AI continuously analyses photos, drone footage and progress updates — flagging quality,
            safety and schedule issues before they cost you.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {INPUTS.map((it) => (
              <div key={it.label} className="rounded-xl border border-forest-100 bg-cream p-3 text-center">
                <it.icon className="mx-auto h-5 w-5 text-forest-600" />
                <p className="mt-2 text-xs font-semibold text-graphite/70">{it.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl shadow-float ring-1 ring-black/5">
            <SmartImage
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80"
              alt="Construction site under AI monitoring"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-0 bg-forest-950/20" />
            {/* scanning line */}
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-x-0 h-0.5 bg-neon/80 shadow-glow"
            />
            {OVERLAYS.map((o, i) => (
              <motion.div
                key={o.text}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.25 }}
                className={`absolute ${o.pos} flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold shadow-lg backdrop-blur-sm ${
                  o.tone === 'warn' ? 'bg-warm/90 text-white' : 'bg-neon/90 text-forest-950'
                }`}
              >
                <o.icon className="h-3.5 w-3.5" /> {o.text}
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
