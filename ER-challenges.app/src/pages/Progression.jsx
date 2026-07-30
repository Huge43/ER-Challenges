import { useEffect, useState } from 'react'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'

const COLORS = ['#dbeafe', '#e0e7ff', '#fce7f3', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#e0f2fe', '#f0fdf4', '#fdf4ff']
const TEXT_COLORS = ['#1e3a8a', '#3730a3', '#9d174d', '#14532d', '#92400e', '#991b1b', '#581c87', '#0c4a6e', '#14532d', '#581c87']

const PALIERS = [
  { km: 50, label: 'Premiers pas', icon: '🌱' },
  { km: 100, label: 'En rythme', icon: '🏃' },
  { km: 250, label: 'Endurant', icon: '💪' },
  { km: 500, label: 'Marathonien', icon: '🔥' },
  { km: 1000, label: 'Légende', icon: '👑' },
]

export default function Progression() {
  const [members, setMembers] = useState([])
  const [runs, setRuns] = useState([])
  const [activeChallenge, setActiveChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')
  const isMobile = useIsMobile()

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/members'),
      axios.get('http://localhost:5000/api/runs'),
      axios.get('http://localhost:5000/api/challenges/active'),
    ]).then(([membersRes, runsRes, activeRes]) => {
      setMembers(membersRes.data)
      setRuns(runsRes.data)
      setActiveChallenge(activeRes.data)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  const me = members.find(m => m._id === currentMember.id)
  const myKm = me?.totalKm || 0
  const totalKm = runs.reduce((sum, r) => sum + r.km, 0)
  const avgKm = members.length ? (members.reduce((s, m) => s + m.totalKm, 0) / members.length).toFixed(0) : 0
  const maxKm = members[0]?.totalKm || 1

  // Mon prochain palier
  const nextPalier = PALIERS.find(p => p.km > myKm)
  const lastPalier = [...PALIERS].reverse().find(p => p.km <= myKm)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Poppins, serif', fontSize: '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
          Progression
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Suivez l'avancée de la communauté en un coup d'œil.
        </p>
      </div>

      {/* Cartes de stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Mes kilomètres', value: `${myKm} km`, sub: lastPalier ? `Palier : ${lastPalier.label}` : 'Continue !', color: '#e67e22' },
          { label: 'Total communauté', value: `${totalKm} km`, sub: `${members.length} athlètes`, color: '#1e3a8a' },
          { label: 'Moyenne par membre', value: `${avgKm} km`, sub: 'tous membres', color: '#16a34a' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '14px', border: '1px solid #e8edf5',
            padding: '1.25rem 1.5rem', borderTop: `3px solid ${card.color}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
              {card.label}
            </p>
            <p style={{ fontFamily: 'Poppins, serif', fontSize: '30px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1 }}>
              {card.value}
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Mes paliers */}
      <div style={{
        background: '#fff', borderRadius: '16px', border: '1px solid #e8edf5',
        padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <p style={{ fontFamily: 'Poppins, serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a', marginBottom: '4px' }}>
          Mes paliers
        </p>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>
          {nextPalier
            ? `Plus que ${nextPalier.km - myKm} km pour atteindre "${nextPalier.label}" ${nextPalier.icon}`
            : 'Tu as franchi tous les paliers ! 👑'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {PALIERS.map(palier => {
            const reached = myKm >= palier.km
            return (
              <div key={palier.km} style={{
                flex: isMobile ? '1 1 calc(33% - 10px)' : 1, textAlign: 'center', padding: '1rem 0.5rem',
                borderRadius: '12px',
                background: reached ? '#f0fdf4' : '#f8f9fb',
                border: `1px solid ${reached ? '#bbf7d0' : '#e8edf5'}`,
                opacity: reached ? 1 : 0.6,
              }}>
                <div style={{ fontSize: '24px', marginBottom: '6px', filter: reached ? 'none' : 'grayscale(1)' }}>
                  {palier.icon}
                </div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: reached ? '#14532d' : '#94a3b8' }}>
                  {palier.km} km
                </p>
                <p style={{ fontSize: '11px', color: reached ? '#16a34a' : '#94a3b8', marginTop: '2px' }}>
                  {palier.label}
                </p>
                {reached && <p style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>✓ Atteint</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Progression des membres */}
      <div style={{
        background: '#fff', borderRadius: '16px', border: '1px solid #e8edf5',
        padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <p style={{ fontFamily: 'Poppins, serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a', marginBottom: '4px' }}>
          Progression des membres
        </p>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>
          Kilomètres cumulés par chaque athlète
        </p>

        {members.map((m, i) => {
          const barWidth = Math.round((m.totalKm / maxKm) * 100)
          const isMe = m._id === currentMember.id
          return (
            <div key={m._id} style={{ marginBottom: i < members.length - 1 ? '1.25rem' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: COLORS[i % 10], color: TEXT_COLORS[i % 10],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, flexShrink: 0,
                }}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#1e2a4a' }}>
                  {m.name} {isMe && <span style={{ fontSize: '11px', color: '#e67e22', fontWeight: 700 }}>(moi)</span>}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: isMe ? '#e67e22' : '#1e3a8a' }}>
                  {m.totalKm} km
                </span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '8px', overflow: 'hidden', marginLeft: '44px' }}>
                <div style={{
                  height: '100%', width: `${barWidth}%`,
                  background: isMe ? '#e67e22' : '#1e3a8a',
                  borderRadius: '99px', transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}