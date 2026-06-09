export default function Logo({ light = false, withTagline = true }) {
  const text = light ? 'text-white' : 'text-forest-800'
  const tag = light ? 'text-white/60' : 'text-graphite/50'
  return (
    <a href="#top" className="flex items-center gap-2.5 select-none">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-800 shadow-soft">
        <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none">
          <path d="M24 9 L40 23 H35 V39 H28 V28 H20 V39 H13 V23 H8 Z" fill="#34d17a" />
          <circle cx="24" cy="20" r="2.6" fill="#123d28" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block font-display text-xl font-extrabold tracking-tight ${text}`}>
          GharBanao
        </span>
        {withTagline && (
          <span className={`block text-[10px] font-medium tracking-[0.18em] uppercase ${tag}`}>
            Plan. Build. Live. Forever.
          </span>
        )}
      </span>
    </a>
  )
}
