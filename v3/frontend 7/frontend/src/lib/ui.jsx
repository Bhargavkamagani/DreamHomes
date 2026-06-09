import { motion } from 'framer-motion'
import { useState } from 'react'

/* Scroll-reveal wrapper — calm, slow entrance used across the page */
export function Reveal({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* Section heading block — serif/display heading + sub line, centered by default */
export function SectionHeading({ eyebrow, title, sub, align = 'center', accent }) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {eyebrow && (
        <Reveal>
          <span className="eyebrow mb-4">{eyebrow}</span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="h-display text-3xl sm:text-4xl md:text-[2.6rem] leading-[1.1] text-balance">
          {title} {accent && <span className="text-forest-600">{accent}</span>}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-base text-graphite/60">{sub}</p>
        </Reveal>
      )}
    </div>
  )
}

/* Image with graceful gradient fallback if the remote photo fails to load */
export function SmartImage({ src, alt, className = '', fallback = 'from-forest-200 to-forest-400' }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return <div className={`bg-gradient-to-br ${fallback} ${className}`} aria-label={alt} role="img" />
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
