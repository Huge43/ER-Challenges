// Briques visuelles communes, d'après la maquette Elite Runners
import { Link } from 'react-router-dom'
import logo from '../assets/logo-er.png'
import { C, shadow } from './theme'

export const Icon = ({ name, size = 22, color, style }) => (
  <span className="material-symbols-rounded" aria-hidden="true" style={{ fontSize: size, color, ...style }}>{name}</span>
)

// Logo carré orange + « Elite Runners. »
export const Brand = ({ size = 36, to = '/dashboard' }) => (
  <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
    <span style={{
      width: size, height: size, borderRadius: size * 0.28, background: C.orange,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Le logo occupe le centre d'une image carrée avec beaucoup de marge : on l'agrandit */}
      <img src={logo} alt="" style={{ width: '170%', height: '170%', objectFit: 'contain', transform: 'translateY(4%)' }} />
    </span>
    <span style={{ fontSize: '19px', fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>
      Elite Runners<span style={{ color: C.orange }}>.</span>
    </span>
  </Link>
)

// Sur-titre en capitales, grand titre, sous-titre
export const PageTitle = ({ eyebrow, title, subtitle, style }) => (
  <div style={{ marginBottom: '1.5rem', ...style }}>
    {eyebrow && (
      <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.muted, marginBottom: '6px' }}>
        {eyebrow}
      </p>
    )}
    <h1 style={{ fontSize: '30px', fontWeight: 700, color: C.text, lineHeight: 1.15, letterSpacing: '-0.02em' }}>{title}</h1>
    {subtitle && <p style={{ fontSize: '14px', color: C.muted, marginTop: '8px', lineHeight: 1.5 }}>{subtitle}</p>}
  </div>
)

export const SectionTitle = ({ title, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '1.75rem 0 0.85rem' }}>
    <h2 style={{ fontSize: '19px', fontWeight: 700, color: C.text }}>{title}</h2>
    {action}
  </div>
)

export const Card = ({ children, style, ...rest }) => (
  <div style={{ background: C.card, borderRadius: '18px', boxShadow: shadow, padding: '1rem 1.1rem', ...style }} {...rest}>
    {children}
  </div>
)

const initials = (name = '') => name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()

const AVATAR_COLORS = [['#fde7d3', '#b45309'], ['#dbeafe', '#1e3a8a'], ['#e0e7ff', '#3730a3'], ['#dcfce7', '#166534'], ['#fce7f3', '#9d174d'], ['#f3e8ff', '#6b21a8']]
const colorFor = (name = '') => AVATAR_COLORS[[...name].reduce((s, ch) => s + ch.charCodeAt(0), 0) % AVATAR_COLORS.length]

export const Avatar = ({ name, size = 40, ring }) => {
  const [bg, fg] = colorFor(name)
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', background: bg, color: fg, flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.36), fontWeight: 700,
      border: ring ? `3px solid ${ring}` : 'none', boxSizing: 'border-box',
    }}>
      {initials(name)}
    </span>
  )
}

export const Bar = ({ pct, color = C.orange, track = C.track, height = 7 }) => (
  <div style={{ background: track, borderRadius: '99px', height, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
  </div>
)

// Encadré orange clair avec icône (informations, encouragements)
export const Notice = ({ icon = 'flag', children, style }) => (
  <div style={{
    display: 'flex', gap: '12px', alignItems: 'flex-start', background: C.orangeSoft,
    borderRadius: '14px', padding: '0.9rem 1rem', fontSize: '13px', color: C.text, lineHeight: 1.5, ...style,
  }}>
    <Icon name={icon} size={20} color={C.orange} />
    <div>{children}</div>
  </div>
)

export const ErrorBox = ({ children }) => (
  <div role="alert" style={{ background: '#fee2e2', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '1rem' }}>
    {children}
  </div>
)

export const PrimaryButton = ({ children, icon, style, ...rest }) => (
  <button {...rest} style={{
    width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
    background: rest.disabled ? '#f0b07a' : C.orange, color: '#fff',
    fontSize: '16px', fontWeight: 600, cursor: rest.disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    boxShadow: '0 6px 16px rgba(232, 130, 42, 0.28)', ...style,
  }}>
    {children}
    {icon && <Icon name={icon} size={20} />}
  </button>
)

export const Label = ({ htmlFor, children, hint }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
    <label htmlFor={htmlFor} style={{ fontSize: '15px', fontWeight: 600, color: C.text }}>{children}</label>
    {hint && <span style={{ fontSize: '12px', color: C.faint }}>{hint}</span>}
  </div>
)

// Champ blanc arrondi, avec icône à gauche et élément optionnel à droite
export const Field = ({ icon, right, ...input }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '12px', background: C.card,
    border: `1px solid ${C.line}`, borderRadius: '14px', padding: '0 14px', marginBottom: '1.1rem',
  }}>
    {icon && <Icon name={icon} size={21} color={C.muted} />}
    <input {...input} style={{
      flex: 1, border: 'none', outline: 'none', background: 'transparent',
      padding: '16px 0', fontSize: '15px', color: C.text, fontFamily: 'inherit', minWidth: 0, ...input.style,
    }} />
    {right}
  </div>
)

export const Loading = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
    <p style={{ color: C.muted, fontSize: '14px' }}>Chargement...</p>
  </div>
)

// Médaille or/argent/bronze
export const Medal = ({ rank, size = 30 }) => {
  const colors = [['#fef3c7', '#d97706'], ['#e5e7eb', '#6b7280'], ['#fde7d3', '#b4642d']][rank - 1] || ['#f3f4f6', '#9ca3af']
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', background: colors[0], flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name="workspace_premium" size={Math.round(size * 0.62)} color={colors[1]} />
    </span>
  )
}

// Cadre des pages publiques (connexion, inscription, réinitialisation) : sans barre d'onglets
export const AuthFrame = ({ children }) => (
  <div style={{ minHeight: '100vh', background: C.bg }}>
    <div style={{ maxWidth: 460, margin: '0 auto', padding: '1.25rem 1.25rem 3rem' }}>
      <div style={{ marginBottom: '2rem' }}><Brand to="/" /></div>
      {children}
    </div>
  </div>
)

// Bouton œil pour afficher ou masquer un mot de passe
export const EyeToggle = ({ shown, onToggle }) => (
  <button type="button" onClick={onToggle} aria-label={shown ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} style={{
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
  }}>
    <Icon name={shown ? 'visibility' : 'visibility_off'} color={C.muted} />
  </button>
)
