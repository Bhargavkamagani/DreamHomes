import { ShieldCheck, Award, Landmark, Lock, FileLock2, Users } from 'lucide-react'
import { Reveal } from '../lib/ui.jsx'

const BADGES = [
  { icon: ShieldCheck, title: 'RERA', sub: 'Compliant' },
  { icon: Award, title: 'ISO', sub: '27001 Certified' },
  { icon: Landmark, title: 'Government', sub: 'Recognized' },
  { icon: Lock, title: 'Secure', sub: '& Encrypted' },
  { icon: FileLock2, title: 'Data Privacy', sub: 'Assured' },
  { icon: Users, title: 'Trusted by', sub: 'Thousands' },
]

export default function TrustBadges() {
  return (
    <section className="bg-cream pb-20">
      <div className="container-x">
        <Reveal>
          <h3 className="text-center font-display text-xl font-bold text-graphite">
            Backed by Trust. Driven by Purpose.
          </h3>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {BADGES.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.05}>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-forest-100 bg-white px-3 py-5 text-center shadow-sm transition-colors hover:border-forest-200">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-50 text-forest-600">
                  <b.icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-bold text-graphite">{b.title}</p>
                <p className="-mt-1.5 text-xs text-graphite/50">{b.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
