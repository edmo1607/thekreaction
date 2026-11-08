import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { useAsync } from '../../hooks/useAsync'
import {
  createPackage,
  deletePackage,
  fetchAllPackages,
  swapPackageOrder,
  updatePackage,
  type PackageInput,
} from '../../lib/api'
import type { Package } from '../../lib/types'

interface Draft {
  id: string | null
  name: string
  price: string
  hours: string
  reels: string
  reel_length: string
  ideal: string
  features: string
  popular: boolean
  visible: boolean
}

const EMPTY: Draft = {
  id: null,
  name: '',
  price: '',
  hours: '',
  reels: '',
  reel_length: '15–30 sec',
  ideal: '',
  features: 'Extra hours available',
  popular: false,
  visible: true,
}

function toDraft(p: Package): Draft {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    hours: p.hours ?? '',
    reels: p.reels == null ? '' : String(p.reels),
    reel_length: p.reel_length ?? '',
    ideal: p.ideal ?? '',
    features: p.features.join('\n'),
    popular: p.popular,
    visible: p.visible,
  }
}

function toInput(d: Draft): PackageInput {
  const reels = d.reels.trim() === '' ? null : Math.max(0, Math.min(100, Math.round(Number(d.reels))))
  return {
    name: d.name,
    price: d.price,
    hours: d.hours,
    reels: Number.isFinite(reels) ? reels : null,
    reel_length: d.reel_length,
    ideal: d.ideal,
    features: d.features.split('\n'),
    popular: d.popular,
    visible: d.visible,
  }
}

export default function Pricing() {
  const packages = useAsync(fetchAllPackages)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const list = packages.data ?? []
  const missingTable = packages.error && /packages/i.test(packages.error.message)

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
    setNotice('')
  }

  function select(p: Package | null) {
    setDraft(p ? toDraft(p) : EMPTY)
    setNotice('')
    setError('')
  }

  async function save() {
    setError('')
    if (!draft.name.trim()) return setError('Give the package a name.')
    if (!draft.price.trim()) return setError('Add a price, e.g. $350.')
    setSaving(true)
    try {
      if (draft.id) {
        await updatePackage(draft.id, toInput(draft))
      } else {
        const created = await createPackage(toInput(draft), list)
        setDraft(toDraft(created))
      }
      setNotice(draft.visible ? 'Saved — live on the website' : 'Saved (hidden from website)')
      packages.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    const p = list.find((x) => x.id === draft.id)
    if (!p || !window.confirm(`Delete the “${p.name}” package? It disappears from the website.`)) return
    setSaving(true)
    try {
      await deletePackage(p.id)
      select(null)
      packages.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.')
    } finally {
      setSaving(false)
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const a = list[index]
    const b = list[index + dir]
    if (!a || !b) return
    setError('')
    // optimistic reorder
    packages.setData((d) => {
      if (!d) return d
      const next = [...d]
      next[index] = { ...b, sort: a.sort }
      next[index + dir] = { ...a, sort: b.sort }
      return next
    })
    try {
      await swapPackageOrder(a, b)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reorder.')
      packages.reload()
    }
  }

  const preview = toInput(draft)

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Pricing</h1>
          <p>These packages appear in “Pick a package”, the hero quick quote and the quote form.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => select(null)}>
          <Icon name="plus" strokeWidth={2.2} /> New package
        </button>
      </div>

      {missingTable ? (
        <p className="notice" style={{ marginBottom: 16 }}>
          The <code>packages</code> table doesn't exist yet. In Supabase → SQL Editor, run{' '}
          <code>supabase/migrations/002_packages.sql</code> from the repo, then reload this page. Until then the website
          shows the built-in prices.
        </p>
      ) : (
        packages.error && (
          <p className="notice" style={{ marginBottom: 16 }}>
            {packages.error.message}
          </p>
        )
      )}

      <div className="split">
        <section className="panel" aria-label="Packages">
          <div className="plist" style={{ marginTop: 0 }}>
            {packages.loading && !packages.data && <p className="prow__meta">Loading…</p>}
            {packages.data && list.length === 0 && (
              <p className="prow__meta" style={{ padding: 8 }}>
                No packages yet — create your first one.
              </p>
            )}
            {list.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  className="prow"
                  aria-current={draft.id === p.id}
                  onClick={() => select(p)}
                >
                  <span className="prow__thumb" style={{ width: 64, height: 48, fontFamily: 'var(--display)', fontSize: 18, color: 'var(--text)' }}>
                    {p.price}
                  </span>
                  <span className="prow__text">
                    <span className="prow__title">
                      {p.popular && <span title="Most booked">★ </span>}
                      {p.name}
                    </span>
                    <span className="prow__meta">
                      {[p.hours, p.reels != null && `${p.reels} reels`].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </span>
                  <span className={`pill${p.visible ? ' pill--live' : ''}`}>{p.visible ? 'Live' : 'Hidden'}</span>
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 34, height: 30 }}
                    aria-label={`Move ${p.name} up`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <Icon name="chevron" size={14} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 34, height: 30 }}
                    aria-label={`Move ${p.name} down`}
                    disabled={i === list.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <Icon name="chevron" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="prow__meta" style={{ padding: '12px 8px 0', whiteSpace: 'normal' }}>
            Use the arrows to change the order on the website. Podcasts and interior design keep showing “Custom quote”.
          </p>
        </section>

        <section className="panel editor" aria-label="Package editor">
          <div className="editor__top">
            <h2>{draft.id ? 'Edit package' : 'New package'}</h2>
            {notice && (
              <span className="saved" role="status">
                <Icon name="check" strokeWidth={2.4} />
                {notice}
              </span>
            )}
          </div>

          <div className="grid-2">
            <label className="field">
              Name
              <input className="input" value={draft.name} maxLength={60} placeholder="e.g. Standard" onChange={(e) => set('name', e.target.value)} />
            </label>
            <label className="field">
              Price
              <input className="input" value={draft.price} maxLength={30} placeholder="e.g. $350" onChange={(e) => set('price', e.target.value)} />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              Filming time
              <input className="input" value={draft.hours} placeholder="e.g. 2 hours" onChange={(e) => set('hours', e.target.value)} />
            </label>
            <div className="grid-2" style={{ gap: 10 }}>
              <label className="field">
                Edited reels
                <input className="input" type="number" min={0} max={100} inputMode="numeric" value={draft.reels} placeholder="3" onChange={(e) => set('reels', e.target.value)} />
              </label>
              <label className="field">
                Reel length
                <input className="input" value={draft.reel_length} placeholder="15–30 sec" onChange={(e) => set('reel_length', e.target.value)} />
              </label>
            </div>
          </div>

          <label className="field">
            Short pitch
            <input className="input" value={draft.ideal} maxLength={140} placeholder="Ideal for business promos and event highlights." onChange={(e) => set('ideal', e.target.value)} />
          </label>

          <label className="field">
            Extra bullet points · one per line
            <textarea className="input" rows={3} value={draft.features} placeholder={'Extra hours available\nDrone shots included'} onChange={(e) => set('features', e.target.value)} />
          </label>

          <div className="grid-2">
            <button type="button" className="switch" aria-pressed={draft.popular} onClick={() => set('popular', !draft.popular)}>
              <span className="switch__text">
                Highlight as “Most booked”
                <small>Dark card with a red badge</small>
              </span>
              <span className="switch__track" aria-hidden="true" />
            </button>
            <button type="button" className="switch" aria-pressed={draft.visible} onClick={() => set('visible', !draft.visible)}>
              <span className="switch__text">
                Show on website
                <small>Off keeps it here as a draft</small>
              </span>
              <span className="switch__track" aria-hidden="true" />
            </button>
          </div>

          <div className="field">
            <span className="field__label">Preview</span>
            <div style={{ background: 'var(--paper)', borderRadius: 16, padding: 20 }}>
              <div className={`plan${preview.popular ? ' plan--dark' : ''}`} style={{ maxWidth: 360, margin: '0 auto', padding: 24 }}>
                <div className="plan__top">
                  <span>{preview.name || 'Package name'}</span>
                  {preview.popular && <span className="plan__badge">Most booked</span>}
                </div>
                <div className="plan__price" style={{ fontSize: 52 }}>
                  {preview.price || '$—'}
                </div>
                {preview.ideal && <p className="plan__ideal">{preview.ideal}</p>}
                <ul className="plan__list">
                  {preview.hours && (
                    <li>
                      <Icon name="clock" />
                      {preview.hours} of filming
                    </li>
                  )}
                  {preview.reels != null && (
                    <li>
                      <Icon name="reel" />
                      {preview.reels} edited reel{preview.reels === 1 ? '' : 's'}
                      {preview.reel_length ? ` (${preview.reel_length})` : ''}
                    </li>
                  )}
                  {preview.features
                    .map((f) => f.trim())
                    .filter(Boolean)
                    .map((f) => (
                      <li key={f}>
                        <Icon name="check" />
                        {f}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}

          <div className="editor__actions">
            {draft.id ? (
              <button type="button" className="btn btn--danger" onClick={remove} disabled={saving}>
                <Icon name="trash" /> Delete
              </button>
            ) : (
              <span />
            )}
            <div>
              <a className="btn btn--ghost" href="/#pricing" target="_blank" rel="noopener">
                View on website <Icon name="external" />
              </a>
              <button type="button" className="btn btn--primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Create package'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
