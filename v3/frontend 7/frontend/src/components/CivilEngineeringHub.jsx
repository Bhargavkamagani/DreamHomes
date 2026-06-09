import { Briefcase, Calculator, Truck, ArrowRight } from 'lucide-react'
import { Reveal, SectionHeading } from '../lib/ui.jsx'

const COLUMNS = [
  {
    icon: Briefcase,
    title: 'Engineering Careers',
    items: ['Full-time jobs', 'Internships', 'Freelance projects', 'Verified profiles'],
  },
  {
    icon: Calculator,
    title: 'Engineering Tools',
    items: ['BOQ generation', 'Quantity takeoff', 'AI cost estimation', 'Structural checks'],
  },
]

const RENTALS = [
  { name: 'Total Station', rate: '₹1,200/day', status: 'Available', tone: true },
  { name: 'Theodolite', rate: '₹800/day', status: 'Available', tone: true },
  { name: 'DGPS', rate: '₹2,500/day', status: '2 left', tone: true },
  { name: 'JCB Excavator', rate: '₹8,000/day', status: 'Booked', tone: false },
  { name: 'Tower Crane', rate: '₹15,000/day', status: 'Available', tone: true },
]

export default function CivilEngineeringHub() {
  return (
    <section className="bg-white py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Civil Engineering Hub"
          title="Grow your career."
          accent="Power your projects."
          sub="A dedicated space for engineers — work, professional tools and on-demand equipment, all in one place."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {COLUMNS.map((col, i) => (
            <Reveal key={col.title} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-forest-100 bg-cream p-7 transition-all duration-300 hover:border-forest-300 hover:shadow-card">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-forest-700 text-white shadow-soft">
                  <col.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-graphite">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-graphite/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-neon" /> {it}
                    </li>
                  ))}
                </ul>
                <a href="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700">
                  Explore <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          ))}

          {/* Equipment rentals with live availability */}
          <Reveal delay={0.16}>
            <div className="h-full rounded-3xl bg-forest-900 p-7 text-white shadow-float">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon text-forest-950">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold">Equipment Rentals</h3>
              </div>
              <div className="mt-5 space-y-2">
                {RENTALS.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-[11px] text-white/50">{r.rate}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        r.tone ? 'bg-neon/20 text-neon' : 'bg-warm/20 text-warm'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
