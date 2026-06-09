import { Mail, Phone, MapPin } from 'lucide-react'
import Logo from './Logo.jsx'

const COLUMNS = [
  {
    title: 'Platform',
    links: ['For Homeowners', 'For Contractors', 'For Engineers', 'For Suppliers', 'Permit Experts'],
  },
  {
    title: 'Solutions',
    links: ['AI Planning & BOQ', 'Permit Navigator', 'Escrow Payments', 'Site Monitoring', 'Material Market'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'RERA Compliance', 'Security', 'Refunds'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-white">
      <div className="container-x py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Logo light />
            <p className="mt-4 max-w-xs text-sm text-white/55">
              The AI Operating System for Construction &amp; Infrastructure — from first blueprint to forever home.
            </p>
            <div className="mt-5 space-y-2 text-sm text-white/55">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-neon" /> hello@gharbanao.in</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-neon" /> +91 40 1234 5678</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-neon" /> Hyderabad, India</p>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#top" className="text-sm text-white/55 transition-colors hover:text-neon">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row">
          <p>© 2026 GharBanao Technologies. All rights reserved.</p>
          <p>Plan. Build. Live. Forever.</p>
        </div>
      </div>
    </footer>
  )
}
