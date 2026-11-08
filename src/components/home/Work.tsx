import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../Icon'
import { SERVICES } from '../../content/site'
import { mediaUrl } from '../../lib/supabase'
import { embedUrl } from '../../lib/video'
import type { Category, Project } from '../../lib/types'
import { useQuote } from './QuoteContext'

interface Props {
  projects: Project[]
  categories: Category[]
  loading: boolean
}

export function Work({ projects, categories, loading }: Props) {
  const { filter, setFilter, startQuote } = useQuote()
  const [open, setOpen] = useState<Project | null>(null)

  // Filters: categories that have work, plus every service category (so podcast / interior always show)
  const chips = useMemo(() => {
    const used = new Set(projects.flatMap((p) => p.categories.map((c) => c.slug)))
    const serviceSlugs = new Set(SERVICES.map((s) => s.filter))
    return categories.filter((c) => used.has(c.slug) || serviceSlugs.has(c.slug))
  }, [projects, categories])

  const visible = filter ? projects.filter((p) => p.categories.some((c) => c.slug === filter)) : projects
  const current = chips.find((c) => c.slug === filter)

  return (
    <section className="wrap work" id="work">
      <div className="section-head">
        <div>
          <span className="eyebrow">Our work</span>
          <h2 className="h2">See it before you book</h2>
        </div>
        <div className="filters" role="group" aria-label="Filter projects">
          <button type="button" className="chip" aria-pressed={!filter} onClick={() => setFilter('')}>
            All
          </button>
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={filter === c.slug}
              onClick={() => setFilter(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="empty">Loading projects…</p>
      ) : visible.length === 0 ? (
        <div className="empty">
          New {current ? current.name.toLowerCase() : ''} projects are being edited.{' '}
          <a
            href="#quote"
            onClick={(e) => {
              e.preventDefault()
              startQuote()
            }}
          >
            Ask us for samples
          </a>
        </div>
      ) : (
        <div className="work__grid">
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={() => setOpen(p)} />
          ))}
        </div>
      )}

      <div className="work__more">
        <button type="button" className="btn btn--ghost btn--lg" onClick={() => startQuote()}>
          Want this for your event? Get a quote
        </button>
      </div>

      {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
    </section>
  )
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const cover = mediaUrl(project.cover_path)
  const clip = mediaUrl(project.video_path)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (hover) void v.play().catch(() => {})
    else v.pause()
  }, [hover])

  return (
    <button
      type="button"
      className="card"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Watch ${project.title}`}
    >
      <div className="media">
        {project.categories[0] && <span className="media__badge">{project.categories[0].name}</span>}
        {cover && <img src={cover} alt="" loading="lazy" />}
        {clip && (
          <video
            ref={videoRef}
            src={clip}
            muted
            loop
            playsInline
            preload="none"
            style={{ opacity: hover ? 1 : 0, transition: 'opacity .2s' }}
          />
        )}
        <span className="media__play">
          <Icon name="play" size={18} color="#fff" />
        </span>
      </div>
      <div className="card__body">
        {project.client && <div className="card__client">{project.client}</div>}
        <div className="card__title">{project.title}</div>
      </div>
    </button>
  )
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { startQuote } = useQuote()
  const closeRef = useRef<HTMLButtonElement>(null)
  const clip = mediaUrl(project.video_path)
  const cover = mediaUrl(project.cover_path)
  const embed = embedUrl(project.video_url)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="icon-btn modal__close" aria-label="Close" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
        <div className="modal__media">
          {clip ? (
            <video src={clip} poster={cover ?? undefined} controls autoPlay playsInline />
          ) : embed ? (
            <iframe src={embed} title={project.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          ) : cover ? (
            <img src={cover} alt={project.title} />
          ) : null}
        </div>
        <div className="modal__body">
          <h3 className="modal__title" id="modal-title">
            {project.title}
          </h3>
          {(project.client || project.song) && (
            <div className="modal__meta">
              {[project.client, project.song && `Music: ${project.song}`].filter(Boolean).join(' · ')}
            </div>
          )}
          {project.categories.length > 0 && (
            <div className="tags">
              {project.categories.map((c) => (
                <span key={c.id} className="tag">
                  {c.name}
                </span>
              ))}
            </div>
          )}
          {project.description && <p style={{ margin: 0, color: 'var(--text-2)' }}>{project.description}</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                onClose()
                startQuote()
              }}
            >
              I want something like this
            </button>
            {project.video_url && !embed && (
              <a className="btn btn--ghost" href={project.video_url} target="_blank" rel="noopener">
                Watch on Instagram <Icon name="external" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
