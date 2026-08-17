import { useEffect, useState } from 'react'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'

const COLORS = ['#dbeafe', '#e0e7ff', '#fce7f3', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#e0f2fe', '#f0fdf4', '#fdf4ff']
const TEXT_COLORS = ['#1e3a8a', '#3730a3', '#9d174d', '#14532d', '#92400e', '#991b1b', '#581c87', '#0c4a6e', '#14532d', '#581c87']

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
  if (!next) return { pct: 100, label: 'Tous les paliers atteints 👑' }
  const prev = [...paliers].reverse().find(p => p.value <= value)
  const base = prev ? prev.value : 0
  const pct = Math.round(((value - base) / (next.value - base)) * 100)
  return { pct, label: `${next.value - value} avant "${next.label}" ${next.icon}` }
}

export default function Progression() {
  const [members, setMembers] = useState([])
  const [streaks, setStreaks] = useState([])
  const [runs, setRuns] = useState([])
  const [tab, setTab] = useState('km')
  const [loading, setLoading] = useState(true)
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')
  const isMobile = useIsMobile()

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/members'),
      axios.get('http://localhost:5000/api/members/streaks'),
      axios.get('http://localhost:5000/api/runs'),
    ]).then(([membersRes, streaksRes, runsRes]) => {
      setMembers(membersRes.data)
      setStreaks(streaksRes.data)
      setRuns(runsRes.data)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  const isKm = tab === 'km'
  const paliers = isKm ? PALIERS_KM : PALIERS_STREAK

  // Ma valeur selon l'onglet
  const me = members.find(m => m._id === currentMember.id)
  const myStreak = streaks.find(s => s._id === currentMember.id)
  const myValue = isKm ? (me?.totalKm || 0) : (myStreak?.current || 0)
  const myRecord = myStreak?.longest || 0

  // Liste triée selon l'onglet
  const list = isKm
    ? [...members].sort((a, b) => b.totalKm - a.totalKm)
    : [...streaks]

  // Stats communauté
  const totalKm = runs.reduce((sum, r) => sum + r.km, 0)
  const avgKm = members.length ? (members.reduce((s, m) => s + m.totalKm, 0) / members.length).toFixed(0) : 0
  const bestStreak = streaks[0]?.current || 0
  const avgStreak = streaks.length ? (streaks.reduce((s, m) => s + m.current, 0) / streaks.length).toFixed(1) : 0

  // Mon prochain palier
  const nextPalier = paliers.find(p => p.value > myValue)
  const lastPalier = [...paliers].reverse().find(p => p.value <= myValue)
  const unit = isKm ? 'km' : 'jours'

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
          Progression
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          {isKm ? 'Suivez l\'avancée de la communauté en kilomètres.' : 'Suivez les streaks de la communauté — la régularité avant tout.'}
        </p>
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

      {/* Cartes de stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {(isKm ? [
          { label: 'Mes kilomètres', value: `${myValue} km`, sub: lastPalier ? `Palier : ${lastPalier.label}` : 'Continue !', color: '#e67e22' },
          { label: 'Total communauté', value: `${totalKm} km`, sub: `${members.length} athlètes`, color: '#1e3a8a' },
          { label: 'Moyenne par membre', value: `${avgKm} km`, sub: 'tous membres', color: '#16a34a' },
        ] : [
          { label: 'Mon streak actuel', value: `${myValue} jours ${myValue > 0 ? '🔥' : ''}`, sub: `Record perso : ${myRecord} jours`, color: '#e67e22' },
          { label: 'Meilleur streak actif', value: `${bestStreak} jours`, sub: 'dans la communauté', color: '#1e3a8a' },
          { label: 'Moyenne des streaks', value: `${avgStreak} jours`, sub: 'tous membres', color: '#16a34a' },
        ]).map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '14px', border: '1px solid #e8edf5',
            padding: '1.25rem 1.5rem', borderTop: `3px solid ${card.color}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
              {card.label}
            </p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '30px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1 }}>
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
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a', marginBottom: '4px' }}>
          {isKm ? 'Mes paliers kilomètres' : 'Mes paliers streaks'}
        </p>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>
          {nextPalier
            ? `Plus que ${nextPalier.value - myValue} ${unit} pour atteindre "${nextPalier.label}" ${nextPalier.icon}`
            : `Tu as franchi tous les paliers ! 👑`}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {paliers.map(palier => {
            const reached = myValue >= palier.value
            return (
              <div key={palier.value} style={{
                flex: isMobile ? '1 1 calc(33% - 10px)' : 1,
                textAlign: 'center', padding: '1rem 0.5rem',
                borderRadius: '12px',
                background: reached ? (isKm ? '#f0fdf4' : '#fff7ed') : '#f8f9fb',
                border: `1px solid ${reached ? (isKm ? '#bbf7d0' : '#fed7aa') : '#e8edf5'}`,
                opacity: reached ? 1 : 0.6,
              }}>
                <div style={{ fontSize: '24px', marginBottom: '6px', filter: reached ? 'none' : 'grayscale(1)' }}>
                  {palier.icon}
                </div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: reached ? (isKm ? '#14532d' : '#9a3412') : '#94a3b8' }}>
                  {palier.value} {unit}
                </p>
                <p style={{ fontSize: '11px', color: reached ? (isKm ? '#16a34a' : '#e67e22') : '#94a3b8', marginTop: '2px' }}>
                  {palier.label}
                </p>
                {reached && <p style={{ fontSize: '10px', color: isKm ? '#16a34a' : '#e67e22', fontWeight: 700, marginTop: '4px' }}>✓ Atteint</p>}
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
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a', marginBottom: '4px' }}>
          {isKm ? 'Progression des membres' : 'Streaks des membres'}
        </p>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>
          {isKm ? 'Progression de chaque athlète vers son prochain palier' : 'Progression de chaque streak vers le prochain palier'}
        </p>

        {list.map((m, i) => {
          const value = isKm ? m.totalKm : m.current
          const palierInfo = getPalierProgress(value, paliers)
          const barWidth = palierInfo.pct
          const isMe = m._id === currentMember.id
          return (
            <div key={m._id} style={{ marginBottom: i < list.length - 1 ? '1.25rem' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: COLORS[i % 10], color: TEXT_COLORS[i % 10],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, flexShrink: 0,
                }}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e2a4a' }}>
                    {m.name} {isMe && <span style={{ fontSize: '11px', color: '#e67e22', fontWeight: 700 }}>(moi)</span>}
                  </span>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                    {palierInfo.label}
                  </span>
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: isMe ? '#e67e22' : (isKm ? '#1e3a8a' : '#e67e22') }}>
                  {value} {unit} {!isKm && value > 0 && '🔥'}
                </span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '8px', overflow: 'hidden', marginLeft: '44px' }}>
                <div style={{
                  height: '100%', width: `${barWidth}%`,
                  background: isMe ? '#e67e22' : (isKm ? '#1e3a8a' : '#f59e0b'),
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