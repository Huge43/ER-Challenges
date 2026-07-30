import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useIsMobile from '../hooks/useIsMobile'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/classement', label: 'Classement', icon: 'leaderboard' },
  { to: '/challenges', label: 'Challenges', icon: 'emoji_events' },
  { to: '/progression', label: 'Progression', icon: 'trending_up' },
  { to: '/membres', label: 'Membres', icon: 'group' },
  { to: '/profil', label: 'Mon profil', icon: 'person' },
  { to: '/soumettre', label: 'Soumettre une course', icon: 'add_circle' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const member = JSON.parse(localStorage.getItem('member') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('member')
    navigate('/login')
  }

  const SidebarContent = (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: '#0f1f3d',
      display: 'flex',
      flexDirection: 'column',
      position: isMobile ? 'fixed' : 'relative',
      top: 0, left: 0,
      zIndex: 1001,
      transform: isMobile ? (open ? 'translateX(0)' : 'translateX(-100%)') : 'none',
      transition: 'transform 0.25s ease',
    }}>
      <div style={{ padding: '1.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            Elite Runners
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Tour du monde
          </p>
        </div>
        {isMobile && (
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0 }}>
            <span className="material-symbols-rounded">close</span>
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: '0.5rem 0' }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end onClick={() => setOpen(false)} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '11px 1.5rem', fontSize: '14px', textDecoration: 'none',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
            borderLeft: isActive ? '3px solid #e67e22' : '3px solid transparent',
            transition: 'all 0.15s',
          })}>
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{link.icon}</span>
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
          fontSize: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>logout</span>
          Déconnexion
        </button>
      </div>
    </aside>
  )

  if (!isMobile) return SidebarContent

  return (
    <>
      {/* Barre du haut mobile avec bouton hamburger */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
        background: '#0f1f3d', display: 'flex', alignItems: 'center',
        padding: '0 1rem', gap: '12px', zIndex: 1000,
      }}>
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '26px' }}>menu</span>
        </button>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#fff' }}>
          Elite Runners
        </p>
      </div>

      {/* Overlay sombre quand le menu est ouvert */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        }} />
      )}

      {SidebarContent}
    </>
  )
}