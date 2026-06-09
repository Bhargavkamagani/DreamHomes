export default function PincodeAreaHint({ lookupState }) {
  if (!lookupState?.message) return null
  const tone = lookupState.status === 'error' ? 'text-warm' : 'text-forest-700'
  return <p className={`mt-1 text-[11px] font-semibold ${tone}`}>{lookupState.message}</p>
}
