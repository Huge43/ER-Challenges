import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/classement', label: 'Classement', icon: '◈' },
  { to: '/challenges', label: 'Challenges', icon: '◎' },
  { to: '/membres', label: 'Membres', icon: '◉' },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: '#0f1f3d',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '1.75rem 1.5rem' }}>
        <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '18px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
          Elite Runners
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Tour du monde
        </p>
      </div>

      <nav style={{ flex: 1, padding: '0.5rem 0' }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '11px 1.5rem',
            fontSize: '14px',
            textDecoration: 'none',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
            borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
            transition: 'all 0.15s',
          })}>
            <span style={{ fontSize: '13px' }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff', fontWeight: 500 }}>
            ER
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>Admin</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>elite@runners.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}