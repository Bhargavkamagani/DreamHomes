import { Component, Suspense, useCallback, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import ConstructionScene from './ConstructionScene.jsx'

/*
 * Premium 3D self-building villa — assembles end-to-end on a loop:
 * foundation → ground floor → cantilevered upper floor → roof → pool → landscaping,
 * windows glow warm at handover. Slow cinematic camera orbit.
 *
 * No hardware shadow maps (they silently blank the scene on many integrated GPUs);
 * we fake ground shadows with dark ellipses so it renders everywhere.
 */

const CYCLE = 15 // seconds per full build
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (t, a, b) => clamp((t - a) / (b - a))
const easeOut = (p) => 1 - Math.pow(1 - p, 3)

const COL = {
  concrete: '#c4c8cb',
  cream: '#efe7d3',
  warmWall: '#d8c39c',
  wood: '#a9743f',
  roof: '#1f4733',
  slab: '#d7d3c8',
  deck: '#b98a5a',
  water: '#2f9fd6',
  trunk: '#6b4a2b',
  leaf: '#3f9e63',
  leaf2: '#56b277',
}

function setOpacity(obj, o) {
  obj.traverse((c) => {
    if (c.material) {
      c.material.transparent = c.userData.glass ? true : o < 0.999
      c.material.opacity = c.userData.glass ? o * 0.55 : o
    }
  })
}
function dropIn(group, t, a, b, baseY) {
  if (!group) return
  const p = clamp((t - a) / (b - a))
  const e = easeOut(p)
  group.visible = p > 0.001
  group.position.y = baseY + (1 - e) * 2.4
  setOpacity(group, p)
}

/* ---- reusable parts ---- */
function Wall({ args, position, color = COL.cream, glass = false }) {
  return (
    <mesh position={position} userData={{ glass }}>
      <boxGeometry args={args} />
      {glass ? (
        <meshStandardMaterial
          color="#9fc4d8"
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.55}
          emissive="#ffcf86"
          emissiveIntensity={0}
        />
      ) : (
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.02} />
      )}
    </mesh>
  )
}

function Floor({ w, d, color, accent }) {
  const wallT = 0.16
  return (
    <group>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[w + 0.3, 0.18, d + 0.3]} />
        <meshStandardMaterial color={COL.slab} roughness={0.9} />
      </mesh>
      <Wall args={[w, 1.7, wallT]} position={[0, 1.05, -d / 2 + wallT / 2]} color={color} />
      <Wall args={[wallT, 1.7, d]} position={[-w / 2 + wallT / 2, 1.05, 0]} color={color} />
      <Wall args={[wallT, 1.7, d]} position={[w / 2 - wallT / 2, 1.05, 0]} color={accent || COL.warmWall} />
      <Wall args={[w - 0.5, 1.5, 0.08]} position={[0, 1.0, d / 2 - 0.05]} glass />
      {[-w / 3, 0, w / 3].map((x, i) => (
        <mesh key={i} position={[x, 1.0, d / 2 - 0.02]}>
          <boxGeometry args={[0.06, 1.55, 0.06]} />
          <meshStandardMaterial color="#2b2b2b" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[w + 0.4, 0.16, d + 0.4]} />
        <meshStandardMaterial color={COL.slab} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1, 8]} />
        <meshStandardMaterial color={COL.trunk} roughness={1} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color={COL.leaf} roughness={1} />
      </mesh>
      <mesh position={[-0.35, 1.1, 0.1]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={COL.leaf2} roughness={1} />
      </mesh>
      <mesh position={[0.35, 1.15, -0.1]}>
        <sphereGeometry args={[0.33, 16, 16]} />
        <meshStandardMaterial color={COL.leaf2} roughness={1} />
      </mesh>
    </group>
  )
}

/* flat fake shadow on the ground */
function Blob({ position, rx = 1, rz = 1, opacity = 0.18 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial color="#0d2e1e" transparent opacity={opacity} scale={[rx, rz, 1]} />
    </mesh>
  )
}

function Crane({ innerRef }) {
  return (
    <group ref={innerRef} position={[-4.6, 0, -1]}>
      <mesh position={[0, 3.6, 0]}>
        <boxGeometry args={[0.22, 7.2, 0.22]} />
        <meshStandardMaterial color="#e0a93b" roughness={0.6} />
      </mesh>
      <group position={[0, 7.0, 0]}>
        <mesh position={[2.6, 0, 0]}>
          <boxGeometry args={[6.4, 0.16, 0.16]} />
          <meshStandardMaterial color="#e0a93b" roughness={0.6} />
        </mesh>
        <mesh position={[-1.1, 0, 0]}>
          <boxGeometry args={[2.2, 0.16, 0.16]} />
          <meshStandardMaterial color="#e0a93b" roughness={0.6} />
        </mesh>
        <mesh position={[-2.0, -0.25, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#5a5a5a" />
        </mesh>
        <mesh position={[4.4, -0.7, 0]}>
          <boxGeometry args={[0.03, 1.4, 0.03]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[4.4, -1.5, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.5]} />
          <meshStandardMaterial color={COL.concrete} />
        </mesh>
      </group>
    </group>
  )
}

function Scene({ onTick }) {
  const foundation = useRef()
  const f1 = useRef()
  const f2 = useRef()
  const roof = useRef()
  const pool = useRef()
  const crane = useRef()
  const trees = useRef()
  const last = useRef(0)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const t = (time % CYCLE) / CYCLE

    const pf = easeOut(seg(t, 0.06, 0.18))
    if (foundation.current) {
      foundation.current.scale.y = Math.max(pf, 0.001)
      foundation.current.position.y = 0.15 * pf
    }

    dropIn(f1.current, t, 0.18, 0.34, 0.3)
    dropIn(f2.current, t, 0.4, 0.56, 2.0)
    dropIn(roof.current, t, 0.58, 0.72, 3.7)

    const pp = easeOut(seg(t, 0.72, 0.84))
    if (pool.current) {
      pool.current.scale.y = Math.max(pp, 0.001)
      pool.current.position.y = 0.07 * pp - 0.02
    }

    if (crane.current) {
      const o = clamp(seg(t, 0.14, 0.2)) * (1 - seg(t, 0.72, 0.8))
      crane.current.visible = o > 0.01
      setOpacity(crane.current, o)
      crane.current.rotation.y = Math.sin(time * 0.4) * 0.35
    }

    const tg = easeOut(seg(t, 0.82, 0.96))
    if (trees.current) trees.current.scale.setScalar(Math.max(tg, 0.001))

    const glow = seg(t, 0.82, 0.97) * 1.6
    ;[f1, f2].forEach(
      (r) =>
        r.current &&
        r.current.traverse((c) => {
          if (c.userData.glass && c.material) c.material.emissiveIntensity = glow
        }),
    )

    // cinematic slow orbit
    const a = time * 0.12
    const R = 13.5
    state.camera.position.set(Math.sin(a) * R, 7.2, Math.cos(a) * R)
    state.camera.lookAt(0, 2.0, 0)

    if (time - last.current > 0.12) {
      last.current = time
      onTick(t)
    }
  })

  return (
    <>
      <hemisphereLight args={['#dff0ff', '#cde0c4', 0.7]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[7, 11, 5]} intensity={1.3} />
      <directionalLight position={[-6, 5, -4]} intensity={0.4} color="#ffd9a0" />

      {/* lawn + plinth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#cfe2c6" roughness={1} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[7.5, 0.04, 6]} />
        <meshStandardMaterial color="#e7e3d8" roughness={1} />
      </mesh>

      {/* fake shadows */}
      <Blob position={[0.3, 0.05, 0.3]} opacity={0.16} />
      <group scale={[3.2, 1, 2.6]}>
        <Blob position={[0, 0.051, 0]} opacity={0.14} />
      </group>

      {/* foundation */}
      <group ref={foundation}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[5.2, 0.3, 4]} />
          <meshStandardMaterial color={COL.concrete} roughness={0.95} />
        </mesh>
      </group>

      {/* ground floor */}
      <group ref={f1} position={[0, 0.3, 0]}>
        <Floor w={4.6} d={3.4} color={COL.cream} accent={COL.warmWall} />
      </group>

      {/* cantilevered upper floor */}
      <group ref={f2} position={[0.6, 2.0, 0.5]}>
        <Floor w={3.8} d={2.8} color={COL.cream} accent={COL.wood} />
      </group>

      {/* roof + rooftop details */}
      <group ref={roof} position={[0.6, 3.7, 0.5]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[4.2, 0.2, 3.2]} />
          <meshStandardMaterial color={COL.roof} roughness={0.7} />
        </mesh>
        {[
          [0, 0.35, 1.55],
          [0, 0.35, -1.55],
        ].map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[4.2, 0.3, 0.06]} />
            <meshStandardMaterial color={COL.roof} />
          </mesh>
        ))}
        <mesh position={[-1.3, 0.5, -0.6]}>
          <boxGeometry args={[1.0, 0.6, 0.9]} />
          <meshStandardMaterial color={COL.warmWall} roughness={0.9} />
        </mesh>
        <mesh position={[0.9, 0.42, 0.2]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[1.6, 0.05, 1.0]} />
          <meshStandardMaterial color="#1b2b3a" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* pool */}
      <group position={[3.4, 0, 1.4]}>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[2.6, 0.18, 1.8]} />
          <meshStandardMaterial color={COL.deck} roughness={0.95} />
        </mesh>
        <group ref={pool}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.2, 0.16, 1.4]} />
            <meshStandardMaterial color={COL.water} roughness={0.1} metalness={0.3} transparent opacity={0.85} />
          </mesh>
        </group>
      </group>

      {/* landscaping */}
      <group ref={trees} scale={0.001}>
        <Tree position={[-3.4, 0, 2.4]} />
        <Tree position={[4.2, 0, -2.2]} />
        <Tree position={[-3.0, 0, -2.6]} />
      </group>

      <Crane innerRef={crane} />
    </>
  )
}

function phaseOf(t) {
  if (t < 0.18) return 'Laying foundation'
  if (t < 0.34) return 'Erecting ground floor'
  if (t < 0.56) return 'Building upper floor'
  if (t < 0.72) return 'Roofing & solar'
  if (t < 0.84) return 'Pool & decking'
  if (t < 0.97) return 'Landscaping & handover'
  return 'Project complete'
}

/* If WebGL/Three throws, fall back to the 2D animated scene instead of an empty box. */
class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.warn('[GharBanao] 3D scene failed, using 2D fallback:', err?.message)
  }
  render() {
    if (this.state.failed) return <ConstructionScene />
    return this.props.children
  }
}

function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export default function ConstructionScene3D() {
  // Overlay is driven by refs (not state) so the Canvas never re-renders.
  const phaseRef = useRef(null)
  const pctRef = useRef(null)
  const barRef = useRef(null)
  const [fallback, setFallback] = useState(false)

  const onTick = useCallback((t) => {
    if (phaseRef.current) phaseRef.current.textContent = phaseOf(t)
    if (pctRef.current) pctRef.current.textContent = `${Math.round(t * 100)}%`
    if (barRef.current) barRef.current.style.width = `${t * 100}%`
  }, [])

  // No WebGL, or the GPU kept losing the context (too many tabs / weak GPU) → 2D scene.
  if (!hasWebGL() || fallback) return <ConstructionScene />

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-gradient-to-b from-[#cfe6f5] via-[#dcecf3] to-[#eef4ea]">
      <SceneBoundary>
        <Canvas
          dpr={[1, 1.5]}
          frameloop="always"
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
          camera={{ position: [11, 7, 11], fov: 32 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            const canvas = gl.domElement
            let losses = 0
            canvas.addEventListener(
              'webglcontextlost',
              (e) => {
                e.preventDefault()
                losses += 1
                // If the context keeps dropping, stop fighting and use the 2D scene.
                if (losses >= 2) setFallback(true)
              },
              false,
            )
          }}
        >
          <Suspense fallback={null}>
            <Scene onTick={onTick} />
          </Suspense>
        </Canvas>
      </SceneBoundary>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-900/12 to-transparent" />

      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-forest-900/90 px-3.5 py-1.5 text-white shadow-soft backdrop-blur-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-neon" />
        <span ref={phaseRef} className="text-xs font-semibold">Laying foundation</span>
      </div>

      <div className="absolute bottom-4 right-4 w-28">
        <div className="mb-1 flex justify-between text-[10px] font-semibold text-forest-900/70">
          <span>Build</span>
          <span ref={pctRef}>0%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/60">
          <div ref={barRef} className="h-full rounded-full bg-neon" style={{ width: '0%' }} />
        </div>
      </div>
    </div>
  )
}
