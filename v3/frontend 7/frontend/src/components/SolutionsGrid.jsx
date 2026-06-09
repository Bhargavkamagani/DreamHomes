import { ArrowRight } from 'lucide-react'
import { Reveal, SectionHeading, SmartImage } from '../lib/ui.jsx'

const CARDS = [
  {
    title: 'For Homeowners',
    desc: 'Plan your dream home, track progress, make secure payments.',
    img: 'photo-1600585154340-be6161a56a0c',
  },
  {
    title: 'For Contractors',
    desc: 'Manage projects, hire experts, buy materials, grow faster.',
    img: 'photo-1504307651254-35680f356dfd',
  },
  {
    title: 'For Civil Engineers',
    desc: 'Find jobs, freelance projects and grow your professional network.',
    img: 'photo-1581094794329-c8112a89af12',
  },
  {
    title: 'Equipment Rentals',
    desc: 'Rent surveying & construction equipment easily and affordably.',
    img: 'photo-1581092160562-40aa08e78837',
  },
  {
    title: 'Permit Experts',
    desc: 'Connect with verified Permit Facilitation Experts & get approvals.',
    img: 'photo-1564507592333-c60657eea523',
  },
  {
    title: 'For Suppliers',
    desc: 'Sell more, reach verified buyers and grow your business.',
    img: 'photo-1565008447742-97f6f38c985c',
  },
]

export default function SolutionsGrid() {
  return (
    <section id="solutions" className="relative scroll-mt-24 bg-white py-20 pt-28">
      <div className="container-x">
        <SectionHeading
          title="One Platform."
          accent="Endless Possibilities."
          sub="Everything you need to plan, build, manage and maintain — all in one place."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <a
                href="/login"
                className="group block h-full rounded-2xl border border-forest-100 bg-white p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-forest-300 hover:shadow-float"
              >
                <div className="overflow-hidden rounded-xl">
                  <SmartImage
                    src={`https://images.unsplash.com/${c.img}?auto=format&fit=crop&w=640&q=80`}
                    alt={c.title}
                    className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-2 pb-2 pt-4">
                  <h3 className="font-display text-lg font-bold text-graphite">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-graphite/60">{c.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
