import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Legend
} from 'recharts'

export default function Progression() {
  const [runs, setRuns] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/runs'),
      axios.get('http://localhost:5000/api/members'),
    ]).then(([runsRes, membersRes]) => {
      setRuns(runsRes.data)
      setMembers(membersRes.data)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // Données cumulatives par jour pour le challenge collectif
  const collectiveData = () => {
    if (!runs.length) return []
    const sorted = [...runs].sort((a, b) => new Date(a.date) - new Date(b.date))
    let cumul = 0
    const byDate = {}
    sorted.forEach(run => {
      const date = new Date(run.date).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })
      cumul += run.km
      byDate[date] = cumul
    })
    return Object.entries(byDate).map(([date, km]) => ({ date, km: Math.round(km) }))
  }

  // Données par membre (top 5)
  const memberData = () => {
    if (!runs.length || !members.length) return []
    const top5 = members.slice(0, 5)
    const sorted = [...runs].sort((a, b) => new Date(a.date) - new Date(b.date))
    const dates = [...new Set(sorted.map(r =>
      new Date(r.date).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })
    ))]

    return dates.map(date => {
      const point = { date }
      top5.forEach(m => {
        const total = sorted
          .filter(r => r.member?._id === m._id || r.member === m._id)
          .filter(r => new Date(r.date).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' }) <= date)
          .reduce((sum, r) => sum + r.km, 0)
        point[m.name.split(' ')[0]] = total
      })
      return point
    })
  }

  const MEMBER_COLORS = ['#1e3a8a', '#e67e22', '#16a34a', '#9333ea', '#dc2626']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#fff', border: '1px solid #e8edf5',
          borderRadius: '10px', padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ fontSize: '13px', color: entry.color, fontWeight: 600 }}>
              {entry.name} : {entry.value} km
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  const collective = collectiveData()
  const byMember = memberData()
  const top5 = members.slice(0, 5)
  const totalKm = runs.reduce((sum, r) => sum + r.km, 0)
  const avgKm = members.length ? (totalKm / members.length).toFixed(1) : 0
  const totalRuns = runs.length

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'EB Garamond, serif', fontSize: '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
          Progression
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Visualisez l'évolution collective et individuelle du challenge.
        </p>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Km totaux soumis', value: `${totalKm} km`, sub: 'depuis le début', color: '#1e3a8a' },
          { label: 'Moyenne par membre', value: `${avgKm} km`, sub: 'par athlète', color: '#e67e22' },
          { label: 'Courses soumises', value: totalRuns, sub: 'runs enregistrés', color: '#16a34a' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '14px',
            border: '1px solid #e8edf5', padding: '1.25rem 1.5rem',
            borderTop: `3px solid ${card.color}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
              {card.label}
            </p>
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '32px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1 }}>
              {card.value}
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Graphique collectif */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8edf5', padding: '1.75rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a' }}>
            Km cumulés — Tour du monde
          </p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Progression collective depuis le lancement du challenge
          </p>
        </div>
        {collective.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={collective} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="km" name="Km collectifs"
                stroke="#1e3a8a" strokeWidth={2.5}
                fill="url(#colorKm)"
                dot={{ fill: '#1e3a8a', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#e67e22' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Aucune donnée disponible</p>
          </div>
        )}
      </div>

      {/* Graphique par membre */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8edf5', padding: '1.75rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a' }}>
            Progression individuelle — Top 5
          </p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Évolution des km cumulés par athlète
          </p>
        </div>
        {byMember.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={byMember} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '1rem' }}
                formatter={(value) => <span style={{ color: '#475569', fontWeight: 600 }}>{value}</span>}
              />
              {top5.map((m, i) => (
                <Line
                  key={m._id}
                  type="monotone"
                  dataKey={m.name.split(' ')[0]}
                  stroke={MEMBER_COLORS[i]}
                  strokeWidth={2}
                  dot={{ fill: MEMBER_COLORS[i], r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Aucune donnée disponible</p>
          </div>
        )}
      </div>

    </div>
  )
}