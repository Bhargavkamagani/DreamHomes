import { motion } from 'framer-motion'
import { SmartImage } from '../lib/ui.jsx'

export default function FutureOfConstruction() {
  return (
    <section id="future" className="relative scroll-mt-24 overflow-hidden bg-forest-950 py-32 text-white">
      <SmartImage
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
        alt="Smart city skyline at dusk"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/70 to-forest-950/90" />
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />

      <div className="container-x relative text-center">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-6 border-white/15 bg-white/5 text-neon"
        >
          The Future of Construction
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mx-auto max-w-4xl font-serif text-4xl font-semibold leading-[1.15] text-balance sm:text-5xl md:text-6xl"
        >
          We are building the <span className="text-neon">infrastructure intelligence layer</span> for India.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/60"
        >
          Smarter cities. Sustainable homes. Transparent construction. An AI-native operating system
          for the way India builds.
        </motion.p>
      </div>
    </section>
  )
}
