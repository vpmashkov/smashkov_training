import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Today' },
  { to: '/program', label: 'Program' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
