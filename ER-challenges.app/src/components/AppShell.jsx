// Coque de l'app connectée : en-tête, barre d'onglets en bas, menu latéral
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import api from '../api'
import { Icon, Brand, Avatar } from './ui'
import { C } from './theme'

const TABS = [
  { to: '/dashboard', label: 'Accueil', icon: 'home' },
  { to: '/classement', label: 'Classement', icon: 'trophy' },
  { to: '/soumettre', label: 'Ajouter', add: true },
  { to: '/profil', label: 'Profil', icon: 'person' },
]

// Pages de gestion (tableaux, grilles) : colonne plus large sur ordinateur
const WIDE = ['/challenges', '/membres']

function MenuDrawer({ onClose, activeCount }) {
  const navigate = useNavigate()
  const member = JSON.parse(localStorage.getItem('member') || '{}')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const go = (to) => { onClose(); navigate(to) }
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('member')
    navigate('/login')
  }

  const items = [
    { to: '/challenges', icon: 'flag', label: 'Défis', sub: 'Vos objectifs, notre énergie', badge: activeCount },
    { to: '/progression', icon: 'monitoring', label: 'Progression', sub: 'Chaque petit pas compte' },
    { to: '/membres', icon: 'group', label: 'Membres', sub: 'Les runners à vos côtés' },
  ]

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(22,34,63,0.45)', zIndex: 1100 }} />
      <aside role="dialog" aria-modal="true" aria-label="Menu" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(340px, 88vw)', zIndex: 1101,
        background: C.card, borderRadius: '24px 0 0 24px', padding: '1.5rem 1.25rem',
        display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 30px rgba(22,34,63,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: C.text }}>Menu</h2>
          <button onClick={onClose} aria-label="Fermer le menu" style={{
            width: 42, height: 42, borderRadius: '12px', border: 'none', background: C.bg, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="close" color={C.text} />
          </button>
        </div>

        <button onClick={() => go('/profil')} style={{
          display: 'flex', alignItems: 'center', gap: '14px', background: C.bg, border: 'none',
          borderRadius: '16px', padding: '14px', cursor: 'pointer', textAlign: 'left', marginBottom: '1.75rem',
        }}>
          <Avatar name={member.name} size={48} />
          <span>
            <span style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: C.text }}>{member.name}</span>
            <span style={{ display: 'block', fontSize: '12px', color: C.muted }}>
              {member.role === 'admin' ? 'Administrateur' : 'Membre Elite'}
            </span>
          </span>
        </button>

        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, marginBottom: '0.5rem' }}>
          Votre communauté
        </p>
        {items.map(it => (
          <button key={it.to} onClick={() => go(it.to)} style={{
            display: 'flex', alignItems: 'center', gap: '14px', background: 'none', border: 'none',
            padding: '12px 0', cursor: 'pointer', textAlign: 'left', width: '100%',
          }}>
            <span style={{ width: 46, height: 46, borderRadius: '14px', background: C.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={it.icon} color={C.orange} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: C.text }}>{it.label}</span>
              <span style={{ display: 'block', fontSize: '12px', color: C.muted }}>{it.sub}</span>
            </span>
            {it.badge ? (
              <span style={{ minWidth: 24, height: 24, borderRadius: '99px', background: C.orangeSoft, color: C.orange, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {it.badge}
              </span>
            ) : <Icon name="chevron_right" color={C.muted} />}
          </button>
        ))}

        <div style={{ borderTop: `1px solid ${C.line}`, margin: '1rem 0' }} />
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '14px', background: 'none', border: 'none',
          padding: '10px 0', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: 'inherit',
        }}>
          <Icon name="logout" color={C.muted} /> Se déconnecter
        </button>

        <div style={{ marginTop: 'auto', background: C.navy, borderRadius: '20px', padding: '1.25rem', color: '#fff' }}>
          <Icon name="footprint" color={C.orange} size={26} />
          <p style={{ fontSize: '19px', fontWeight: 700, margin: '8px 0 6px' }}>Plus loin, ensemble.</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            Un collectif. Des défis. Des kilomètres qui nous rassemblent.
          </p>
          <p style={{ fontSize: '10px', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
            ELITE RUNNERS · DEPUIS 2026
          </p>
        </div>
      </aside>
    </>
  )
}

function BottomNav({ onMenu, menuOpen }) {
  const tab = (isActive) => ({
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    fontSize: '11px', fontWeight: isActive ? 700 : 500, textDecoration: 'none',
    color: isActive ? C.orange : C.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  })
  return (
    <nav aria-label="Navigation principale" style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000, background: C.card,
      boxShadow: '0 -4px 20px rgba(22,34,63,0.06)', padding: '8px 8px calc(10px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'flex-end' }}>
        {TABS.map(t => t.add ? (
          <NavLink key={t.to} to={t.to} style={({ isActive }) => ({ ...tab(isActive), position: 'relative' })}>
            <span style={{
              width: 56, height: 56, borderRadius: '50%', background: C.orange, marginTop: '-30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(232,130,42,0.4)', border: `4px solid ${C.bg}`,
            }}>
              <Icon name="add" size={30} color="#fff" />
            </span>
            {t.label}
          </NavLink>
        ) : (
          <NavLink key={t.to} to={t.to} end={t.to === '/profil'} style={({ isActive }) => tab(isActive && !menuOpen)}>
            <Icon name={t.icon} size={26} />
            {t.label}
          </NavLink>
        ))}
        <button onClick={onMenu} aria-expanded={menuOpen} style={tab(menuOpen)}>
          <Icon name="menu" size={26} />
          Menu
        </button>
      </div>
    </nav>
  )
}

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCount, setActiveCount] = useState(0)
  const { pathname } = useLocation()
  const wide = WIDE.some(p => pathname.startsWith(p))

  useEffect(() => {
    api.get('/challenges/active').then(res => setActiveCount(res.data.length)).catch(() => {})
  }, [pathname])

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <header style={{ maxWidth: wide ? 1000 : 560, margin: '0 auto', padding: '1.1rem 1.25rem 0.5rem' }}>
        <Brand />
      </header>
      <main style={{ maxWidth: wide ? 1000 : 560, margin: '0 auto', padding: '0.75rem 1.25rem 7.5rem' }}>
        {children}
      </main>
      <BottomNav onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
      {menuOpen && <MenuDrawer onClose={() => setMenuOpen(false)} activeCount={activeCount} />}
    </div>
  )
}

