import { Link } from 'react-router-dom'
import useIsMobile from '../hooks/useIsMobile'
import { Icon, Brand, Card, Bar } from '../components/ui'
import { C, shadow } from '../components/theme'

const STEPS = [
  { icon: 'person_add', title: 'Rejoignez', desc: 'Créez votre compte et intégrez le collectif Elite Runners en quelques secondes.' },
  { icon: 'directions_run', title: 'Courez', desc: 'Enregistrez vos sorties : elles comptent pour tous les défis en cours.' },
  { icon: 'trophy', title: 'Progressez', desc: 'Grimpez au classement, franchissez les étapes et décrochez vos trophées.' },
]

const FEATURES = [
  { icon: 'public', title: 'Défis collectifs', desc: 'Des grands objectifs aux défis du mois, on avance ensemble vers un but commun.' },
  { icon: 'local_fire_department', title: 'Séries', desc: 'Des défis de régularité pour ancrer l\'habitude, un jour après l\'autre.' },
  { icon: 'leaderboard', title: 'Classement vivant', desc: 'Une saine émulation qui pousse chacun à donner le meilleur de lui-même.' },
  { icon: 'workspace_premium', title: 'Trophées et titres', desc: 'Les podiums de chaque défi restent gravés sur votre profil.' },
]

const ctaPrimary = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  padding: '16px 26px', borderRadius: '16px', background: C.orange, color: '#fff',
  fontSize: '16px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 6px 16px rgba(232,130,42,0.28)',
}
const ctaSecondary = {
  ...ctaPrimary, background: C.card, color: C.text, boxShadow: shadow, border: `1px solid ${C.line}`,
}

// Page publique : présentation du club, avant la connexion
export default function Landing() {
  const isMobile = useIsMobile()
  const section = { maxWidth: 1040, margin: '0 auto', padding: isMobile ? '0 1.25rem' : '0 2rem' }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>

      {/* En-tête */}
      <header style={{ ...section, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.1rem', paddingBottom: '1.1rem' }}>
        <Brand to="/" />
        <nav style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.25rem' }}>
          <Link to="/login" style={{ fontSize: '14px', fontWeight: 600, color: C.text, textDecoration: 'none' }}>Se connecter</Link>
          {!isMobile && <Link to="/register" style={{ ...ctaPrimary, padding: '10px 18px', fontSize: '14px', borderRadius: '12px' }}>Rejoindre</Link>}
        </nav>
      </header>

      {/* Accroche */}
      <section style={{
        ...section, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr',
        gap: isMobile ? '2rem' : '3rem', alignItems: 'center', paddingTop: isMobile ? '1.5rem' : '3.5rem', paddingBottom: '3rem',
      }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.muted, marginBottom: '10px' }}>
            Le collectif running Elite Runners
          </p>
          <h1 style={{ fontSize: isMobile ? '40px' : '56px', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Se dépasser<span style={{ color: C.orange }}>.</span><br />Ensemble<span style={{ color: C.orange }}>.</span>
          </h1>
          <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.6, margin: '1.25rem 0 2rem', maxWidth: 460 }}>
            Des défis collectifs, des séries à tenir et un classement qui motive. Chaque kilomètre que vous courez fait avancer tout le club.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
            <Link to="/register" style={ctaPrimary}>Rejoindre le collectif <Icon name="arrow_forward" size={20} /></Link>
            <Link to="/login" style={ctaSecondary}>J'ai déjà un compte</Link>
          </div>
          <p style={{ fontSize: '13px', color: C.muted, marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="flag" size={18} color={C.orange} /> Pas besoin d'être le plus rapide. Chaque kilomètre compte.
          </p>
        </div>

        {/* Aperçu d'un défi, à titre d'illustration */}
        <div aria-hidden="true" style={{ position: 'relative' }}>
          <div style={{
            background: `linear-gradient(125deg, ${C.navy} 0%, ${C.navy2} 70%, #34497a 100%)`,
            borderRadius: '24px', padding: isMobile ? '1.5rem' : '1.5rem 1.5rem 4rem', color: '#fff', position: 'relative', overflow: 'hidden',
          }}>
            <Icon name="directions_run" size={190} color="rgba(255,255,255,0.06)" style={{ position: 'absolute', right: '-24px', top: '-14px' }} />
            <span style={{ background: 'rgba(255,255,255,0.14)', borderRadius: '99px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em' }}>
              DÉFI COLLECTIF
            </span>
            <p style={{ fontSize: '28px', fontWeight: 700, margin: '1.1rem 0 1.4rem', position: 'relative' }}>Tour du monde</p>
            <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', position: 'relative' }}>40 075 km à parcourir ensemble</p>
            <Bar pct={38} track="rgba(255,255,255,0.18)" height={6} />
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '14px' }}>Prochaine étape : Rome</p>
          </div>
          <Card style={{
            position: isMobile ? 'relative' : 'absolute', left: isMobile ? 0 : '-28px', bottom: isMobile ? 0 : '-34px',
            marginTop: isMobile ? '12px' : 0, display: 'flex', alignItems: 'center', gap: '12px', padding: '0.9rem 1.1rem',
          }}>
            <span style={{ width: 42, height: 42, borderRadius: '12px', background: C.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="local_fire_department" color={C.orange} />
            </span>
            <span>
              <span style={{ display: 'block', fontSize: '14px', fontWeight: 700 }}>Une semaine sans pause</span>
              <span style={{ display: 'block', fontSize: '12px', color: C.muted }}>Défi de régularité</span>
            </span>
          </Card>
        </div>
      </section>

      {/* Comment ça marche */}
      <section style={{ ...section, paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '1.25rem' }}>Comment ça marche</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
          {STEPS.map((s, i) => (
            <Card key={s.title} style={{ padding: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ width: 48, height: 48, borderRadius: '14px', background: C.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} color={C.orange} />
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: C.faint }}>0{i + 1}</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.6 }}>{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Ce que propose l'app */}
      <section style={{ ...section, paddingTop: '1rem', paddingBottom: '3rem' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '1.25rem' }}>Tout pour courir ensemble</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '14px' }}>
          {FEATURES.map(f => (
            <Card key={f.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '1.2rem' }}>
              <span style={{ width: 46, height: 46, borderRadius: '14px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} color={C.navy} />
              </span>
              <span>
                <span style={{ display: 'block', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{f.title}</span>
                <span style={{ display: 'block', fontSize: '14px', color: C.muted, lineHeight: 1.55 }}>{f.desc}</span>
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* Dernier appel */}
      <section style={{ ...section, paddingBottom: '3rem' }}>
        <div style={{ background: C.navy, borderRadius: '24px', padding: isMobile ? '2rem 1.5rem' : '2.75rem', color: '#fff', textAlign: isMobile ? 'left' : 'center' }}>
          <Icon name="footprint" size={30} color={C.orange} />
          <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: 700, color: '#fff', margin: '10px 0' }}>Plus loin, ensemble.</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', marginBottom: '1.75rem' }}>
            Un collectif. Des défis. Des kilomètres qui nous rassemblent.
          </p>
          <Link to="/register" style={ctaPrimary}>Créer mon compte <Icon name="arrow_forward" size={20} /></Link>
        </div>
      </section>

      <footer style={{ ...section, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '1.25rem', paddingBottom: '2rem', borderTop: `1px solid ${C.line}` }}>
        <Brand to="/" size={30} />
        <p style={{ fontSize: '12px', color: C.muted }}>© 2026 Elite Runners · Depuis 2026</p>
      </footer>
    </div>
  )
}
