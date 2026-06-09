import { useEffect, useState } from 'react'
import { Wallet, BarChart3, ScanEye, FileSignature, ArrowRight, Play, X } from 'lucide-react'
import { Reveal, SectionHeading, SmartImage } from '../lib/ui.jsx'

const VIDEO_ID = '6Kq58uXU4WM'

const FEATURES = [
  { icon: Wallet, title: 'Escrow & Secure Payments', desc: 'Milestone-based payments held securely until work is verified.' },
  { icon: BarChart3, title: 'Live Material Intelligence', desc: 'Real-time prices, trends & smart buying insights to save more.' },
  { icon: ScanEye, title: 'Site Monitoring with AI', desc: 'AI analyzes site photos, detects issues & ensures quality construction.' },
  { icon: FileSignature, title: 'Legal & Agreement Engine', desc: 'AI-generated agreements, contracts & compliance documents.' },
]

export default function PowerfulFeatures() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <section id="features" className="scroll-mt-24 bg-cream py-24">
      <div className="container-x">
        <SectionHeading title="Powerful Features." accent="Real Impact." sub="Technology + Transparency = Trust" />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Phone mockup */}
          <Reveal>
            <div className="flex h-full items-center gap-5 rounded-3xl border border-forest-100 bg-white p-6 shadow-card">
              <div className="relative w-[120px] shrink-0">
                <div className="overflow-hidden rounded-[1.6rem] border-[5px] border-forest-900 bg-forest-900 shadow-float">
                  <SmartImage
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80"
                    alt="AI Project Intelligence dashboard"
                    className="h-[230px] w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-graphite">AI Project Intelligence</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite/60">
                  Real-time insights, risk prediction, cost tracking and smart recommendations.
                </p>
                <a href="/login" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700">
                  Learn More <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* 2x2 feature cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-forest-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-forest-50 text-forest-600">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-graphite">{f.title}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-graphite/55">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Video card */}
          <Reveal delay={0.1}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Play GharBanao video"
              className="group relative block h-full min-h-[280px] w-full overflow-hidden rounded-3xl text-left shadow-float"
            >
              <SmartImage
                src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                alt="Watch GharBanao in action"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/30 to-transparent" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-forest-800 shadow-glow transition-transform group-hover:scale-110">
                  <Play className="ml-1 h-7 w-7 fill-current" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="font-display text-xl font-extrabold leading-tight">
                  Building Trust.<br />Building Tomorrow.
                </h3>
                <p className="mt-1 text-sm text-white/70">Watch GharBanao in Action</p>
              </div>
            </button>
          </Reveal>
        </div>
      </div>

      {/* Video lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-forest-950/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute -top-11 right-0 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-forest-900 transition-colors hover:bg-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                title="GharBanao in Action"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
