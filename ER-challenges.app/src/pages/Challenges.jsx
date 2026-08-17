import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'

const TYPES = {
  distance: { label: 'Distance', icon: '🏃', color: '#1e3a8a' },
  streak: { label: 'Streak', icon: '🔥', color: '#e67e22' },
}

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [streaks, setStreaks] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('actifs')
  const [form, setForm] = useState({
    name: '', description: '', type: 'distance', icon: '🏃',
    goalKm: '', goalDays: '', scope: 'individuel',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '', active: false,
  })
  const navigate = useNavigate()
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')
  const token = localStorage.getItem('token')
  const isAdmin = currentMember.role === 'admin'
  const isMobile = useIsMobile()

  const fetchChallenges = () => {
    axios.get('http://localhost:5000/api/challenges')
      .then(res => {
        setChallenges(res.data)
        res.data.filter(c => c.type === 'streak').forEach(c => {
          axios.get(`http://localhost:5000/api/challenges/${c._id}/streak`)
            .then(streakRes => setStreaks(prev => ({ ...prev, [c._id]: streakRes.data })))
            .catch(err => console.error(err))
        })
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchChallenges() }, [])

  const handleCreate = async () => {
    setError('')
    if (!form.name || !form.endDate) {
      setError('Nom et date de fin sont requis.')
      return
    }
    if (form.type === 'distance' && !form.goalKm) {
      setError('L\'objectif en km est requis pour un challenge distance.')
      return
    }
    if (form.type === 'streak' && !form.goalDays) {
      setError('Le nombre de jours est requis pour un challenge streak.')
      return
    }
    try {
      const payload = {
        name: form.name,
        description: form.description,
        type: form.type,
        icon: TYPES[form.type].icon,
        startDate: form.startDate,
        endDate: form.endDate,
        active: form.active,
      }
      if (form.type === 'distance') {
        payload.goalKm = Number(form.goalKm)
      } else {
        payload.goalDays = Number(form.goalDays)
        payload.scope = form.scope
      }
      await axios.post('http://localhost:5000/api/challenges', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('Challenge créé avec succès !')
      setShowModal(false)
      setForm({ name: '', description: '', type: 'distance', icon: '🏃', goalKm: '', goalDays: '', scope: 'individuel', startDate: new Date().toISOString().split('T')[0], endDate: '', active: false })
      fetchChallenges()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    }
  }

  const handleRelaunch = (c) => {
  setForm({
    name: `${c.name} (nouvelle édition)`,
    description: c.description || '',
    type: c.type,
    icon: c.icon,
    goalKm: c.goalKm ? String(c.goalKm) : '',
    goalDays: c.goalDays ? String(c.goalDays) : '',
    scope: c.scope || 'individuel',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    active: false,
  })
  setError('')
  setShowModal(true)
}

  const handleActivate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/challenges/${id}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('Challenge activé !')
      fetchChallenges()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    }
  }

  const handlePause = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/challenges/${id}/pause`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('Challenge mis en pause.')
      fetchChallenges()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    }
  }

  const handleEnd = async (id, name) => {
    if (!window.confirm(`Terminer le challenge "${name}" maintenant ? Cette action est définitive.`)) return
    try {
      await axios.put(`http://localhost:5000/api/challenges/${id}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('Challenge terminé.')
      fetchChallenges()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer le challenge "${name}" ?`)) return
    try {
      await axios.delete(`http://localhost:5000/api/challenges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('Challenge supprimé.')
      fetchChallenges()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    }
  }

  const now = new Date()
  const getStatus = (c) => {
    const start = new Date(c.startDate)
    const end = new Date(c.endDate)
    if (end < now) return { label: 'Terminé', color: '#f1f5f9', text: '#64748b' }
    if (start > now) return { label: 'À venir', color: '#e0e7ff', text: '#3730a3' }
    if (c.active) return { label: 'Actif', color: '#dcfce7', text: '#14532d' }
    return { label: 'En pause', color: '#fef3c7', text: '#92400e' }
  }

  const getProgress = (c) => {
    if (c.type === 'streak') {
      const streakData = streaks[c._id]
      if (!streakData) return { current: 0, goal: c.goalDays, pct: 0, unit: 'jours', label: 'Chargement...' }

      if (c.scope === 'collectif') {
        const pct = c.goalDays ? Math.min(100, ((streakData.current / c.goalDays) * 100).toFixed(1)) : 0
        return {
          current: streakData.current,
          goal: c.goalDays,
          pct,
          unit: 'jours',
          label: `${streakData.current} / ${c.goalDays} jours (collectif)`,
        }
      } else {
        const best = streakData.members?.[0]
        const current = best?.current || 0
        const pct = c.goalDays ? Math.min(100, ((current / c.goalDays) * 100).toFixed(1)) : 0
        return {
          current,
          goal: c.goalDays,
          pct,
          unit: 'jours',
          label: `Meilleur : ${current} / ${c.goalDays} jours`,
        }
      }
    } else {
      const pct = c.goalKm ? Math.min(100, ((c.currentKm / c.goalKm) * 100).toFixed(1)) : 0
      return {
        current: c.currentKm,
        goal: c.goalKm,
        pct,
        unit: 'km',
        label: `${c.currentKm?.toLocaleString()} / ${c.goalKm?.toLocaleString()} km`,
      }
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', color: '#1e2a4a', background: '#f8fafc', outline: 'none',
  }

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#1e2a4a', marginBottom: '6px',
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  const filteredChallenges = challenges.filter(c => {
    const status = getStatus(c)
    if (tab === 'actifs') return status.label === 'Actif' || status.label === 'En pause'
    if (tab === 'avenir') return status.label === 'À venir'
    if (tab === 'termines') return status.label === 'Terminé'
    return true
  })

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : 0, justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
            Challenges
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Tous les défis de la communauté Elite Runners.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 20px', background: '#e67e22',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            + Créer un challenge
          </button>
        )}
      </div>

      {/* Onglets */}
      <div style={{
        display: 'inline-flex', gap: '4px', background: '#f1f5f9',
        padding: '4px', borderRadius: '12px', marginBottom: '1.5rem', flexWrap: 'wrap',
      }}>
        {[
          { key: 'actifs', label: 'Actifs' },
          { key: 'avenir', label: 'À venir' },
          { key: 'termines', label: 'Terminés' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '9px 20px', borderRadius: '9px', border: 'none',
            background: tab === t.key ? '#fff' : 'transparent',
            color: tab === t.key ? '#1e2a4a' : '#64748b',
            fontSize: '13px', fontWeight: tab === t.key ? 700 : 500,
            cursor: 'pointer',
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#14532d', marginBottom: '1.5rem' }}>
          ✓ {success}
        </div>
      )}
      {error && !showModal && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#991b1b', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Grille challenges */}
      {filteredChallenges.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0',
          padding: '4rem 2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '1rem' }}>
            {tab === 'termines' ? '🏆' : tab === 'avenir' ? '📅' : '🏁'}
          </div>
          <p style={{ fontSize: '15px', color: '#64748b' }}>
            {tab === 'actifs' ? 'Aucun challenge actif pour le moment.'
              : tab === 'avenir' ? 'Aucun challenge à venir.'
              : 'Aucun challenge terminé pour l\'instant.'}
          </p>
          {isAdmin && tab === 'actifs' && <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Créez le premier challenge de la communauté !</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
          {filteredChallenges.map(c => {
            const status = getStatus(c)
            const typeInfo = TYPES[c.type] || TYPES.distance
            const progress = getProgress(c)
            const isFinished = status.label === 'Terminé'
            return (
              <div key={c._id} style={{
                background: '#fff', borderRadius: '16px',
                border: c.active && !isFinished ? '2px solid #16a34a' : '1px solid #e8edf5',
                padding: '1.5rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: `${typeInfo.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>
                    {c.icon || typeInfo.icon}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {c.type === 'streak' && (
                      <span style={{
                        padding: '4px 10px', borderRadius: '99px',
                        background: '#fff7ed', color: '#e67e22',
                        fontSize: '11px', fontWeight: 600,
                      }}>
                        {c.scope === 'collectif' ? 'Collectif' : 'Individuel'}
                      </span>
                    )}
                    <span style={{
                      padding: '4px 12px', borderRadius: '99px',
                      background: status.color, color: status.text,
                      fontSize: '11px', fontWeight: 600,
                    }}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a', marginBottom: '4px' }}>
                  {c.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem', minHeight: '40px' }}>
                  {c.description || 'Pas de description.'}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>{progress.label}</span>
                    <span style={{ fontWeight: 700, color: typeInfo.color }}>{progress.pct}%</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress.pct}%`, background: typeInfo.color, borderRadius: '99px' }} />
                  </div>
                </div>

                {/* Classement figé complet pour les challenges terminés */}
                {c.resultsFrozen && c.results?.length > 0 && (
                  <div style={{
                    background: '#f8f9fb', borderRadius: '10px',
                    padding: '1rem', marginBottom: '1rem',
                  }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>
                      🏆 Classement final
                    </p>
                    {c.results.map((r, idx) => (
                      <div key={r.memberId || idx} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '6px 0',
                        borderBottom: idx < c.results.length - 1 ? '1px solid #eef1f6' : 'none',
                      }}>
                        <span style={{ fontSize: idx < 3 ? '16px' : '13px', width: '28px', color: '#64748b', fontWeight: 600 }}>
                          {['🥇', '🥈', '🥉'][idx] || `#${idx + 1}`}
                        </span>
                        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#1e2a4a' }}>
                          {r.name}
                        </span>
                        <span style={{
                          fontSize: '13px', fontWeight: 700,
                          color: idx === 0 ? '#e67e22' : '#64748b',
                        }}>
                          {r.value} {c.type === 'streak' ? 'jours' : 'km'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: isAdmin ? '1rem' : 0 }}>
                  <span>📅 {new Date(c.startDate).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })} → {new Date(c.endDate).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })}</span>
                  <span>{c.participants?.length || 0} participants</span>
                </div>

                {isAdmin && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    {isFinished ? (
                      <>
                        <button onClick={() => handleRelaunch(c)} style={{
                          flex: 1, padding: '8px', background: '#dcfce7', color: '#14532d',
                          border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        }}>
                          Relancer
                        </button>
                        <button onClick={() => handleDelete(c._id, c.name)} style={{
                          padding: '8px 14px', background: '#fee2e2', color: '#991b1b',
                          border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        }}>
                          Suppr.
                        </button>
                      </>
                    ) : (
                      <>
                        {c.active ? (
                          <button onClick={() => handlePause(c._id)} style={{
                            flex: 1, padding: '8px', background: '#fef3c7', color: '#92400e',
                            border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          }}>
                            Mettre en pause
                          </button>
                        ) : (
                          <button onClick={() => handleActivate(c._id)} style={{
                            flex: 1, padding: '8px', background: '#dcfce7', color: '#14532d',
                            border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          }}>
                            Activer
                          </button>
                        )}
                        <button onClick={() => handleEnd(c._id, c.name)} style={{
                          flex: 1, padding: '8px', background: '#fff7ed', color: '#e67e22',
                          border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        }}>
                          Terminer
                        </button>
                        <button onClick={() => handleDelete(c._id, c.name)} style={{
                          padding: '8px 14px', background: '#fee2e2', color: '#991b1b',
                          border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        }}>
                          Suppr.
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal création */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '2rem',
            width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 600, color: '#1e2a4a' }}>
                Créer un challenge
              </h2>
              <button onClick={() => { setShowModal(false); setError('') }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Nom du challenge</label>
              <input type="text" placeholder="Ex: Marathon de Mai" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea placeholder="Décris l'objectif du challenge..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'none' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Type de challenge</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {Object.entries(TYPES).map(([key, info]) => (
                  <button key={key} onClick={() => setForm({ ...form, type: key })} style={{
                    padding: '12px 8px', borderRadius: '8px',
                    border: form.type === key ? `2px solid ${info.color}` : '1px solid #e2e8f0',
                    background: form.type === key ? `${info.color}10` : '#f8fafc',
                    cursor: 'pointer', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{info.icon}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: form.type === key ? info.color : '#64748b' }}>{info.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {form.type === 'distance' ? (
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Objectif (km)</label>
                <input type="number" placeholder="Ex: 40075" value={form.goalKm} onChange={e => setForm({ ...form, goalKm: e.target.value })} style={inputStyle} />
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Nombre de jours consécutifs</label>
                  <input type="number" placeholder="Ex: 21" value={form.goalDays} onChange={e => setForm({ ...form, goalDays: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Portée du streak</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { key: 'individuel', label: 'Individuel', desc: 'Chacun son streak' },
                      { key: 'collectif', label: 'Collectif', desc: 'Le groupe entier' },
                    ].map(opt => (
                      <button key={opt.key} type="button" onClick={() => setForm({ ...form, scope: opt.key })} style={{
                        padding: '12px', borderRadius: '8px', textAlign: 'left',
                        border: form.scope === opt.key ? '2px solid #e67e22' : '1px solid #e2e8f0',
                        background: form.scope === opt.key ? '#fff7ed' : '#f8fafc',
                        cursor: 'pointer',
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: form.scope === opt.key ? '#e67e22' : '#1e2a4a' }}>{opt.label}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Date de début</label>
                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date de fin</label>
                <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowModal(false); setError('') }} style={{ flex: 1, padding: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={handleCreate} style={{ flex: 1, padding: '11px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Créer le challenge →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}