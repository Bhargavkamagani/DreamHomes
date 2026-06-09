import { useEffect, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import Logo from './Logo.jsx'

const LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'About Us', href: '#future' },
  { label: 'How It Works', href: '#journey' },
  { label: 'Solutions', href: '#solutions', caret: true },
  { label: 'Resources', href: '#features', caret: true },
  { label: 'Pricing', href: '#final' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      id="top"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream/90 shadow-soft backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="container-x flex h-[72px] items-center justify-between">
        <Logo />

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="flex items-center gap-1 text-sm font-semibold text-graphite/80 transition-colors hover:text-forest-700"
              >
                {l.label}
                {l.caret && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a href="/login" className="btn-ghost px-5 py-2.5">Login</a>
          <a href="/signup" className="btn-primary px-5 py-2.5">Sign Up Now</a>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-forest-200 bg-white text-forest-800 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="container-x lg:hidden">
          <div className="glass-card mb-3 flex flex-col gap-1 p-3">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-graphite/80 hover:bg-forest-50"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a href="/login" className="btn-ghost">Login</a>
              <a href="/signup" className="btn-primary">Sign Up Now</a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
