import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { Icon } from '../../components/Icon'
import { useSession } from '../../hooks/useSession'
import { supabase } from '../../lib/supabase'
import '../../styles/admin.css'

export default function AdminLayout() {
  const { session, isAdmin, loading } = useSession()
  const location = useLocation()

  if (!supabase) {
    return (
      <div className="login">
        <div className="login__card">
          <Logo to="/" />
          <h1>Dashboard not connected</h1>
          <p className="notice">
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see README → Supabase setup),
            then rebuild.
          </p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="login">Loading…</div>
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) {
    return (
      <div className="login">
        <div className="login__card">
          <Logo to="/" />
          <h1>No admin access</h1>
          <p className="notice">
            You're signed in as {session.user.email}, but this account isn't an admin yet. Add it to the{' '}
            <code>admins</code> table (see README).
          </p>
          <button type="button" className="btn btn--ghost" onClick={() => supabase?.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <aside className="admin__side">
        <div className="admin__brand">
          <Logo to="/admin" label="Dashboard home" />
          <small>Admin</small>
        </div>
        <nav className="admin__nav" aria-label="Dashboard">
          <NavLink to="/admin" end>
            Projects
          </NavLink>
          <NavLink to="/admin/leads">Leads</NavLink>
          <NavLink to="/admin/pricing">Pricing</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
        </nav>
        <div className="admin__side-foot">
          <span>{session.user.email}</span>
          <a href="/" target="_blank" rel="noopener">
            <Icon name="external" /> View website
          </a>
          <button type="button" onClick={() => supabase?.auth.signOut()}>
            <Icon name="logout" /> Sign out
          </button>
        </div>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  )
}
