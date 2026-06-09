export default function DashboardCard({ title, icon: Icon, action, children, className = '' }) {
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
