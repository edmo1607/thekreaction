import { useState } from 'react'
import { Icon } from '../Icon'
import { CONTACT, FAQS, PARTNERS, TESTIMONIALS, whatsappLink } from '../../content/site'
import { useQuote } from './QuoteContext'
import { reveal } from '../../hooks/useReveal'

export function Partners() {
  return (
    <section className="wrap partners" aria-label="Brand partners">
      <span className="eyebrow">Trusted by</span>
      <div className="marquee">
        <div className="marquee__track">
          <ul className="marquee__list">
            {PARTNERS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <ul className="marquee__list" aria-hidden="true">
            {PARTNERS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function Pricing() {
  const { packages, pkg, setPkg, startQuote } = useQuote()
  return (
    <section className="pricing" id="pricing">
      <div className="wrap pricing__inner">
        <div className="pricing__head" {...reveal()}>
          <span className="eyebrow">Simple pricing</span>
          <h2 className="h2">Pick a package</h2>
          <p>Filming and editing included. Need more time? Add extra hours to any package.</p>
        </div>
        {packages.length > 0 && (
          <div className="plans" style={{ ['--plan-count' as string]: Math.min(packages.length, 4) }}>
            {packages.map((p, i) => (
              <div
                key={p.id}
                {...reveal(i)}
                className={`plan${p.popular ? ' plan--dark' : ''}${pkg === p.slug ? ' plan--selected' : ''}`}
              >
                <div className="plan__top">
                  <h3 style={{ margin: 0, font: 'inherit' }}>{p.name}</h3>
                  {p.popular && <span className="plan__badge">Most booked</span>}
                </div>
                <div className="plan__price">{p.price}</div>
                {p.ideal && <p className="plan__ideal">{p.ideal}</p>}
                <ul className="plan__list">
                  {p.hours && (
                    <li>
                      <Icon name="clock" />
                      {p.hours} of filming
                    </li>
                  )}
                  {p.reels != null && (
                    <li>
                      <Icon name="reel" />
                      {p.reels} edited reel{p.reels === 1 ? '' : 's'}
                      {p.reel_length ? ` (${p.reel_length})` : ''}
                    </li>
                  )}
                  {p.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`btn btn--lg btn--block ${p.popular ? 'btn--primary' : 'btn--dark'}`}
                  onClick={() => {
                    setPkg(p.slug)
                    startQuote({ pkg: p.slug })
                  }}
                >
                  Book {p.name}
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="pricing__note">
          Podcast, interior design, music video or live stream?{' '}
          <a
            href="#quote"
            onClick={(e) => {
              e.preventDefault()
              startQuote({ pkg: 'custom' })
            }}
          >
            Ask for a custom quote
          </a>
        </p>
      </div>
    </section>
  )
}

const STEPS = [
  { title: 'Tell us your plan', text: 'Send the date and the vibe. We reply with a plan and a fixed price.' },
  { title: 'We film it', text: 'Pro cameras, drone and audio on site. You enjoy the event.' },
  { title: 'You post it', text: 'Edited, color-graded reels ready for Instagram, TikTok and YouTube.' },
]

export function Process() {
  return (
    <section className="wrap process" id="process">
      <div {...reveal()}>
        <span className="eyebrow">How it works</span>
        <h2 className="h2" style={{ marginBottom: 48 }}>
          Three steps. Zero stress.
        </h2>
      </div>
      <div className="grid-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="step" {...reveal(i)}>
            <div className="step__num">0{i + 1}</div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Testimonials() {
  return (
    <section className="quotes" aria-label="Client stories">
      <div className="wrap quotes__inner">
        <span className="eyebrow">Client stories</span>
        <div className="grid-3" style={{ marginTop: 32 }}>
          {TESTIMONIALS.map((t, i) => (
            <figure key={t.who} className="quote" {...reveal(i)}>
              <blockquote>“{t.text}”</blockquote>
              <figcaption>{t.who}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Faq() {
  const [openIdx, setOpenIdx] = useState(0)
  return (
    <section className="faq" id="faq">
      <h2 className="faq__title" {...reveal()}>Questions, answered</h2>
      <div className="faq__list">
        {FAQS.map((f, i) => {
          const isOpen = openIdx === i
          return (
            <div key={f.q} className="faq__item" {...reveal(Math.min(i, 5))}>
              <h3 style={{ margin: 0, font: 'inherit' }}>
                <button
                  type="button"
                  className="faq__q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenIdx(isOpen ? -1 : i)}
                >
                  {f.q}
                  <span className="faq__icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
              </h3>
              {isOpen && (
                <p className="faq__a" id={`faq-${i}`}>
                  {f.a}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__bar">
        <span>© {YEAR} The K Reaction · Miami, FL</span>
        <div className="footer__links">
          <a href={CONTACT.instagram} target="_blank" rel="noopener">
            Instagram
          </a>
          <a href={CONTACT.youtube} target="_blank" rel="noopener">
            YouTube
          </a>
          <a href={whatsappLink()} target="_blank" rel="noopener">
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}

export function MobileBar() {
  const { startQuote } = useQuote()
  return (
    <div className="mobile-bar">
      <a className="btn btn--ghost" href={whatsappLink()} target="_blank" rel="noopener">
        <Icon name="whatsapp" /> WhatsApp
      </a>
      <button type="button" className="btn btn--primary" onClick={() => startQuote()}>
        Get a free quote
      </button>
    </div>
  )
}
