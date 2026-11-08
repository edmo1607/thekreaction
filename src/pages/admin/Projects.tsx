import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { DropZone } from '../../components/admin/DropZone'
import { useAsync } from '../../hooks/useAsync'
import { deleteProject, fetchAllProjects, fetchCategories, saveProject } from '../../lib/api'
import { mediaUrl } from '../../lib/supabase'
import type { Project, ProjectStatus } from '../../lib/types'

interface Draft {
  id: string | null
  title: string
  client: string
  description: string
  song: string
  event_date: string
  cover_path: string | null
  video_path: string | null
  video_url: string
  videoMode: 'upload' | 'link'
  featured: boolean
  status: ProjectStatus
  categoryIds: string[]
}

const EMPTY: Draft = {
  id: null,
  title: '',
  client: '',
  description: '',
  song: '',
  event_date: '',
  cover_path: null,
  video_path: null,
  video_url: '',
  videoMode: 'upload',
  featured: false,
  status: 'draft',
  categoryIds: [],
}

function toDraft(p: Project): Draft {
  return {
    id: p.id,
    title: p.title,
    client: p.client ?? '',
    description: p.description ?? '',
    song: p.song ?? '',
    event_date: p.event_date ?? '',
    cover_path: p.cover_path,
    video_path: p.video_path,
    video_url: p.video_url ?? '',
    videoMode: p.video_url && !p.video_path ? 'link' : 'upload',
    featured: p.featured,
    status: p.status,
    categoryIds: p.categories.map((c) => c.id),
  }
}

export default function Projects() {
  const projects = useAsync(fetchAllProjects)
  const categories = useAsync(fetchCategories)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = projects.data ?? []
    return q ? all.filter((p) => `${p.title} ${p.client ?? ''}`.toLowerCase().includes(q)) : all
  }, [projects.data, query])

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
    setNotice('')
  }

  function select(p: Project | null) {
    setDraft(p ? toDraft(p) : EMPTY)
    setNotice('')
    setError('')
  }

  function toggleCategory(id: string) {
    set('categoryIds', draft.categoryIds.includes(id) ? draft.categoryIds.filter((c) => c !== id) : [...draft.categoryIds, id])
  }

  async function save(status: ProjectStatus) {
    setError('')
    if (!draft.title.trim()) return setError('Add a title first.')
    if (status === 'published' && !draft.cover_path) return setError('Add a cover image before publishing.')
    setSaving(true)
    try {
      const id = await saveProject(draft.id, {
        title: draft.title,
        client: draft.client,
        description: draft.description,
        song: draft.song,
        event_date: draft.event_date,
        cover_path: draft.cover_path,
        video_path: draft.videoMode === 'upload' ? draft.video_path : null,
        video_url: draft.videoMode === 'link' ? draft.video_url : '',
        featured: draft.featured,
        status,
        categoryIds: draft.categoryIds,
      })
      setDraft((d) => ({ ...d, id, status }))
      setNotice(status === 'published' ? 'Published to website' : 'Draft saved')
      projects.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    const p = projects.data?.find((x) => x.id === draft.id)
    if (!p || !window.confirm(`Delete “${p.title}”? This also removes its uploaded files.`)) return
    setSaving(true)
    try {
      await deleteProject(p)
      select(null)
      projects.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Projects</h1>
          <p>What you publish here shows in “Our work” on the website.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => select(null)}>
          <Icon name="plus" strokeWidth={2.2} /> New project
        </button>
      </div>

      {(projects.error || categories.error) && (
        <p className="notice" style={{ marginBottom: 16 }}>
          {(projects.error ?? categories.error)?.message}
        </p>
      )}

      <div className="split">
        <section className="panel" aria-label="Project list">
          <label className="search">
            <Icon name="search" />
            <span className="sr-only">Search projects</span>
            <input type="search" placeholder="Search projects" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="plist">
            {projects.loading && !projects.data && <p className="prow__meta">Loading…</p>}
            {projects.data && list.length === 0 && (
              <p className="prow__meta" style={{ padding: 8 }}>
                {query ? 'No matches.' : 'No projects yet — create your first one.'}
              </p>
            )}
            {list.map((p) => {
              const thumb = mediaUrl(p.cover_path)
              return (
                <button
                  key={p.id}
                  type="button"
                  className="prow"
                  aria-current={draft.id === p.id}
                  onClick={() => select(p)}
                >
                  <span className="prow__thumb">{thumb ? <img src={thumb} alt="" /> : <Icon name="play" size={14} />}</span>
                  <span className="prow__text">
                    <span className="prow__title">
                      {p.featured && <span title="Featured">★ </span>}
                      {p.title}
                    </span>
                    <span className="prow__meta">
                      {[p.client, p.categories.map((c) => c.name).join(', ') || 'No category'].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className={`pill${p.status === 'published' ? ' pill--live' : ''}`}>
                    {p.status === 'published' ? 'Live' : 'Draft'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel editor" aria-label="Project editor">
          <div className="editor__top">
            <h2>{draft.id ? 'Edit project' : 'New project'}</h2>
            {notice && (
              <span className="saved" role="status">
                <Icon name="check" strokeWidth={2.4} />
                {notice}
              </span>
            )}
          </div>

          <div className="grid-2">
            <div className="field">
              <span className="field__label">Cover image</span>
              <DropZone kind="cover" path={draft.cover_path} onChange={(p) => set('cover_path', p)} />
            </div>
            <div className="field">
              <span className="field__label">Video</span>
              <div className="toggle-group" role="group" aria-label="Video source">
                <button type="button" aria-pressed={draft.videoMode === 'upload'} onClick={() => set('videoMode', 'upload')}>
                  Upload file
                </button>
                <button type="button" aria-pressed={draft.videoMode === 'link'} onClick={() => set('videoMode', 'link')}>
                  Paste link
                </button>
              </div>
              {draft.videoMode === 'upload' ? (
                <DropZone kind="video" path={draft.video_path} onChange={(p) => set('video_path', p)} />
              ) : (
                <label className="field">
                  YouTube, Instagram or Vimeo link
                  <input
                    className="input"
                    type="url"
                    placeholder="https://www.instagram.com/reel/…"
                    value={draft.video_url}
                    onChange={(e) => set('video_url', e.target.value)}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid-2">
            <label className="field">
              Title
              <input
                className="input"
                value={draft.title}
                maxLength={160}
                placeholder="e.g. Pride Month 2024 recap"
                onChange={(e) => set('title', e.target.value)}
              />
            </label>
            <label className="field">
              Client
              <input
                className="input"
                value={draft.client}
                placeholder="e.g. Palace Bar"
                onChange={(e) => set('client', e.target.value)}
              />
            </label>
          </div>

          <div className="field">
            <span className="field__label" id="cats-label">
              Categories · used for the website filters
            </span>
            <div className="chips" role="group" aria-labelledby="cats-label">
              {(categories.data ?? []).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="chip"
                  aria-pressed={draft.categoryIds.includes(c.id)}
                  onClick={() => toggleCategory(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            Description
            <textarea
              className="input"
              rows={4}
              placeholder="Short story of the project — what, where, the vibe."
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </label>

          <div className="grid-2">
            <label className="field">
              Song / music used
              <input
                className="input"
                value={draft.song}
                placeholder="Artist — Track name"
                onChange={(e) => set('song', e.target.value)}
              />
            </label>
            <label className="field">
              Event date
              <input
                className="input"
                type="date"
                value={draft.event_date}
                onChange={(e) => set('event_date', e.target.value)}
              />
            </label>
          </div>

          <button type="button" className="switch" aria-pressed={draft.featured} onClick={() => set('featured', !draft.featured)}>
            <span className="switch__text">
              Feature on homepage
              <small>Shows first in “Our work”</small>
            </span>
            <span className="switch__track" aria-hidden="true" />
          </button>

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
              <button type="button" className="btn btn--ghost" onClick={() => save('draft')} disabled={saving}>
                {draft.status === 'published' && draft.id ? 'Unpublish' : 'Save draft'}
              </button>
              <button type="button" className="btn btn--primary" onClick={() => save('published')} disabled={saving}>
                {saving ? 'Saving…' : draft.status === 'published' && draft.id ? 'Update website' : 'Publish to website'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
