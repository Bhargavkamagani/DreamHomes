/*
 * Hero background video — reliable everywhere (no WebGL).
 * Autoplays muted + looped behind the floating dashboard cards.
 */
const VIDEO_ID = '6Kq58uXU4WM'

export default function HeroVideo() {
  const src =
    `https://www.youtube.com/embed/${VIDEO_ID}` +
    `?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}` +
    `&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-forest-950">
      {/* 16:9 video scaled to cover the 4:3.4 box without letterboxing */}
      <iframe
        src={src}
        title="GharBanao in Action"
        allow="autoplay; encrypted-media; picture-in-picture"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[178%] -translate-x-1/2 -translate-y-1/2 sm:h-[140%]"
        style={{ minWidth: '100%', minHeight: '100%' }}
        frameBorder="0"
      />
      {/* subtle tint so the white cards stay readable on top */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/45 via-transparent to-forest-950/15" />
    </div>
  )
}
