import { useNavigate } from 'react-router-dom'
import useIsMobile from '../hooks/useIsMobile'

export default function Landing() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  return (
    <div style={{ background: '#0f1f3d', minHeight: '100vh', color: '#fff' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.5rem 3rem', maxWidth: '1200px', margin: '0 auto',
      }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 600, letterSpacing: '0.1em', color: '#fff' }}>
          ELITE RUNNERS
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
            fontSize: '14px', cursor: 'pointer', fontWeight: 500,
          }}>
            Se connecter
          </button>
          <button onClick={() => navigate('/register')} style={{
            padding: '10px 20px', background: '#e67e22', color: '#fff',
            border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          }}>
            Rejoindre
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '900px', margin: '0 auto', padding: '5rem 3rem 4rem',
        textAlign: 'center',
      }}>
        <span style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: '99px',
          background: 'rgba(230,126,34,0.15)', color: '#f59e0b',
          fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: '2rem',
        }}>
          La plateforme de challenges de elte runners
        </span>
       <h1 style={{
  fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '38px' : '64px', fontWeight: 700,
  lineHeight: 1.1, marginBottom: '1.5rem', color: '#fff',
}}>
          Dépassez-vous,<br /><span style={{ fontStyle: 'italic', color: '#e67e22' }}>ensemble.</span>
        </h1>
        <p style={{
          fontSize: '18px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
          maxWidth: '580px', margin: '0 auto 2.5rem',
        }}>
          La communauté se réunit autour de défis collectifs.
          Relevez des challenges, grimpez le classement et repoussez vos limites — motivés les uns par les autres.
        </p>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')} style={{
            padding: '15px 32px', background: '#e67e22', color: '#fff',
            border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.03em',
          }}>
            Rejoindre la communauté →
          </button>
          <button onClick={() => navigate('/login')} style={{
            padding: '15px 32px', background: 'rgba(255,255,255,0.08)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}>
            J'ai déjà un compte
          </button>
        </div>
      </section>

      {/* Comment ça marche */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem' }}>
        <p style={{
          textAlign: 'center', fontFamily: 'Poppins, sans-serif',
          fontSize: '32px', fontWeight: 700, marginBottom: '3rem', color: '#fff',
        }}>
          Comment ça marche
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { num: '01', icon: '👥', title: 'Rejoins', desc: 'Crée ton compte et intègre la communauté Elite Runners en quelques secondes.' },
            { num: '02', icon: '🏃', title: 'Participe', desc: 'Enregistre tes activités et progresse dans le challenge du moment avec la communauté.' },
            { num: '03', icon: '🏆', title: 'Progresse', desc: 'Grimpe le classement, franchis les étapes et atteins les objectifs avec ton groupe.' },
          ].map(step => (
            <div key={step.num} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '2rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '32px' }}>{step.icon}</span>
                <span style={{
                  fontFamily: 'Poppins, sans-serif', fontSize: '28px',
                  color: 'rgba(230,126,34,0.5)', fontWeight: 700,
                }}>
                  {step.num}
                </span>
              </div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#fff' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {[
            { icon: '🌍', title: 'Challenges collectifs', desc: 'Des grands objectifs aux défis du quotidien, progressez ensemble vers un but commun.' },
            { icon: '📊', title: 'Suivi en temps réel', desc: 'Visualisez votre progression individuelle et collective avec des graphiques clairs.' },
            { icon: '🥇', title: 'Classement vivant', desc: 'Une saine compétition qui pousse chaque membre à donner le meilleur de lui-même.' },
            { icon: '🔥', title: 'Motivation de groupe', desc: 'L\'énergie de la communauté transforme chaque challenge en accomplissement partagé.' },
          ].map(feat => (
            <div key={feat.title} style={{
              display: 'flex', gap: '16px', padding: '1.5rem',
              background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(230,126,34,0.12)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0,
              }}>
                {feat.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: '#fff' }}>{feat.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{
        maxWidth: '800px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(230,126,34,0.15) 0%, rgba(21,83,45,0.15) 100%)',
        borderRadius: '24px', margin: '3rem auto', padding: '3.5rem 3rem',
      }}>
       <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '30px' : '40px', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
          Prêt à repousser vos limites ?
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
          Rejoignez Elite Runners et transformez chaque défi en victoire collective.
        </p>
        <button onClick={() => navigate('/register')} style={{
          padding: '15px 36px', background: '#e67e22', color: '#fff',
          border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
        }}>
          Commencer maintenant →
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '2rem 3rem', maxWidth: '1200px', margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 600, letterSpacing: '0.08em', color: '#fff' }}>
          ELITE RUNNERS
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          © 2026 Elite Runners. Precision First.
        </p>
      </footer>
    </div>
  )
}