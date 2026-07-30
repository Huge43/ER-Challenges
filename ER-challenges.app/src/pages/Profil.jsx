import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Profil() {
  const [member, setMember] = useState(null)
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/members'),
      axios.get(`http://localhost:5000/api/runs/member/${currentMember.id}`),
    ]).then(([membersRes, runsRes]) => {
      const me = membersRes.data.find(m => m._id === currentMember.id)
      setMember(me)
      setRuns(runsRes.data)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  if (!member) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#ef4444', fontSize: '14px' }}>Profil introuvable</p>
    </div>
  )

  const totalRuns = runs.length
  const totalKm = runs.reduce((sum, r) => sum + r.km, 0)
  const avgKm = totalRuns ? (totalKm / totalRuns).toFixed(1) : 0
  const longestRun = runs.reduce((max, r) => Math.max(max, r.km), 0)

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 60000)
    if (diff < 60) return `il y a ${diff} min`
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`
    return `il y a ${Math.floor(diff / 1440)}j`
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header profil */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 100%)',
        borderRadius: '20px', padding: '2.5rem', marginBottom: '2rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: '#e67e22', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#fff',
          flexShrink: 0,
        }}>
          {member.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h1 style={{ fontFamily: 'Poppins, serif', fontSize: '34px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
            {member.name}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
            {member.email}
          </p>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: '99px',
            background: member.role === 'admin' ? 'rgba(230,126,34,0.2)' : 'rgba(255,255,255,0.12)',
            color: member.role === 'admin' ? '#f59e0b' : 'rgba(255,255,255,0.8)',
            fontSize: '12px', fontWeight: 600,
          }}>
            {member.role === 'admin' ? '★ Administrateur' : 'Membre'}
          </span>
        </div>
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
        }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Km totaux', value: member.totalKm, color: '#1e3a8a' },
          { label: 'Courses', value: totalRuns, color: '#e67e22' },
          { label: 'Moyenne / run', value: `${avgKm} km`, color: '#16a34a' },
          { label: 'Plus long run', value: `${longestRun} km`, color: '#9333ea' },
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
            <p style={{ fontFamily: 'Poppins, serif', fontSize: '28px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1 }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Historique des runs */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8edf5', overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontFamily: 'Poppins, serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a' }}>
            Historique des courses
          </p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {totalRuns} course{totalRuns > 1 ? 's' : ''} enregistrée{totalRuns > 1 ? 's' : ''}
          </p>
        </div>

        {runs.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏃</div>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Aucune course enregistrée pour l'instant.</p>
          </div>
        ) : (
          <div>
            {runs.map((run, i) => (
              <div key={run._id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '1rem 1.5rem',
                borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: '#eff6ff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                }}>
                  🏃
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e2a4a' }}>
                    {run.note || 'Course'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {run.challenge?.name || 'Challenge'} · {new Date(run.date).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })} · {timeAgo(run.date)}
                  </p>
                </div>
                <span style={{
                  padding: '6px 14px', borderRadius: '8px',
                  background: '#dcfce7', color: '#14532d',
                  fontSize: '14px', fontWeight: 700,
                }}>
                  {run.km} km
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}