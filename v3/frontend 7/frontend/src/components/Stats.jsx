import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, HardHat, Ruler, Truck, Landmark, IndianRupee } from 'lucide-react'

const STATS = [
  { icon: Users, end: 50000, suffix: '+', label: 'Happy Homeowners' },
  { icon: HardHat, end: 3200, suffix: '+', label: 'Verified Contractors' },
  { icon: Ruler, end: 8500, suffix: '+', label: 'Civil Engineers' },
  { icon: Truck, end: 1200, suffix: '+', label: 'Equipment Owners' },
  { icon: Landmark, end: 150, suffix: '+', label: 'Permit Experts' },
  { icon: IndianRupee, end: 250, prefix: '₹', suffix: 'Cr+', label: 'Projects Managed' },
]

function fmt(n) {
  return n >= 1000 ? n.toLocaleString('en-IN') : String(n)
}

function Counter({ end, prefix = '', suffix = '', play }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!play) return
    let raf
    const dur = 1600
    let start
    const tick = (t) => {
      if (start === undefined) start = t
      const p = Math.min((t - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(end * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [play, end])
  return (
    <span>
      {prefix}
      {fmt(val)}
      {suffix}
    </span>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="bg-cream py-14">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-6 rounded-3xl border border-forest-100 bg-white px-6 py-9 shadow-card sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="text-center"
            >
              <s.icon className="mx-auto h-6 w-6 text-forest-600" />
              <p className="mt-2.5 font-display text-2xl font-extrabold text-graphite">
                <Counter end={s.end} prefix={s.prefix} suffix={s.suffix} play={inView} />
              </p>
              <p className="mt-0.5 text-xs font-medium text-graphite/55">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
