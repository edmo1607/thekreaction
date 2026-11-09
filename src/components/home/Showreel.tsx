import { useState } from 'react'
import { Icon } from '../Icon'

/**
 * Showreel slot. Set VITE_SHOWREEL_URL to an mp4 (e.g. a Supabase storage URL)
 * or a YouTube embed URL; until then a placeholder is shown.
 */
const SHOWREEL = (import.meta.env.VITE_SHOWREEL_URL as string | undefined) ?? ''
const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(SHOWREEL)

export function Showreel() {
  const [playing, setPlaying] = useState(false)

  return (
    <section className="wrap" id="reel" aria-label="Showreel">
      <div className="reel" data-reveal="">
        {SHOWREEL && !isEmbed && (
          <video src={SHOWREEL} autoPlay muted loop playsInline controls={playing} />
        )}
        {SHOWREEL && isEmbed && playing && (
          <iframe
            src={`${SHOWREEL}${SHOWREEL.includes('?') ? '&' : '?'}autoplay=1`}
            title="The K Reaction showreel"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
        {!(SHOWREEL && (playing || !isEmbed)) && (
          <>
            <button
              type="button"
              className="reel__play"
              aria-label="Play showreel"
              onClick={() => (SHOWREEL ? setPlaying(true) : window.open('https://www.youtube.com/@cgthek.reaction', '_blank', 'noopener'))}
            >
              <Icon name="play" size={28} color="#fff" />
            </button>
            <span className="reel__caption">Showreel 2026</span>
          </>
        )}
      </div>
    </section>
  )
}
