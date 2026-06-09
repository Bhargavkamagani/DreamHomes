import { ChevronDown, ArrowRight } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import NotificationBell from '../components/dashboard/NotificationBell.jsx'
import { imageUrl } from '../services/apiClient.js'
import { logoutUser } from '../redux/authSlice.js'

export function Topbar({ user, roleLabel }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const logout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-forest-100 bg-cream/80 px-4 backdrop-blur-xl sm:px-6">
      <Logo />
      <div className="flex-1" />
      <NotificationBell />
      <button className="flex shrink-0 items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-sm ring-1 ring-black/5">
        {user.profileImageUrl ? (
          <img src={imageUrl(user.profileImageUrl)} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-forest-100" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-forest-600 to-forest-800 text-xs font-bold text-white">
            {user.initials}
          </span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-bold leading-tight text-graphite">{user.name}</span>
          <span className="block text-[11px] leading-tight text-graphite/50">{roleLabel}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-graphite/40 sm:block" />
      </button>
      <button
        onClick={logout}
        className="rounded-full border border-forest-100 bg-white px-4 py-2 text-sm font-bold text-graphite/65 shadow-sm transition hover:border-warm/40 hover:text-warm"
      >
        Logout
      </button>
    </header>
  )
}

export function Hero({ title, description, actionLabel, onAction, user }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#eef3ea]">
      <div className="absolute inset-y-0 right-0 hidden h-full w-[62%] bg-gradient-to-br from-forest-100 via-cream to-forest-200 md:block" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-[#eef3ea] via-[#eef3ea]/90 to-transparent md:block" />
      <div className="relative flex min-h-[150px] items-center justify-between gap-4 p-5 sm:p-6">
        <div className="max-w-lg">
          <h1 className="font-display text-xl font-extrabold leading-tight text-forest-800 sm:text-[1.65rem]">{title}</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-graphite/65">{description}</p>
          {actionLabel && (
            <button onClick={onAction} className="mt-4 rounded-full bg-forest-700 px-4 py-2 text-xs font-bold text-white shadow-sm">
              {actionLabel}
            </button>
          )}
        </div>
        <div className="hidden shrink-0 items-center gap-4 md:flex">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-forest-700">Profile</p>
            <p className="mt-1 max-w-[180px] truncate text-sm font-bold text-graphite">{user?.name}</p>
          </div>
          {user?.profileImageUrl ? (
            <img src={imageUrl(user.profileImageUrl)} alt="" className="h-24 w-24 rounded-2xl object-cover shadow-card ring-4 ring-white/70" />
          ) : (
            <span className="grid h-24 w-24 place-items-center rounded-2xl bg-white/85 text-2xl font-extrabold text-forest-700 shadow-card ring-1 ring-forest-100">
              {user?.initials || 'GB'}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

export function NavBar({ items, activeId, onNav }) {
  return (
    <div className="sticky top-16 z-20 -mx-1 bg-cream/80 px-1 py-2 backdrop-blur-xl">
      <nav className="rounded-2xl border border-forest-100 bg-white/95 px-2 shadow-card">
        <div className="dash-scroll flex gap-1 overflow-x-auto">
          {items.map((item) => {
            const active = item.id === activeId
            const badgeCount = Number(item.badge || 0)
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                  active ? 'border-forest-700 text-forest-800' : 'border-transparent text-graphite/55 hover:text-forest-700'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {item.label}
                  {badgeCount > 0 && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-warm px-1 text-[9px] font-bold leading-none text-white">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export function Card({ title, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`flex h-full flex-col rounded-2xl border border-forest-100 bg-white p-5 shadow-card ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-graphite">
              {Icon && <Icon className="h-[18px] w-[18px] text-forest-600" />}
              {title}
            </h3>
          ) : <span />}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ title, message }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-forest-100 bg-cream/35 px-4 py-12 text-center">
      <p className="font-display text-sm font-bold text-graphite">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-graphite/55">{message}</p>
    </div>
  )
}

export function StatCards({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-forest-100 bg-white p-2 shadow-card md:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-forest-50/60 md:border-r md:border-forest-50 md:last:border-r-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700"><item.icon className="h-4 w-4" /></span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-xs font-bold text-graphite/55">{item.label}</p>
              <span className="truncate text-[10px] font-bold text-forest-600">{item.note}</span>
            </div>
            <p className="truncate font-display text-xl font-extrabold leading-tight text-graphite">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ViewLink({ children, onClick }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 transition-all hover:gap-1.5">
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </button>
  )
}
