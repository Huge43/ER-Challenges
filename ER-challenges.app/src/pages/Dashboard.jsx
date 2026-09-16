import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getDashboard } from '../api/index.js'
import useIsMobile from '../hooks/useIsMobile'

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
  const [streaks, setStreaks] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')

  useEffect(() => {
    Promise.all([
      getDashboard(),
      axios.get('http://localhost:5000/api/challenges'),
      axios.get('http://localhost:5000/api/challenges/active'),
    ]).then(([dashRes, challRes, activeRes]) => {
      setData(dashRes.data)
      setChallenges(challRes.data)
      setActiveChallenge(activeRes.data)

      // Charger les streaks pour tous les challenges de type streak
      challRes.data.filter(c => c.type === 'streak').forEach(c => {
        axios.get(`http://localhost:5000/api/challenges/${c._id}/streak`)
          .then(res => setStreaks(prev => ({ ...prev, [c._id]: res.data })))
          .catch(err => console.error(err))
      })
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
  const now = new Date()

  // Progression adaptée au type du challenge
  const getProgress = (c) => {
    if (!c) return { pct: 0, label: '', big: '' }
    if (c.type === 'streak') {
      const s = streaks[c._id]
      if (!s) return { pct: 0, label: 'Calcul du streak...', big: '...' }
      if (c.scope === 'collectif') {
        const pct = c.goalDays ? Math.min(100, ((s.current / c.goalDays) * 100).toFixed(1)) : 0
        return { pct, label: `${s.current} / ${c.goalDays} jours consécutifs (groupe)`, big: `${s.current}j 🔥` }
      } else {
        // Individuel : streak du membre connecté, sinon le meilleur
        const mine = s.members?.find(m => m.memberId === currentMember.id)
        const shown = mine || s.members?.[0] || { current: 0 }
        const pct = c.goalDays ? Math.min(100, ((shown.current / c.goalDays) * 100).toFixed(1)) : 0
        const who = mine ? 'mon streak' : `meilleur : ${shown.name || '—'}`
        return { pct, label: `${shown.current} / ${c.goalDays} jours (${who})`, big: `${shown.current}j 🔥` }
      }
    }
    const pct = c.goalKm ? Math.min(100, ((c.currentKm / c.goalKm) * 100).toFixed(1)) : 0
    return { pct, label: `${c.currentKm?.toLocaleString()} / ${c.goalKm?.toLocaleString()} km`, big: `${pct}%` }
  }

  const activeProgress = getProgress(active)
  const top3 = data.members?.slice(0, 3) || []

  const getStatus = (c) => {
    if (c.active) return { label: 'Actif', color: '#dcfce7', text: '#14532d' }
    if (new Date(c.startDate) > now) return { label: 'À venir', color: '#e0e7ff', text: '#3730a3' }
    if (new Date(c.endDate) < now) return { label: 'Terminé', color: '#f1f5f9', text: '#64748b' }
    return { label: 'Inactif', color: '#fef3c7', text: '#92400e' }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : 0, justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', lineHeight: 1.6 }}>
            Repoussez vos limites avec l'élite. Suivez le challenge actif et les défis de la communauté.
          </p>
        </div>
        <div style={{
          background: '#fff', border: '1px solid #e8edf5', borderRadius: '12px',
          padding: '1rem 1.5rem', textAlign: isMobile ? 'left' : 'right', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>
            Membres actifs
          </p>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '32px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1 }}>
            {data.activeMembers}
          </p>
        </div>
      </div>

      {/* Challenge actif + Top contributeurs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '1.25rem', marginBottom: '2.5rem' }}>

        {/* Challenge actif */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e8edf5', padding: '1.75rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          {active ? (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: '99px',
                  background: '#dcfce7', color: '#14532d',
                  fontSize: '11px', fontWeight: 600,
                }}>
                  {TYPES[active.type]?.icon} Challenge actif
                </span>
                {active.type === 'streak' && (
                  <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: '99px',
                    background: '#fff7ed', color: '#e67e22',
                    fontSize: '11px', fontWeight: 600,
                  }}>
                    {active.scope === 'collectif' ? 'Streak collectif' : 'Streak individuel'}
                  </span>
                )}
              </div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '24px' : '30px', fontWeight: 600, color: '#1e2a4a', marginBottom: '8px' }}>
                {active.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {active.description || 'Contribuez au défi collectif de la communauté.'}
              </p>

              <div style={{
                background: active.type === 'streak'
                  ? 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #e67e22 100%)'
                  : 'linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 50%, #14532d 100%)',
                borderRadius: '12px', height: '140px', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                {active.type === 'streak' ? (
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '42px', fontWeight: 700, color: '#fff' }}>
                    {activeProgress.big}
                  </p>
                ) : (
                  <>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
                    </div>
                    <div style={{
                      position: 'absolute', left: `${activeProgress.pct}%`, top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%',
                      boxShadow: '0 0 12px rgba(74, 222, 128, 0.8)',
                    }} />
                  </>
                )}
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
                  {activeProgress.label}
                </p>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 600, color: active.type === 'streak' ? '#e67e22' : '#14532d' }}>
                  {activeProgress.pct}%
                </p>
              </div>
              <div style={{ background: '#e8edf5', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${activeProgress.pct}%`, background: active.type === 'streak' ? '#e67e22' : '#16a34a', borderRadius: '99px', transition: 'width 0.6s ease' }} />
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
              {active?.type === 'streak' && active.scope === 'individuel' ? 'Top streaks' : 'Top contributeurs'}
            </p>
          </div>

          {active?.type === 'streak' && active.scope === 'individuel' && streaks[active._id]?.members ? (
            streaks[active._id].members.slice(0, 3).map((m, i) => (
              <div key={m.memberId} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: COLORS[i], color: TEXT_COLORS[i],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, flexShrink: 0,
                  }}>
                    {m.name?.split(' ').map(n => n[0]).join('')}
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
                  <p style={{ fontSize: '12px', color: '#e67e22', fontWeight: 600 }}>{m.current} jours 🔥</p>
                </div>
              </div>
            ))
          ) : (
            top3.map((m, i) => (
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
            ))
          )}

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
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '20px' : '24px', fontWeight: 600, color: '#1e2a4a' }}>
            Tous les challenges
          </h2>
          <button onClick={() => navigate('/challenges')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: '#1e3a8a', fontWeight: 600,
          }}>
            {isMobile ? 'Gérer →' : 'Gérer les challenges →'}
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
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
            {challenges.map(c => {
              const status = getStatus(c)
              const typeInfo = TYPES[c.type] || TYPES.distance
              const progress = getProgress(c)
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

                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '1rem', minHeight: '38px' }}>
                    {c.description || 'Pas de description.'}
                  </p>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>{progress.label}</span>
                      <span style={{ fontWeight: 700, color: typeInfo.color }}>{progress.pct}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '5px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress.pct}%`, background: typeInfo.color, borderRadius: '99px' }} />
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