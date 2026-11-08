import { useState, type FormEvent } from 'react'
import { Icon } from '../../components/Icon'
import { useAsync } from '../../hooks/useAsync'
import { createCategory, deleteCategory, fetchAllProjects, fetchCategories, renameCategory } from '../../lib/api'
import type { Category } from '../../lib/types'

export default function Categories() {
  const cats = useAsync(fetchCategories)
  const projects = useAsync(fetchAllProjects)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const usage = (id: string) => (projects.data ?? []).filter((p) => p.categories.some((c) => c.id === id)).length

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    try {
      const max = Math.max(0, ...(cats.data ?? []).map((c) => c.sort))
      await createCategory(name, max + 1)
      setName('')
      cats.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add category.')
    }
  }

  async function rename(c: Category, value: string) {
    if (!value.trim() || value.trim() === c.name) return
    setError('')
    try {
      await renameCategory(c.id, value)
      cats.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename.')
    }
  }

  async function remove(c: Category) {
    const n = usage(c.id)
    const msg = n
      ? `Delete “${c.name}”? It will be removed from ${n} project${n === 1 ? '' : 's'}.`
      : `Delete “${c.name}”?`
    if (!window.confirm(msg)) return
    setError('')
    try {
      await deleteCategory(c.id)
      cats.reload()
      projects.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.')
    }
  }

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Categories</h1>
          <p>These become the filter buttons in “Our work”. Rename by editing the text and clicking away.</p>
        </div>
      </div>

      {(error || cats.error) && (
        <p className="notice" style={{ marginBottom: 16 }}>
          {error || cats.error?.message}
        </p>
      )}

      <div className="panel" style={{ maxWidth: 720 }}>
        <form onSubmit={add} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <label className="sr-only" htmlFor="new-cat">
            New category name
          </label>
          <input
            id="new-cat"
            className="input"
            placeholder="New category, e.g. Weddings"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="btn btn--primary">
            <Icon name="plus" /> Add
          </button>
        </form>
        {(cats.data ?? []).map((c) => (
          <div key={c.id} className="cat-row">
            <label className="sr-only" htmlFor={`cat-${c.id}`}>
              Category name
            </label>
            <input
              id={`cat-${c.id}`}
              className="input"
              defaultValue={c.name}
              maxLength={60}
              onBlur={(e) => rename(c, e.target.value)}
            />
            <span className="cat-row__count">
              {usage(c.id)} project{usage(c.id) === 1 ? '' : 's'}
            </span>
            <button type="button" className="icon-btn" aria-label={`Delete ${c.name}`} onClick={() => remove(c)}>
              <Icon name="trash" />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
