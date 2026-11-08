import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'

// The dashboard is code-split so visitors never download it.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Login = lazy(() => import('./pages/admin/Login'))
const Projects = lazy(() => import('./pages/admin/Projects'))
const Leads = lazy(() => import('./pages/admin/Leads'))
const Categories = lazy(() => import('./pages/admin/Categories'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="login">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Projects />} />
            <Route path="leads" element={<Leads />} />
            <Route path="categories" element={<Categories />} />
          </Route>
          {/* Old Framer pages → sections of the new single page */}
          <Route path="/projects" element={<Navigate to="/#work" replace />} />
          <Route path="/pricing" element={<Navigate to="/#pricing" replace />} />
          <Route path="/contact" element={<Navigate to="/#quote" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
