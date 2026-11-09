import { Fragment, useState } from 'react'
import { Icon } from '../Icon'
import { PLANS } from '../../content/site'
import { packageSummary, useQuote } from './QuoteContext'

const TITLE = ['Video', 'that', 'makes', 'your', 'event', 'unforgettable.']

export function Hero() {
  const { startQuote, findPackage, packages } = useQuote()
  const [planId, setPlanId] = useState(PLANS[0].id)
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0]
  const pkg = findPackage(plan.pkg)
  const fromPrice = cheapestPrice(packages)

  return (
    <section className="hero" id="top">
      <div className="wrap hero__grid">
        <div>
          <span className="status intro" style={{ ['--d' as string]: '0ms' }}>
            <span className="status__dot" aria-hidden="true" />
            Miami video studio · Booking now
          </span>
          <h1 className="hero__title">
            {TITLE.map((w, i) => (
              <Fragment key={w}>
                <span className="w">
                  <span className={i === TITLE.length - 1 ? 'accent' : undefined} style={{ ['--i' as string]: i }}>
                    {w}
                  </span>
                </span>
                {i < TITLE.length - 1 && ' '}
              </Fragment>
            ))}
          </h1>
          <p className="hero__lead intro" style={{ ['--d' as string]: '650ms' }}>
            Nightlife, festivals, live sets, podcasts, interior design and brands across Miami. Filmed, edited and
            delivered as ready-to-post reels{fromPrice ? ` — from ${fromPrice}` : ''}.
          </p>
          <div className="hero__proof intro" style={{ ['--d' as string]: '800ms' }}>
            {['50+ projects delivered', 'Reels in 15–30 sec formats', 'Reply on WhatsApp'].map((t) => (
              <span key={t}>
                <Icon name="check" className="accent" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="qq intro" style={{ ['--d' as string]: '450ms' }}>
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
                ? packageSummary(pkg) || pkg.ideal
                : 'Priced for your project — we reply with a fixed quote.'}
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--lg btn--block"
            onClick={() => startQuote({ pkg: pkg ? plan.pkg : 'custom', eventType: plan.eventType })}
          >
            Check my date <Icon name="arrow" />
          </button>
        </div>
      </div>
    </section>
  )
}

/** Lowest "$123" price among the packages, for the hero line. Returns null if none parse. */
function cheapestPrice(packages: { price: string }[]): string | null {
  let best: { n: number; label: string } | null = null
  for (const p of packages) {
    const m = p.price.replace(/,/g, '').match(/\$\s?(\d+(?:\.\d+)?)/)
    if (m) {
      const n = Number(m[1])
      if (!best || n < best.n) best = { n, label: `$${m[1]}` }
    }
  }
  return best?.label ?? null
}
