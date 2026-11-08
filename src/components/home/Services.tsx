import { Icon } from '../Icon'
import { SERVICES } from '../../content/site'
import { mediaUrl } from '../../lib/supabase'
import type { Project } from '../../lib/types'
import { useQuote } from './QuoteContext'

export function Services({ projects }: { projects: Project[] }) {
  const { serviceId, setServiceId, setFilter, scrollTo, startQuote, findPackage } = useQuote()
  const svc = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0]
  const svcPkg = svc.pkg === 'custom' ? undefined : findPackage(svc.pkg)
  const sample = projects.find((p) => p.cover_path && p.categories.some((c) => c.slug === svc.filter))
  const cover = mediaUrl(sample?.cover_path)

  return (
    <section className="wrap services" id="services">
      <span className="eyebrow">What we film</span>
      <div className="services__grid">
        <div className="services__tabs" role="tablist" aria-label="Services">
          {SERVICES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`svc-tab-${s.id}`}
              aria-selected={s.id === svc.id}
              aria-controls="svc-panel"
              className="services__tab"
              onClick={() => setServiceId(s.id)}
            >
              <span className="services__tab-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="services__tab-name">{s.name}</span>
            </button>
          ))}
        </div>

        <div className="services__panel" role="tabpanel" id="svc-panel" aria-labelledby={`svc-tab-${svc.id}`}>
          <div className="media" style={{ aspectRatio: '16 / 9' }}>
            <span className="media__badge media__badge--red">{svc.name}</span>
            {cover ? (
              <img src={cover} alt={sample?.title ?? svc.name} loading="lazy" />
            ) : (
              <span className="media__placeholder">{svc.name} sample</span>
            )}
          </div>
          <div className="services__body">
            <p className="services__desc">{svc.desc}</p>
            <ul className="checklist">
              {svc.items.map((it) => (
                <li key={it}>
                  <Icon name="check" className="accent" />
                  {it}
                </li>
              ))}
            </ul>
            <div className="services__foot">
              <span>
                Starts with <strong>{svcPkg ? `${svcPkg.name} · ${svcPkg.price}` : 'Custom quote'}</strong>
              </span>
              <div className="services__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setFilter(svc.filter)
                    scrollTo('work')
                  }}
                >
                  See examples
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => startQuote({ pkg: svcPkg ? svc.pkg : 'custom', eventType: svc.eventType })}
                >
                  {svc.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
