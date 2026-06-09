import { motion } from 'framer-motion'
import { Home, Ruler, Boxes, Truck, Stamp } from 'lucide-react'

const CTAS = [
  { icon: Home, label: 'Start Your Project' },
  { icon: Ruler, label: 'Join as Engineer' },
  { icon: Boxes, label: 'Become a Supplier' },
  { icon: Truck, label: 'Rent Equipment' },
  { icon: Stamp, label: 'Get Permit Assistance' },
]

export default function FinalCTA() {
  return (
    <section id="final" className="scroll-mt-24 bg-cream py-24">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest-800 px-6 py-16 text-center text-white shadow-float sm:px-12">
          <div className="absolute inset-0 bg-grid opacity-[0.10]" />
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-neon/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-neon/10 blur-3xl" />

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mx-auto max-w-3xl font-serif text-4xl font-semibold leading-tight text-balance sm:text-5xl"
            >
              From first blueprint to <span className="text-neon">forever home.</span>
            </motion.h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/65">
              Join India's AI-powered construction operating system. Whoever you are, there's an
              entry point built for you.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {CTAS.map((c, i) => (
                <motion.a
                  key={c.label}
                  href="#top"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                    i === 0
                      ? 'bg-neon text-forest-950 shadow-glow hover:bg-neon-soft'
                      : 'border border-white/20 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <c.icon className="h-4 w-4" /> {c.label}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
