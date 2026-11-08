import { useEffect, useState } from 'react'
import { Logo } from '../Logo'
import { Icon } from '../Icon'
import { SERVICES, whatsappLink } from '../../content/site'
import { useQuote } from './QuoteContext'

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'process', label: 'How it works' },
  { id: 'faq', label: 'FAQ' },
]

export function Header() {
  const { setServiceId, scrollTo, startQuote } = useQuote()
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMegaOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function go(id: string) {
    setMegaOpen(false)
    setMobileOpen(false)
    scrollTo(id)
  }

  function pickService(id: string) {
    setServiceId(id)
    go('services')
  }

  return (
    <header className="header">
      <nav className="wrap header__bar" aria-label="Main">
        <Logo />
        <div className="header__links">
          <button
            type="button"
            className="header__menu-btn"
            aria-expanded={megaOpen}
            aria-controls="services-menu"
            onClick={() => setMegaOpen((o) => !o)}
          >
            Services <Icon name="chevron" size={12} strokeWidth={2.4} />
          </button>
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => {
                e.preventDefault()
                go(l.id)
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="header__actions">
          <a className="icon-btn icon-btn--wa" href={whatsappLink()} target="_blank" rel="noopener" aria-label="WhatsApp us">
            <Icon name="whatsapp" size={18} strokeWidth={1.8} />
          </a>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setMegaOpen(false)
              setMobileOpen(false)
              startQuote()
            }}
          >
            Get a free quote
          </button>
          <button
            type="button"
            className="icon-btn header__burger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size={18} />
          </button>
        </div>
      </nav>

      {megaOpen && (
        <div className="mega" id="services-menu">
          <div className="wrap mega__grid">
            {SERVICES.map((s, i) => (
              <button key={s.id} type="button" className="mega__item" onClick={() => pickService(s.id)}>
                <span className="mega__num">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="mega__name">{s.name}</span>
                  <span className="mega__short">{s.short}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="mobile-nav" id="mobile-nav">
          <div className="wrap">
            {SERVICES.map((s) => (
              <button key={s.id} type="button" onClick={() => pickService(s.id)}>
                {s.name}
              </button>
            ))}
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.id)
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
