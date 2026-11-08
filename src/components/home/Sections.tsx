import { useState } from 'react'
import { Icon } from '../Icon'
import { CONTACT, FAQS, PACKAGES, PARTNERS, TESTIMONIALS, whatsappLink } from '../../content/site'
import { useQuote } from './QuoteContext'

export function Partners() {
  return (
    <section className="wrap partners" aria-label="Brand partners">
      <span className="eyebrow">Trusted by</span>
      {PARTNERS.map((p) => (
        <span key={p}>{p}</span>
      ))}
    </section>
  )
}

export function Pricing() {
  const { pkg, setPkg, startQuote } = useQuote()
  return (
    <section className="pricing" id="pricing">
      <div className="wrap pricing__inner">
        <div className="pricing__head">
          <span className="eyebrow">Simple pricing</span>
          <h2 className="h2">Pick a package</h2>
          <p>Filming and editing included. Need more time? Add extra hours to any package.</p>
        </div>
        <div className="grid-3">
          {PACKAGES.map((p) => (
            <div
              key={p.id}
              className={`plan${p.popular ? ' plan--dark' : ''}${pkg === p.id ? ' plan--selected' : ''}`}
            >
              <div className="plan__top">
                <h3 style={{ margin: 0, font: 'inherit' }}>{p.name}</h3>
                {p.popular && <span className="plan__badge">Most booked</span>}
              </div>
              <div className="plan__price">{p.price}</div>
              <p className="plan__ideal">{p.ideal}</p>
              <ul className="plan__list">
                <li>
                  <Icon name="clock" />
                  {p.hours} of filming
                </li>
                <li>
                  <Icon name="reel" />
                  {p.reels} edited reels (15–30 sec)
                </li>
                <li>
                  <Icon name="check" />
                  Extra hours available
                </li>
              </ul>
              <button
                type="button"
                className={`btn btn--lg btn--block ${p.popular ? 'btn--primary' : 'btn--dark'}`}
                onClick={() => {
                  setPkg(p.id)
                  startQuote({ pkg: p.id })
                }}
              >
                Book {p.name}
              </button>
            </div>
          ))}
        </div>
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
      <span className="eyebrow">How it works</span>
      <h2 className="h2" style={{ marginBottom: 48 }}>
        Three steps. Zero stress.
      </h2>
      <div className="grid-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="step">
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
          {TESTIMONIALS.map((t) => (
            <figure key={t.who} className="quote">
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
      <h2 className="faq__title">Questions, answered</h2>
      <div className="faq__list">
        {FAQS.map((f, i) => {
          const isOpen = openIdx === i
          return (
            <div key={f.q} className="faq__item">
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
