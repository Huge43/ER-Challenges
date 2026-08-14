import { useEffect, useState } from 'react'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'

const COLORS = ['#dbeafe', '#e0e7ff', '#fce7f3', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#e0f2fe', '#f0fdf4', '#fdf4ff']
const TEXT_COLORS = ['#1e3a8a', '#3730a3', '#9d174d', '#14532d', '#92400e', '#991b1b', '#581c87', '#0c4a6e', '#14532d', '#581c87']
const MEDALS = ['🥇', '🥈', '🥉']

const PALIERS_KM = [
  { value: 50, label: 'Premiers pas', icon: '🌱' },
  { value: 100, label: 'En rythme', icon: '🏃' },
  { value: 250, label: 'Endurant', icon: '💪' },
  { value: 500, label: 'Marathonien', icon: '🔥' },
  { value: 1000, label: 'Légende', icon: '👑' },
]

const PALIERS_STREAK = [
  { value: 3, label: 'Étincelle', icon: '✨' },
  { value: 7, label: 'Une semaine', icon: '🔥' },
  { value: 14, label: 'Enflammé', icon: '⚡' },
  { value: 21, label: 'Inarrêtable', icon: '🚀' },
  { value: 30, label: 'Machine', icon: '👑' },
]

const getPalierProgress = (value, paliers) => {
  const next = paliers.find(p => p.value > value)
  if (!next) return { pct: 100 }
  const prev = [...paliers].reverse().find(p => p.value <= value)
  const base = prev ? prev.value : 0
  return { pct: Math.round(((value - base) / (next.value - base)) * 100) }
}

export default function Classement() {
  const [members, setMembers] = useState([])
  const [streaks, setStreaks] = useState([])
  const [activeChallenge, setActiveChallenge] = useState(null)
  const [challengeRanking, setChallengeRanking] = useState(null)
  const [view, setView] = useState('global')
  const [tab, setTab] = useState('km')
  const [loading, setLoading] = useState(true)
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')
  const isMobile = useIsMobile()

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/members'),
      axios.get('http://localhost:5000/api/members/streaks'),
      axios.get('http://localhost:5000/api/challenges/active'),
    ]).then(([membersRes, streaksRes, activeRes]) => {
      setMembers(membersRes.data)
      setStreaks(streaksRes.data)
      setActiveChallenge(activeRes.data)
      if (activeRes.data?._id) {
        axios.get(`http://localhost:5000/api/challenges/${activeRes.data._id}/ranking`)
          .then(res => setChallengeRanking(res.data))
          .catch(err => console.error(err))
      }
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  const isGlobal = view === 'global'
  const isKm = tab === 'km'
  const isCollectiveStreak = !isGlobal && challengeRanking?.challenge?.scope === 'collectif'

  let list = []
  let unit = 'km'
  let getValue = (m) => 0

  if (isGlobal) {
    list = isKm ? members : streaks
    unit = isKm ? 'km' : 'jours'
    getValue = (m) => isKm ? m.totalKm : m.current
  } else {
    const isStreakChallenge = challengeRanking?.challenge?.type === 'streak'
    list = challengeRanking?.ranking || []
    unit = isStreakChallenge ? 'jours' : 'km'
    getValue = (m) => isStreakChallenge ? m.current : m.value
  }

  const paliers = isKm ? PALIERS_KM : PALIERS_STREAK
  const myRank = list.findIndex(m => (m._id || m.memberId) === currentMember.id) + 1

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : 0, justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
            Classement
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {isGlobal
              ? 'Classement général de toute la communauté.'
              : `Classement du challenge : ${activeChallenge?.name || '—'}`}
          </p>
        </div>
        {myRank > 0 && !isCollectiveStreak && (
          <div style={{
            background: '#fff', border: '1px solid #e8edf5',
            borderRadius: '12px', padding: '1rem 1.5rem', textAlign: isMobile ? 'left' : 'right',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>
              Mon rang
            </p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '32px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1 }}>
              #{myRank}
            </p>
          </div>
        )}
      </div>

      {/* Onglets principaux : Global / Challenge actif */}
      <div style={{
        display: 'inline-flex', gap: '4px', background: '#f1f5f9',
        padding: '4px', borderRadius: '12px', marginBottom: '1rem', flexWrap: 'wrap',
      }}>
        <button onClick={() => setView('global')} style={{
          padding: '10px 24px', borderRadius: '9px', border: 'none',
          background: view === 'global' ? '#fff' : 'transparent',
          color: view === 'global' ? '#1e2a4a' : '#64748b',
          fontSize: '14px', fontWeight: view === 'global' ? 700 : 500, cursor: 'pointer',
          boxShadow: view === 'global' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        }}>
          🌍 Global
        </button>
        <button
          onClick={() => activeChallenge && setView('challenge')}
          disabled={!activeChallenge}
          style={{
            padding: '10px 24px', borderRadius: '9px', border: 'none',
            background: view === 'challenge' ? '#fff' : 'transparent',
            color: !activeChallenge ? '#cbd5e1' : (view === 'challenge' ? '#1e2a4a' : '#64748b'),
            fontSize: '14px', fontWeight: view === 'challenge' ? 700 : 500,
            cursor: activeChallenge ? 'pointer' : 'not-allowed',
            boxShadow: view === 'challenge' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>
          🎯 Challenge actif
        </button>
      </div>

      {/* Sous-onglets Kilomètres / Streaks — seulement en vue Global */}
      {isGlobal && (
        <div style={{
          display: 'inline-flex', gap: '4px', background: '#f1f5f9',
          padding: '4px', borderRadius: '12px', marginBottom: '2rem', marginLeft: isMobile ? 0 : '12px',
        }}>
          {[
            { key: 'km', label: '🏃 Kilomètres' },
            { key: 'streak', label: '🔥 Streaks' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 18px', borderRadius: '9px', border: 'none',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? '#1e2a4a' : '#64748b',
              fontSize: '13px', fontWeight: tab === t.key ? 700 : 500, cursor: 'pointer',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {!isGlobal && <div style={{ marginBottom: '2rem' }} />}

      {isCollectiveStreak ? (
        /* ===== AFFICHAGE STREAK COLLECTIF ===== */
        <>
          {/* Grand encart streak du groupe */}
          <div style={{
            background: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #e67e22 100%)',
            borderRadius: '20px', padding: isMobile ? '2rem' : '3rem',
            textAlign: 'center', marginBottom: '2rem',
            position: 'relative', overflow: 'hidden',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
              Streak du groupe
            </p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '56px' : '72px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
              {challengeRanking?.collectiveStreak?.current || 0} 🔥
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>
              jours consécutifs {challengeRanking?.challenge?.goalDays ? `sur ${challengeRanking.challenge.goalDays}` : ''}
            </p>
            {challengeRanking?.collectiveStreak?.longest > 0 && (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                Record du groupe : {challengeRanking.collectiveStreak.longest} jours
              </p>
            )}
            {challengeRanking?.challenge?.goalDays > 0 && (
              <div style={{ maxWidth: '400px', margin: '1.5rem auto 0' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, ((challengeRanking.collectiveStreak.current / challengeRanking.challenge.goalDays) * 100))}%`,
                    background: '#fff', borderRadius: '99px',
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Liste des contributeurs */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e8edf5', overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 600, color: '#1e2a4a' }}>
                Contributeurs
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Chaque membre et son nombre de jours actifs dans ce challenge
              </p>
            </div>
            {(challengeRanking?.contributors || []).length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Aucune contribution pour l'instant.</p>
              </div>
            ) : (
              challengeRanking.contributors.map((m, i) => {
                const isMe = m.memberId === currentMember.id
                return (
                  <div key={m.memberId} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 1.5rem',
                    borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                    background: isMe ? '#fffbeb' : 'transparent',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: COLORS[i % 10], color: TEXT_COLORS[i % 10],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#1e2a4a' }}>
                      {m.name} {isMe && <span style={{ fontSize: '11px', color: '#e67e22', fontWeight: 700 }}>(moi)</span>}
                    </span>
                    <span style={{
                      padding: '4px 12px', borderRadius: '6px',
                      background: '#fff7ed', color: '#e67e22',
                      fontSize: '13px', fontWeight: 700,
                    }}>
                      {m.daysActive} {m.daysActive > 1 ? 'jours actifs' : 'jour actif'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        /* ===== AFFICHAGE NORMAL (podium + tableau) ===== */
        <>
          {/* Podium top 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            {list.slice(0, 3).map((m, i) => (
              <div key={m._id || m.memberId} style={{
                background: i === 0 ? '#0f1f3d' : '#fff',
                border: `1px solid ${i === 0 ? 'transparent' : '#e8edf5'}`,
                borderRadius: '16px', padding: '1.5rem', textAlign: 'center',
                boxShadow: i === 0 ? '0 4px 20px rgba(15,31,61,0.2)' : '0 1px 4px rgba(0,0,0,0.05)',
                transform: !isMobile && i === 0 ? 'translateY(-6px)' : 'none',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{MEDALS[i]}</div>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: i === 0 ? 'rgba(255,255,255,0.15)' : COLORS[i],
                  color: i === 0 ? '#fff' : TEXT_COLORS[i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 700, margin: '0 auto 10px',
                }}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: i === 0 ? '#fff' : '#1e2a4a', marginBottom: '4px' }}>
                  {m.name}
                </p>
                <p style={{
                  fontSize: '22px', fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                  color: i === 0 ? '#e67e22' : (unit === 'km' ? '#1e3a8a' : '#e67e22'),
                }}>
                  {getValue(m)} {unit} {unit === 'jours' && getValue(m) > 0 && '🔥'}
                </p>
              </div>
            ))}
          </div>

          {/* Tableau complet */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e8edf5', overflow: 'hidden', overflowX: 'auto',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 600, color: '#1e2a4a' }}>
                {isGlobal ? 'Tous les elites' : `Participants — ${activeChallenge?.name || ''}`}
              </p>
            </div>

            {list.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                  {isGlobal ? 'Aucune donnée.' : 'Aucune activité soumise pour ce challenge encore.'}
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fb' }}>
                    <th style={{ padding: '12px 1.5rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Rang</th>
                    <th style={{ padding: '12px 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Elite</th>
                    {isGlobal && (
                      <th style={{ padding: '12px 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Progression</th>
                    )}
                    <th style={{ padding: '12px 1.5rem', textAlign: 'right', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
                      {unit === 'km' ? 'Total km' : 'Streak'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m, i) => {
                    const mid = m._id || m.memberId
                    const isMe = mid === currentMember.id
                    const value = getValue(m)
                    const barWidth = getPalierProgress(value, paliers).pct
                    return (
                      <tr key={mid} style={{
                        background: isMe ? '#fffbeb' : 'transparent',
                        borderTop: '1px solid #f1f5f9',
                      }}
                        onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = '#f8faff' }}
                        onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '14px 1.5rem', width: '60px' }}>
                          <span style={{ fontSize: i < 3 ? '18px' : '14px', color: '#64748b', fontWeight: 600 }}>
                            {MEDALS[i] || `#${i + 1}`}
                          </span>
                        </td>
                        <td style={{ padding: '14px 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: COLORS[i % 10], color: TEXT_COLORS[i % 10],
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 700, flexShrink: 0,
                            }}>
                              {m.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e2a4a' }}>
                                {m.name} {isMe && <span style={{ fontSize: '11px', color: '#e67e22', fontWeight: 700 }}>(moi)</span>}
                              </p>
                              {m.email && <p style={{ fontSize: '12px', color: '#94a3b8' }}>{m.email}</p>}
                            </div>
                          </div>
                        </td>
                        {isGlobal && (
                          <td style={{ padding: '14px 1rem', width: '200px' }}>
                            <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', width: `${barWidth}%`,
                                background: isMe ? '#e67e22' : (unit === 'km' ? '#1e3a8a' : '#e67e22'),
                                borderRadius: '99px', transition: 'width 0.6s ease',
                              }} />
                            </div>
                          </td>
                        )}
                        <td style={{ padding: '14px 1.5rem', textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-block', padding: '4px 12px',
                            background: isMe ? '#fef3c7' : (unit === 'km' ? '#eff6ff' : '#fff7ed'),
                            color: isMe ? '#92400e' : (unit === 'km' ? '#1e3a8a' : '#e67e22'),
                            borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                          }}>
                            {value} {unit} {unit === 'jours' && value > 0 && '🔥'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}