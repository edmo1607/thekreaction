import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { fetchLeads, updateLeadStatus } from '../../lib/api'
import type { LeadStatus } from '../../lib/types'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'booked', 'lost']

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits.length === 10 ? `1${digits}` : digits}`
}

export default function Leads() {
  const leads = useAsync(fetchLeads)
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all')
  const [error, setError] = useState('')

  const all = leads.data ?? []
  const shown = filter === 'all' ? all : all.filter((l) => l.status === filter)
  const count = (s: LeadStatus) => all.filter((l) => l.status === s).length

  async function changeStatus(id: string, status: LeadStatus) {
    setError('')
    const prev = all
    leads.setData((d) => d?.map((l) => (l.id === id ? { ...l, status } : l)) ?? null)
    try {
      await updateLeadStatus(id, status)
    } catch (err) {
      leads.setData(() => prev)
      setError(err instanceof Error ? err.message : 'Could not update.')
    }
  }

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Leads</h1>
          <p>Quote requests from the website. Reply fast — the first studio to answer usually books.</p>
        </div>
      </div>

      <div className="filters" role="group" aria-label="Filter leads" style={{ marginBottom: 16 }}>
        <button type="button" className="chip" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          All · {all.length}
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            style={{ textTransform: 'capitalize' }}
          >
            {s} · {count(s)}
          </button>
        ))}
      </div>

      {(leads.error || error) && (
        <p className="notice" style={{ marginBottom: 16 }}>
          {leads.error?.message ?? error}
        </p>
      )}

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Received</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Project</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.loading && !leads.data && (
              <tr>
                <td colSpan={5}>Loading…</td>
              </tr>
            )}
            {leads.data && shown.length === 0 && (
              <tr>
                <td colSpan={5}>No leads here yet.</td>
              </tr>
            )}
            {shown.map((l) => (
              <tr key={l.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {new Date(l.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  <small>{new Date(l.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</small>
                </td>
                <td>
                  <strong style={{ fontWeight: 600 }}>{l.name}</strong>
                  {l.message && <small style={{ maxWidth: 320 }}>{l.message}</small>}
                </td>
                <td>
                  {l.phone && (
                    <a href={waLink(l.phone)} target="_blank" rel="noopener">
                      {l.phone} ↗
                    </a>
                  )}
                  {l.email && (
                    <small>
                      <a href={`mailto:${l.email}`}>{l.email}</a>
                    </small>
                  )}
                </td>
                <td>
                  {l.event_type ?? '—'}
                  <small>
                    {[l.package, l.event_date && new Date(`${l.event_date}T12:00`).toLocaleDateString()].filter(Boolean).join(' · ')}
                  </small>
                </td>
                <td>
                  <label className="sr-only" htmlFor={`st-${l.id}`}>
                    Status for {l.name}
                  </label>
                  <select
                    id={`st-${l.id}`}
                    className="input"
                    value={l.status}
                    onChange={(e) => changeStatus(l.id, e.target.value as LeadStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
