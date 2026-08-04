import { useEffect, useState } from 'react'
import api from '../api/index.js'
import useIsMobile from '../hooks/useIsMobile'

const COLORS = ['#dbeafe', '#e0e7ff', '#fce7f3', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#e0f2fe', '#f0fdf4', '#fdf4ff']
const TEXT_COLORS = ['#1e3a8a', '#3730a3', '#9d174d', '#14532d', '#92400e', '#991b1b', '#581c87', '#0c4a6e', '#14532d', '#581c87']
const MEDALS = ['🥇', '🥈', '🥉']

export default function Classement() {
  const [members, setMembers] = useState([])
  const [streaks, setStreaks] = useState([])
  const [tab, setTab] = useState('km')
  const [loading, setLoading] = useState(true)
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')
  const isMobile = useIsMobile()

  useEffect(() => {
    Promise.all([
      axios.get('http://192.168.2.37:5000/api/members'),
      axios.get('http://192.168.2.37:5000/api/members/streaks'),
    ]).then(([membersRes, streaksRes]) => {
      setMembers(membersRes.data)
      setStreaks(streaksRes.data)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  const isKm = tab === 'km'
  const list = isKm ? members : streaks
  const maxValue = isKm ? (members[0]?.totalKm || 1) : (streaks[0]?.current || 1)
  const myRank = list.findIndex(m => m._id === currentMember.id) + 1

  const getValue = (m) => isKm ? m.totalKm : m.current
  const getUnit = () => isKm ? 'km' : 'jours'

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : 0, justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
            Classement
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {isKm ? 'Classement général par kilomètres cumulés.' : 'Classement des streaks — jours consécutifs d\'activité.'}
          </p>
        </div>
        {myRank > 0 && (
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

      {/* Onglets */}
      <div style={{
        display: 'inline-flex', gap: '4px', background: '#f1f5f9',
        padding: '4px', borderRadius: '12px', marginBottom: '2rem',
      }}>
        {[
          { key: 'km', label: '🏃 Kilomètres' },
          { key: 'streak', label: '🔥 Streaks' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 24px', borderRadius: '9px', border: 'none',
            background: tab === t.key ? '#fff' : 'transparent',
            color: tab === t.key ? '#1e2a4a' : '#64748b',
            fontSize: '14px', fontWeight: tab === t.key ? 700 : 500,
            cursor: 'pointer',
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Podium top 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {list.slice(0, 3).map((m, i) => (
          <div key={m._id} style={{
            background: i === 0 ? '#0f1f3d' : '#fff',
            border: `1px solid ${i === 0 ? 'transparent' : '#e8edf5'}`,
            borderRadius: '16px', padding: '1.5rem',
            textAlign: 'center',
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
              color: i === 0 ? '#e67e22' : (isKm ? '#1e3a8a' : '#e67e22'),
            }}>
              {getValue(m)} {getUnit()} {!isKm && getValue(m) > 0 && '🔥'}
            </p>
            {!isKm && (
              <p style={{ fontSize: '11px', color: i === 0 ? 'rgba(255,255,255,0.5)' : '#94a3b8', marginTop: '4px' }}>
                Record : {m.longest} jours
              </p>
            )}
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
            Tous les athlètes
          </p>
        </div>
        <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fb' }}>
              <th style={{ padding: '12px 1.5rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Rang</th>
              <th style={{ padding: '12px 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Athlète</th>
              <th style={{ padding: '12px 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Progression</th>
              <th style={{ padding: '12px 1.5rem', textAlign: 'right', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
                {isKm ? 'Total km' : 'Streak actuel'}
              </th>
              {!isKm && (
                <th style={{ padding: '12px 1.5rem', textAlign: 'right', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
                  Record
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {list.map((m, i) => {
              const isMe = m._id === currentMember.id
              const value = getValue(m)
              const barWidth = Math.round((value / maxValue) * 100)
              return (
                <tr key={m._id} style={{
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
                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 1rem', width: '200px' }}>
                    <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${barWidth}%`,
                        background: isMe ? '#e67e22' : (isKm ? '#1e3a8a' : '#e67e22'),
                        borderRadius: '99px', transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 1.5rem', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px',
                      background: isMe ? '#fef3c7' : (isKm ? '#eff6ff' : '#fff7ed'),
                      color: isMe ? '#92400e' : (isKm ? '#1e3a8a' : '#e67e22'),
                      borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                    }}>
                      {value} {getUnit()} {!isKm && value > 0 && '🔥'}
                    </span>
                  </td>
                  {!isKm && (
                    <td style={{ padding: '14px 1.5rem', textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                        {m.longest} jours
                      </span>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}