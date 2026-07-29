import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },,
  { to: '/classement', label: 'Classement', icon: '◈' },
  { to: '/challenges', label: 'Challenges', icon: '◎' },
  { to: '/progression', label: 'Progression', icon: '◉' },
  { to: '/membres', label: 'Membres', icon: '◉' },
  { to: '/profil', label: 'Mon profil', icon: '◉' },
  { to: '/soumettre', label: 'Soumettre une course', icon: '+' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const member = JSON.parse(localStorage.getItem('member') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('member')
    navigate('/login')
  }

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: '#0f1f3d',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '1.75rem 1.5rem' }}>
        <p style={{
          fontFamily: 'EB Garamond, serif', fontSize: '18px',
          fontWeight: 600, color: '#fff', lineHeight: 1.2,
        }}>
          Elite Runners
        </p>
        <p style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.4)',
          marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Tour du monde
        </p>
      </div>

      <nav style={{ flex: 1, padding: '0.5rem 0' }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '11px 1.5rem', fontSize: '14px', textDecoration: 'none',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
            borderLeft: isActive ? '3px solid #e67e22' : '3px solid transparent',
            transition: 'all 0.15s',
          })}>
            <span style={{ fontSize: '13px' }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: '#e67e22', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '12px', color: '#fff', fontWeight: 600, flexShrink: 0,
          }}>
            {member.name?.split(' ').map(n => n[0]).join('') || 'ER'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {member.name || 'Athlète'}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              {member.role || 'member'}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '8px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', color: 'rgba(255,255,255,0.5)',
          fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.color = '#fff' }}
          onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = 'rgba(255,255,255,0.5)' }}
        >
          Déconnexion →
        </button>
      </div>
    </aside>
  )
}