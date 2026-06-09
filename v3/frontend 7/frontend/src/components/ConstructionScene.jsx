import { useEffect, useRef, useState } from 'react'

/*
 * A house that builds itself, on a loop — the "living AI construction ecosystem".
 * Phases: foundation → concrete pour → structure → walls → roof → finishing → complete.
 * Driven by a single rAF clock so only this component re-renders.
 */

const CYCLE = 13000 // ms per full build

// geometry (viewBox 0 0 400 320)
const GROUND = 258
const FOUND_TOP = 240
const ROOF_BASE = 122
const LEFT = 128
const RIGHT = 300
const WIDTH = RIGHT - LEFT
const WALL_H = FOUND_TOP - ROOF_BASE

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
// progress of t within [a,b], 0..1
const seg = (t, a, b) => clamp((t - a) / (b - a))
const lerp = (a, b, p) => a + (b - a) * p
const mix = (c1, c2, p) => {
  const h = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
  const [r1, g1, b1] = h(c1)
  const [r2, g2, b2] = h(c2)
  return `rgb(${Math.round(lerp(r1, r2, p))},${Math.round(lerp(g1, g2, p))},${Math.round(lerp(b1, b2, p))})`
}

function phaseOf(t) {
  if (t < 0.15) return 'Laying foundation'
  if (t < 0.3) return 'Pouring concrete'
  if (t < 0.45) return 'Raising structure'
  if (t < 0.62) return 'Building walls'
  if (t < 0.74) return 'Roofing'
  if (t < 0.92) return 'Finishing touches'
  return 'Project complete'
}

export default function ConstructionScene() {
  const [t, setT] = useState(0)
  const start = useRef(null)
  const raf = useRef(0)

  useEffect(() => {
    const tick = (now) => {
      if (start.current === null) start.current = now
      const elapsed = (now - start.current) % CYCLE
      setT(elapsed / CYCLE)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  // --- per-phase progress ---
  const pFound = seg(t, 0.06, 0.15)
  const pPour = seg(t, 0.15, 0.3)
  const pStruct = seg(t, 0.3, 0.45)
  const pWalls = seg(t, 0.45, 0.62)
  const pRoof = seg(t, 0.62, 0.74)
  const pFinish = seg(t, 0.74, 0.9)
  const done = t >= 0.9

  // foundation rect
  const foundH = 18 * pFound
  const foundFill = mix('#7fa6c4', '#b9bec4', pPour) // blueprint blue -> concrete grey

  // structure pillars
  const pillarH = WALL_H * pStruct
  const pillarX = [LEFT, LEFT + WIDTH / 3 - 6, LEFT + (2 * WIDTH) / 3 - 6, RIGHT - 12]

  // walls
  const wallH = WALL_H * pWalls

  // concrete droplets (only visible during pour)
  const drips = [0, 0.33, 0.66].map((off) => {
    const local = ((t - 0.15) / 0.15 + off) % 1
    return { x: LEFT + 40 + off * 90, y: lerp(150, FOUND_TOP - 6, local), on: t > 0.15 && t < 0.3 }
  })

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-gradient-to-b from-[#cfe4f3] via-[#dcebf5] to-[#eaf3ec]">
      <svg viewBox="0 0 400 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="wallg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6efdd" />
            <stop offset="1" stopColor="#e7dcc2" />
          </linearGradient>
          <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bcdcf2" />
            <stop offset="1" stopColor="#e6f1f6" />
          </linearGradient>
        </defs>

        {/* sky + sun + drifting clouds */}
        <rect x="0" y="0" width="400" height="320" fill="url(#skyg)" />
        <circle cx="62" cy="58" r="26" fill="#f5d46a" opacity="0.85" />
        <g opacity="0.7" style={{ transform: `translateX(${(t * 60) % 120 - 30}px)` }}>
          <ellipse cx="300" cy="56" rx="34" ry="13" fill="#ffffff" />
          <ellipse cx="330" cy="50" rx="24" ry="11" fill="#ffffff" />
        </g>

        {/* ground */}
        <rect x="0" y={GROUND} width="400" height={320 - GROUND} fill="#cde0c4" />
        <rect x="0" y={GROUND} width="400" height="4" fill="#b6d0aa" />

        {/* blueprint grid (fades in first, fades as it becomes real) */}
        <g opacity={clamp(seg(t, 0.0, 0.06) - seg(t, 0.45, 0.6))} stroke="#2e7d4f" strokeWidth="0.5" strokeDasharray="3 3">
          {[150, 180, 210].map((y) => (
            <line key={y} x1={LEFT - 10} y1={y} x2={RIGHT + 10} y2={y} />
          ))}
          {[LEFT, LEFT + WIDTH / 2, RIGHT].map((x) => (
            <line key={x} x1={x} y1={120} x2={x} y2={FOUND_TOP} />
          ))}
        </g>

        {/* foundation */}
        {pFound > 0 && (
          <rect
            x={LEFT - 12}
            y={FOUND_TOP + (18 - foundH)}
            width={WIDTH + 24}
            height={foundH}
            rx="2"
            fill={foundFill}
          />
        )}

        {/* concrete pour droplets */}
        {drips.map((d, i) =>
          d.on ? (
            <g key={i}>
              <ellipse cx={d.x} cy={d.y} rx="3" ry="5" fill="#9aa3a8" />
              <ellipse cx={d.x} cy={d.y + 8} rx="5" ry="2" fill="#9aa3a8" opacity="0.5" />
            </g>
          ) : null,
        )}

        {/* structure pillars */}
        {pStruct > 0 &&
          pillarX.map((x, i) => (
            <rect
              key={i}
              x={x}
              y={FOUND_TOP - pillarH}
              width="12"
              height={pillarH}
              fill="#c2cbc4"
            />
          ))}

        {/* walls */}
        {pWalls > 0 && (
          <rect x={LEFT} y={FOUND_TOP - wallH} width={WIDTH} height={wallH} fill="url(#wallg)" />
        )}

        {/* roof */}
        {pRoof > 0 && (
          <g opacity={pRoof} style={{ transform: `translateY(${(1 - pRoof) * -18}px)` }}>
            <polygon points={`${LEFT - 16},${ROOF_BASE} 214,82 ${RIGHT + 16},${ROOF_BASE}`} fill="#1f6440" />
            <polygon points={`${LEFT - 16},${ROOF_BASE} 214,82 ${RIGHT + 16},${ROOF_BASE}`} fill="#184e33" opacity="0.4" transform="translate(0,4)" />
          </g>
        )}

        {/* finishing: windows light up, door, solar panel, tree */}
        <g opacity={pFinish}>
          {/* windows */}
          {[160, 215, 252].map((x, i) =>
            x === 215 ? null : (
              <rect key={i} x={x} y="158" width="28" height="30" rx="2" fill={mix('#33433a', '#e3c25c', pFinish)} stroke="#1f6440" strokeWidth="1.5" />
            ),
          )}
          {/* door */}
          <rect x="201" y="196" width="26" height="44" rx="2" fill="#5b3b22" />
          <circle cx="221" cy="218" r="1.6" fill="#e3c25c" />
          {/* solar panel on roof */}
          <g transform="translate(150,96) rotate(-22)">
            <rect width="42" height="22" rx="1.5" fill="#1b2b3a" />
            <line x1="14" y1="0" x2="14" y2="22" stroke="#3d5878" strokeWidth="1" />
            <line x1="28" y1="0" x2="28" y2="22" stroke="#3d5878" strokeWidth="1" />
            <line x1="0" y1="11" x2="42" y2="11" stroke="#3d5878" strokeWidth="1" />
          </g>
          {/* tree / greenery */}
          <g transform="translate(330,210)">
            <rect x="-3" y="20" width="6" height="28" fill="#6b4a2b" />
            <circle cx="0" cy="14" r="20" fill="#3f9e63" />
            <circle cx="-12" cy="22" r="13" fill="#4caf6e" />
            <circle cx="13" cy="22" r="13" fill="#4caf6e" />
          </g>
        </g>

        {/* AI scan line sweeping the build */}
        <line
          x1="0"
          x2="400"
          y1={lerp(82, GROUND, (t * 1.4) % 1)}
          y2={lerp(82, GROUND, (t * 1.4) % 1)}
          stroke="#34d17a"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* completion badge */}
        {done && (
          <g style={{ transform: `scale(${0.6 + 0.4 * seg(t, 0.9, 0.96)})`, transformOrigin: '214px 60px' }} opacity={seg(t, 0.9, 0.95)}>
            <circle cx="214" cy="60" r="16" fill="#34d17a" />
            <path d="M206 60 l5 5 l9 -10" fill="none" stroke="#0d2e1e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>

      {/* overlay tint to blend with floating cards */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-900/15 to-transparent" />

      {/* live phase chip */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-forest-900/90 px-3.5 py-1.5 text-white shadow-soft backdrop-blur-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-neon" />
        <span className="text-xs font-semibold">{phaseOf(t)}</span>
      </div>

      {/* build progress bar */}
      <div className="absolute bottom-4 right-4 w-28">
        <div className="mb-1 flex justify-between text-[10px] font-semibold text-forest-900/70">
          <span>Build</span>
          <span>{Math.round(t * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/60">
          <div className="h-full rounded-full bg-neon transition-[width] duration-100" style={{ width: `${t * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
