import { useState, type FormEvent } from 'react'
import { Icon } from '../Icon'
import { CONTACT, EVENT_TYPES, whatsappLink } from '../../content/site'
import { submitLead } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { useQuote } from './QuoteContext'

export function QuoteForm() {
  const { packages, packageName, pkg, setPkg, eventType, setEventType } = useQuote()
  const pkgOptions = [
    ...packages.map((p) => ({ id: p.slug, label: `${p.name} ${p.price}` })),
    { id: 'custom', label: 'Custom' },
  ]
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const waMessage = [
    `Hi The K Reaction! I'm ${name || '...'}.`,
    `I'm interested in the ${packageName(pkg)} package for: ${eventType}.`,
    date && `Date: ${date}.`,
    message,
  ]
    .filter(Boolean)
    .join(' ')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Please add your name.')
    if (!phone.trim() && !email.trim()) return setError('Add a phone/WhatsApp or an email so we can reply.')
    if (!supabase) {
      // Backend not configured yet → hand off to WhatsApp so the lead is never lost.
      // Opened synchronously so popup blockers allow it.
      window.open(whatsappLink(waMessage), '_blank', 'noopener')
      setDone(true)
      return
    }
    setSending(true)
    try {
      await submitLead({
        name,
        email,
        phone,
        event_type: eventType,
        event_date: date,
        package: packageName(pkg),
        message,
      })
      setDone(true)
    } catch {
      setError('Something went wrong sending your request. Please try WhatsApp instead.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="contact" id="quote">
      <div className="contact__box">
        <div className="contact__grid">
          <div>
            <h2 className="contact__title">Let's lock your date</h2>
            <p className="contact__lead">
              Tell us a little about your project. We reply with availability and a fixed price — no commitment.
            </p>
            <div className="contact__alts">
              <a className="btn btn--lg" href={whatsappLink()} target="_blank" rel="noopener">
                <Icon name="whatsapp" size={18} /> Prefer chat? WhatsApp {CONTACT.phoneDisplay}
              </a>
              <a className="plain" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
            </div>
          </div>

          <div className="form-card">
            {done ? (
              <div className="success" role="status">
                <div className="success__icon">
                  <Icon name="check" size={28} strokeWidth={2.4} color="#fff" />
                </div>
                <h3>Request received</h3>
                <p>We'll message you about the {packageName(pkg)} package shortly. Want a faster answer?</p>
                <a className="btn btn--ghost" href={whatsappLink(waMessage)} target="_blank" rel="noopener">
                  Continue on WhatsApp
                </a>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setDone(false)
                    setMessage('')
                  }}
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={onSubmit} noValidate>
                <div>
                  <span className="field__label" id="pkg-label">
                    Package
                  </span>
                  <div className="seg" role="group" aria-labelledby="pkg-label">
                    {pkgOptions.map((o) => (
                      <button key={o.id} type="button" aria-pressed={pkg === o.id} onClick={() => setPkg(o.id)}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form__row">
                  <label className="field">
                    Event date
                    <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </label>
                  <label className="field">
                    Type of project
                    <select className="input" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                      {EVENT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="field">
                  Your name
                  <input
                    className="input"
                    type="text"
                    autoComplete="name"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={120}
                  />
                </label>
                <div className="form__row">
                  <label className="field">
                    Phone / WhatsApp
                    <input
                      className="input"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(305) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={40}
                    />
                  </label>
                  <label className="field">
                    Email
                    <input
                      className="input"
                      type="email"
                      autoComplete="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={200}
                    />
                  </label>
                </div>
                <label className="field">
                  Anything else? (optional)
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Location, vibe, budget…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={2000}
                  />
                </label>
                {error && (
                  <p className="form__error" role="alert">
                    {error}
                  </p>
                )}
                <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={sending}>
                  {sending ? 'Sending…' : 'Send — get my quote'}
                </button>
                <span className="form__hint">We usually reply within a few hours.</span>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
