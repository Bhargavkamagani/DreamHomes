import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Menu, Sparkles, X } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { logoutUser } from '../redux/authSlice.js'

/*
 * Dashboard chrome with a HORIZONTAL top nav (two tiers):
 *   Row 1 — logo · Ask-AI · notifications · profile
 *   Row 2 — horizontal nav (underline pills, scrolls on small screens)
 * Fully responsive: on mobile the nav row scrolls, and a menu button opens a list.
 *
 * Props: nav [{id,label,icon,badge?}] · activeId · onNavClick(id) · user{name,initials} · children
 */
export default function DashboardShell({ nav, activeId, onNavClick, user, children }) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const go = (id) => {
    onNavClick?.(id)
    setOpen(false)
  }

  const logout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-white">
      <header className="sticky top-0 z-40 border-b border-forest-100/70 bg-cream/80 backdrop-blur-xl">
        {/* Row 1 */}
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Logo withTagline={false} />

          <div className="flex-1" />

          <button className="hidden items-center gap-2 rounded-full border border-forest-200 bg-white px-4 py-2 text-sm font-medium text-graphite/55 shadow-sm transition hover:border-forest-300 md:flex">
            <Sparkles className="h-4 w-4 text-forest-600" /> Ask AI…
          </button>

          <button className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-forest-700 shadow-sm ring-1 ring-black/5 transition hover:shadow-card">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-warm text-[9px] font-bold text-white">3</span>
          </button>

          <button className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-sm ring-1 ring-black/5 transition hover:shadow-card">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-forest-600 to-forest-800 text-sm font-bold text-white">
              {user.initials}
            </span>
            <span className="hidden text-sm font-semibold sm:block">{user.name}</span>
            <ChevronDown className="hidden h-4 w-4 text-graphite/50 sm:block" />
          </button>

          <button
            onClick={logout}
            className="hidden rounded-full border border-forest-100 bg-white px-4 py-2 text-sm font-bold text-graphite/65 shadow-sm transition hover:border-warm/40 hover:text-warm md:inline-flex"
          >
            Logout
          </button>

          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-forest-200 bg-white text-forest-800 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Row 2 — horizontal nav (hidden on mobile; scrolls on tablet) */}
        <div className="hidden border-t border-forest-100/60 lg:block">
          <nav className="dash-scroll mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-3 sm:px-5">
            {nav.map((item) => {
              const on = item.id === activeId
              const badgeCount = Number(item.badge || 0)
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
                    on
                      ? 'border-forest-700 text-forest-800'
                      : 'border-transparent text-graphite/55 hover:text-forest-700'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${on ? 'text-forest-700' : ''}`} />
                  {item.label}
                  {badgeCount > 0 ? (
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-warm px-1 text-[9px] font-bold text-white">{badgeCount > 9 ? '9+' : badgeCount}</span>
                  ) : null}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Mobile dropdown menu */}
        {open && (
          <div className="border-t border-forest-100/60 bg-cream/95 lg:hidden">
            <nav className="mx-auto grid max-w-[1400px] grid-cols-2 gap-1 p-3">
            {nav.map((item) => {
              const on = item.id === activeId
              const badgeCount = Number(item.badge || 0)
              return (
                <button
                  key={item.id}
                    onClick={() => go(item.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      on ? 'bg-forest-700 text-white' : 'text-graphite/70 hover:bg-forest-50'
                  }`}
                >
                    <item.icon className="h-4 w-4" /> {item.label}
                    {badgeCount > 0 ? (
                      <span className={`ml-auto grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold ${on ? 'bg-white text-warm' : 'bg-warm text-white'}`}>
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    ) : null}
                  </button>
                )
              })}
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-warm hover:bg-warm/10"
              >
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  )
}
