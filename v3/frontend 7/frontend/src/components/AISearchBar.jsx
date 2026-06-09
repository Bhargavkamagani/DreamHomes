import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, SendHorizontal } from 'lucide-react'

const EXAMPLES = [
  'I have 40 lakhs and 1200 sqft in Hyderabad.',
  'Need Total Station for 5 days.',
  'Need GHMC approval help.',
  'Need site engineer for villa project.',
  'Estimate cost for a duplex house.',
]

export default function AISearchBar() {
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [value, setValue] = useState('')
  const charRef = useRef(0)

  /* Typewriter rotation through example prompts */
  useEffect(() => {
    let timeout
    const full = EXAMPLES[idx]
    if (charRef.current <= full.length) {
      timeout = setTimeout(() => {
        setTyped(full.slice(0, charRef.current))
        charRef.current += 1
      }, 45)
    } else {
      timeout = setTimeout(() => {
        charRef.current = 0
        setTyped('')
        setIdx((i) => (i + 1) % EXAMPLES.length)
      }, 1800)
    }
    return () => clearTimeout(timeout)
  }, [typed, idx])

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mx-auto max-w-3xl rounded-2xl border border-forest-100 bg-white p-2.5 shadow-float"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest-700 text-white shadow-soft">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-graphite">AI Construction Assistant</p>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={value ? '' : `Ask anything — e.g. ${typed}|`}
            className="w-full bg-transparent text-sm text-graphite placeholder:text-graphite/40 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-forest-700 transition-colors hover:bg-forest-50"
          aria-label="Send"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}
