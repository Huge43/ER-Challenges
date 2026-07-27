import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../api/index.js'

const STAGES = [
  { name: 'Amériques', km: 15000 },
  { name: 'Atlantique', km: 6500 },
  { name: 'Europe', km: 4000 },
  { name: 'Asie', km: 9000 },
  { name: 'Pacifique', km: 4000 },
  { name: 'Arrivée', km: 1575 },
]

const MISSIONS = [
  { icon: '▲', title: 'Everest Climb', desc: 'Cumuler 8 848m de dénivelé en un mois.', participants: 412, progress: 3400, goal: 8848, unit: 'm', daysLeft: 12, urgent: false },
  { icon: '⏱', title: 'Marathon Month', desc: 'Courir au moins 42.2km chaque semaine pendant 4 semaines.', participants: 1028, progress: null, goal: null, unit: '', daysLeft: 2, urgent: true, status: 'Exceeding PR' },
  { icon: '⚡', title: 'Speed Demon', desc: 'Maintenir un rythme sous 4:00 min/km sur plus de 10km.', participants: 156, progress: null, goal: null, unit: '', daysLeft: 28, urgent: false, status: 'Not started' },
  { icon: '🌙', title: 'Night Owl', desc: 'Logger 5 runs entre 22h00 et 4h00 du matin.', participants: 89, progress: 3, goal: 5, unit: ' Sessions', daysLeft: 5, urgent: false },
  { icon: '⬇', title: 'UPCOMING: IRON HEART', desc: 'Lance dans 4 jours. Accès anticipé membres premium.', participants: null, upcoming: true },
]

const COLORS = ['#dbeafe', '#e0e7ff', '#fce7f3', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#e0f2fe', '#f0fdf4', '#fdf4ff']
const TEXT_COLORS = ['#1e3a8a', '#3730a3', '#9d174d', '#14532d', '#92400e', '#991b1b', '#581c87', '#0c4a6e', '#14532d', '#581c87']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#ef4444', fontSize: '14px' }}>Erreur de chargement</p>
    </div>
  )

  const pct = Math.min(100, ((data.totalKm / data.goalKm) * 100).toFixed(1))
  const top3 = data.members?.slice(0, 3) || []

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'EB Garamond, serif', fontSize: '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
            Challenges
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', lineHeight: 1.6 }}>
            Repoussez vos limites avec l'élite. Participez aux missions collectives et aux jalons d'endurance personnels.
          </p>
        </div>
        <div style={{
          background: '#fff', border: '1px solid #e8edf5', borderRadius: '12px',
          padding: '1rem 1.5rem', textAlign: 'right',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>
            Membres actifs
          </p>
          <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '32px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1 }}>
            {data.activeMembers}
          </p>
        </div>
      </div>

      {/* Challenge principal + Top contributeurs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', marginBottom: '2.5rem' }}>

        {/* Challenge principal */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e8edf5', padding: '1.75rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: '99px',
            background: '#dcfce7', color: '#14532d',
            fontSize: '11px', fontWeight: 600, marginBottom: '1rem',
          }}>
            Objectif collectif
          </span>
          <h2 style={{ fontFamily: 'EB Garamond, serif', fontSize: '30px', fontWeight: 600, color: '#1e2a4a', marginBottom: '8px' }}>
            Tour du monde
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            L'élite se mobilise pour parcourir collectivement la circonférence de la Terre.
          </p>

          {/* Carte visuelle */}
          <div style={{
            background: 'linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 50%, #14532d 100%)',
            borderRadius: '12px', height: '140px', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div style={{
              position: 'absolute',
              left: `${pct}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '12px', height: '12px',
              background: '#4ade80', borderRadius: '50%',
              boxShadow: '0 0 12px rgba(74, 222, 128, 0.8)',
            }} />
            <p style={{
              position: 'absolute', bottom: '12px', left: '16px',
              fontSize: '11px', color: 'rgba(255,255,255,0.5)',
              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Tour du monde 2026
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>
              {data.totalKm?.toLocaleString()} / {data.goalKm?.toLocaleString()} km
            </p>
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '24px', fontWeight: 600, color: '#14532d' }}>
              {pct}%
            </p>
          </div>
          <div style={{ background: '#e8edf5', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: '#16a34a', borderRadius: '99px',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Top contributeurs */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e8edf5', padding: '1.75rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '16px' }}>🏆</span>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
              Top contributeurs
            </p>
          </div>

          {top3.map((m, i) => (
            <div key={m._id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '1.25rem',
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: COLORS[i], color: TEXT_COLORS[i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, flexShrink: 0,
                }}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#d97706',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#fff',
                  border: '2px solid #fff',
                }}>
                  {i + 1}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e2a4a' }}>{m.name}</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>{m.totalKm} km cette semaine</p>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => navigate('/classement')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', color: '#1e3a8a', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: 0,
              }}
            >
              Voir tout le classement →
            </button>
          </div>
        </div>
      </div>

      {/* Missions actives */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'EB Garamond, serif', fontSize: '24px', fontWeight: 600, color: '#1e2a4a' }}>
            Missions actives
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {MISSIONS.map((mission, i) => (
            <div key={i} style={{
              background: mission.upcoming ? 'transparent' : '#fff',
              border: mission.upcoming ? '2px dashed #e2e8f0' : '1px solid #e8edf5',
              borderRadius: '14px', padding: '1.5rem',
              boxShadow: mission.upcoming ? 'none' : '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column',
            }}>
              {mission.upcoming ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: '#f1f5f9', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '20px', marginBottom: '1rem',
                  }}>
                    ⬇
                  </div>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>
                    {mission.title}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>{mission.desc}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: '#f1f5f9', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '20px',
                    }}>
                      {mission.icon}
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '99px',
                      background: mission.urgent ? '#fee2e2' : '#f1f5f9',
                      color: mission.urgent ? '#991b1b' : '#64748b',
                    }}>
                      {mission.urgent ? `Ends in ${mission.daysLeft} days` : `${mission.daysLeft} days left`}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'EB Garamond, serif', fontSize: '20px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
                    {mission.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '1rem', flex: 1 }}>
                    {mission.desc}
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                      <span>{mission.participants} participants</span>
                      {mission.progress !== null && mission.goal ? (
                        <span style={{ fontWeight: 600, color: '#1e2a4a' }}>
                          {mission.progress?.toLocaleString()}{mission.unit} / {mission.goal?.toLocaleString()}{mission.unit}
                        </span>
                      ) : (
                        <span style={{ fontWeight: 600, color: mission.urgent ? '#e67e22' : '#64748b' }}>
                          {mission.status}
                        </span>
                      )}
                    </div>
                    {mission.progress !== null && mission.goal && (
                      <div style={{ background: '#e8edf5', borderRadius: '99px', height: '5px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, (mission.progress / mission.goal) * 100)}%`,
                          background: mission.urgent ? '#e67e22' : '#1e3a8a',
                          borderRadius: '99px',
                        }} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      flex: 1, padding: '9px 16px',
                      background: mission.urgent ? '#fff' : '#1e2a4a',
                      color: mission.urgent ? '#1e2a4a' : '#fff',
                      border: mission.urgent ? '1px solid #1e2a4a' : 'none',
                      borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer',
                    }}>
                      {mission.urgent ? 'Voir le classement' : 'Join Challenge'}
                    </button>
                    {!mission.urgent && (
                      <button style={{
                        width: '38px', height: '38px',
                        background: '#f1f5f9', border: 'none',
                        borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        ↗
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e8edf5', paddingTop: '1.5rem', marginTop: '1rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          © 2026 Elite Runners Performance Lab. Precision First.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Règles', 'Politique de confidentialité', 'Support'].map(link => (
            <a key={link} href="#" style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}