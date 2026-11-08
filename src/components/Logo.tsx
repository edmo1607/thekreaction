import { Link } from 'react-router-dom'

export function Logo({ to = '/', label = 'The K Reaction home' }: { to?: string; label?: string }) {
  return (
    <Link to={to} className="logo" aria-label={label}>
      <span className="logo__the" aria-hidden="true">
        The
      </span>
      <span className="logo__word" aria-hidden="true">
        Rea<span className="logo__k">K</span>tion
      </span>
    </Link>
  )
}
