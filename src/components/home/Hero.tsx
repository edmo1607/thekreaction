import { useState } from 'react'
import { Icon } from '../Icon'
import { PACKAGES, PLANS } from '../../content/site'
import { useQuote } from './QuoteContext'

export function Hero() {
  const { startQuote } = useQuote()
  const [planId, setPlanId] = useState(PLANS[0].id)
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0]
  const pkg = PACKAGES.find((p) => p.id === plan.pkg)

  return (
    <section className="hero" id="top">
      <div className="wrap hero__grid">
        <div>
          <span className="status">
            <span className="status__dot" aria-hidden="true" />
            Miami video studio · Booking now
          </span>
          <h1 className="hero__title">
            Video that makes your event <span className="accent">unforgettable.</span>
          </h1>
          <p className="hero__lead">
            Nightlife, festivals, live sets, podcasts, interior design and brands across Miami. Filmed, edited and
            delivered as ready-to-post reels — from $300.
          </p>
          <div className="hero__proof">
            {['50+ projects delivered', 'Reels in 15–30 sec formats', 'Reply on WhatsApp'].map((t) => (
              <span key={t}>
                <Icon name="check" className="accent" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="qq">
          <span className="qq__label">Quick quote · 2 taps</span>
          <h2 className="qq__title" id="qq-title">
            What are you planning?
          </h2>
          <div className="qq__options" role="group" aria-labelledby="qq-title">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="qq__option"
                aria-pressed={p.id === planId}
                onClick={() => setPlanId(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="qq__rec" aria-live="polite">
            <div className="qq__rec-top">
              <span>We recommend</span>
              <span className="qq__price">{pkg ? pkg.price : 'Custom'}</span>
            </div>
            <div className="qq__pkg">{pkg ? `${pkg.name} package` : 'Custom quote'}</div>
            <div className="qq__summary">
              {pkg
                ? `${pkg.hours} of filming · ${pkg.reels} edited reels`
                : 'Priced for your project — we reply with a fixed quote.'}
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--lg btn--block"
            onClick={() => startQuote({ pkg: plan.pkg, eventType: plan.eventType })}
          >
            Check my date <Icon name="arrow" />
          </button>
        </div>
      </div>
    </section>
  )
}
