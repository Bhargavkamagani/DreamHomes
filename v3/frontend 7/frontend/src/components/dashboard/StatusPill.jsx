const tones = {
  pending: 'bg-gold/15 text-gold',
  accepted: 'bg-forest-100 text-forest-700',
  rejected: 'bg-warm/15 text-warm',
  completed: 'bg-forest-100 text-forest-700',
  active: 'bg-forest-50 text-forest-700',
}

export default function StatusPill({ status }) {
  const normalizedStatus = String(status || 'pending').toLowerCase()
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tones[normalizedStatus] || 'bg-forest-50 text-graphite/55'}`}>
      {normalizedStatus.replace('_', ' ')}
    </span>
  )
}
