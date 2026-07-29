import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getDashboard } from '../api/index.js'

const TYPES = {
  distance: { label: 'Distance', icon: '🏃', color: '#1e3a8a' },
  streak: { label: 'Streak', icon: '🔥', color: '#e67e22' },
}

const COLORS = ['#dbeafe', '#e0e7ff', '#fce7f3', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#e0f2fe', '#f0fdf4', '#fdf4ff']
const TEXT_COLORS = ['#1e3a8a', '#3730a3', '#9d174d', '#14532d', '#92400e', '#991b1b', '#581c87', '#0c4a6e', '#14532d', '#581c87']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [activeChallenge, setActiveChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      getDashboard(),
      axios.get('http://localhost:5000/api/challenges'),
      axios.get('http://localhost:5000/api/challenges/active'),
    ]).then(([dashRes, challRes, activeRes]) => {
      setData(dashRes.data)
      setChallenges(challRes.data)
      setActiveChallenge(activeRes.data)
    }).catch(err => console.error(err))
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

  const active = activeChallenge
  const activePct = active ? Math.min(100, ((active.currentKm / active.goalKm) * 100).toFixed(1)) : 0
  const top3 = data.members?.slice(0, 3) || []
  const now = new Date()

  const getStatus = (c) => {
    if (c.active) return { label: 'Actif', color: '#dcfce7', text: '#14532d' }
    if (new Date(c.startDate) > now) return { label: 'À venir', color: '#e0e7ff', text: '#3730a3' }
    if (new Date(c.endDate) < now) return { label: 'Terminé', color: '#f1f5f9', text: '#64748b' }
    return { label: 'Inactif', color: '#fef3c7', text: '#92400e' }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'EB Garamond, serif', fontSize: '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', lineHeight: 1.6 }}>
            Repoussez vos limites avec l'élite. Suivez le challenge actif et les défis de la communauté.
          </p>
        </div>
        <div style={{
          background: '#fff', border: '1px solid #e8edf5', borderRadius: '12px',
          padding: '1rem 1.5rem', textAlign: 'right', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>
            Membres actifs
          </p>
          <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '32px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1 }}>
            {data.activeMembers}
          </p>
        </div>
      </div>

      {/* Challenge actif + Top contributeurs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', marginBottom: '2.5rem' }}>

        {/* Challenge actif */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e8edf5', padding: '1.75rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          {active ? (
            <>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '99px',
                background: '#dcfce7', color: '#14532d',
                fontSize: '11px', fontWeight: 600, marginBottom: '1rem',
              }}>
                {TYPES[active.type]?.icon} Challenge actif
              </span>
              <h2 style={{ fontFamily: 'EB Garamond, serif', fontSize: '30px', fontWeight: 600, color: '#1e2a4a', marginBottom: '8px' }}>
                {active.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {active.description || 'Contribuez au défi collectif de la communauté.'}
              </p>

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
                  position: 'absolute', left: `${activePct}%`, top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%',
                  boxShadow: '0 0 12px rgba(74, 222, 128, 0.8)',
                }} />
                <p style={{
                  position: 'absolute', bottom: '12px', left: '16px',
                  fontSize: '11px', color: 'rgba(255,255,255,0.5)',
                  fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  {active.name}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                  {active.currentKm?.toLocaleString()} / {active.goalKm?.toLocaleString()} km
                </p>
                <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '24px', fontWeight: 600, color: '#14532d' }}>
                  {activePct}%
                </p>
              </div>
              <div style={{ background: '#e8edf5', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${activePct}%`, background: '#16a34a', borderRadius: '99px', transition: 'width 0.6s ease' }} />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🏁</div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e2a4a', marginBottom: '4px' }}>Aucun challenge actif</p>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Un admin doit activer un challenge pour qu'il apparaisse ici.</p>
            </div>
          )}
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
            <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
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
                  fontSize: '10px', fontWeight: 700, color: '#fff', border: '2px solid #fff',
                }}>
                  {i + 1}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e2a4a' }}>{m.name}</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>{m.totalKm} km</p>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <button onClick={() => navigate('/classement')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', color: '#1e3a8a', fontWeight: 600, padding: 0,
            }}>
              Voir tout le classement →
            </button>
          </div>
        </div>
      </div>

      {/* Tous les challenges */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'EB Garamond, serif', fontSize: '24px', fontWeight: 600, color: '#1e2a4a' }}>
            Tous les challenges
          </h2>
          <button onClick={() => navigate('/challenges')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: '#1e3a8a', fontWeight: 600,
          }}>
            Gérer les challenges →
          </button>
        </div>

        {challenges.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0',
            padding: '3rem 2rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏁</div>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Aucun challenge pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {challenges.map(c => {
              const status = getStatus(c)
              const typeInfo = TYPES[c.type] || TYPES.distance
              const pct = Math.min(100, ((c.currentKm / c.goalKm) * 100).toFixed(1))
              return (
                <div key={c._id} style={{
                  background: '#fff', border: c.active ? '2px solid #16a34a' : '1px solid #e8edf5',
                  borderRadius: '14px', padding: '1.5rem',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: `${typeInfo.color}15`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '20px',
                    }}>
                      {c.icon || typeInfo.icon}
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '99px',
                      background: status.color, color: status.text,
                    }}>
                      {status.label}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'EB Garamond, serif', fontSize: '20px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '1rem', minHeight: '38px' }}>
                    {c.description || 'Pas de description.'}
                  </p>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>{c.currentKm?.toLocaleString()} / {c.goalKm?.toLocaleString()} km</span>
                      <span style={{ fontWeight: 700, color: typeInfo.color }}>{pct}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '5px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: typeInfo.color, borderRadius: '99px' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {c.participants?.length || 0} participants
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e8edf5', paddingTop: '1.5rem', marginTop: '1rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          © 2026 Elite Runners. Precision First.
        </p>
      </div>
    </div>
  )
}