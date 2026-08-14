import { useEffect, useState } from 'react'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'

const COLORS = ['#dbeafe','#e0e7ff','#fce7f3','#dcfce7','#fef3c7','#fee2e2','#f3e8ff','#e0f2fe','#f0fdf4','#fdf4ff']
const TEXT_COLORS = ['#1e3a8a','#3730a3','#9d174d','#14532d','#92400e','#991b1b','#581c87','#0c4a6e','#14532d','#581c87']

export default function Membres() {
  const [members, setMembers] = useState([])
  const [streaks, setStreaks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')
  const token = localStorage.getItem('token')
  const isAdmin = currentMember.role === 'admin'
  const isMobile = useIsMobile()

  const fetchMembers = () => {
    Promise.all([
      axios.get('http://192.168.2.37:5000/api/members'),
      axios.get('http://192.168.2.37:5000/api/members/streaks'),
    ]).then(([membersRes, streaksRes]) => {
      setMembers(membersRes.data)
      setStreaks(streaksRes.data)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMembers() }, [])

  const handleAdd = async () => {
    setError('')
    if (!form.name || !form.email) { setError('Nom et email requis.'); return }
    try {
      await axios.post('http://192.168.2.37:5000/api/members', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('Membre ajouté avec succès !')
      setShowModal(false)
      setForm({ name: '', email: '', password: '', role: 'member' })
      fetchMembers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Retirer ${name} de la communauté ?`)) return
    try {
      await axios.delete(`http://192.168.2.37:5000/api/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess(`${name} a été retiré.`)
      fetchMembers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    }
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.put(`http://192.168.2.37:5000/api/members/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('Rôle mis à jour !')
      fetchMembers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', color: '#1e2a4a',
    background: '#f8fafc', outline: 'none',
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : 0, justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
            Membres
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {members.length} Elites dans la communauté Elite Runners.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 20px', background: '#e67e22',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            + Ajouter un membre
          </button>
        )}
      </div>

      {/* Notifications */}
      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '8px', padding: '12px 16px',
          fontSize: '13px', color: '#14532d', marginBottom: '1.5rem',
        }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '12px 16px',
          fontSize: '13px', color: '#991b1b', marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {/* Tableau membres */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8edf5', overflow: 'hidden', overflowX: 'auto',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fb' }}>
              <th style={{ padding: '14px 1.5rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Athlète</th>
              <th style={{ padding: '14px 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Rôle</th>
              <th style={{ padding: '14px 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Total km</th>
              <th style={{ padding: '14px 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Meilleur streak</th>
              <th style={{ padding: '14px 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Membre depuis</th>
              {isAdmin && (
                <th style={{ padding: '14px 1.5rem', textAlign: 'right', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => {
              const isMe = m._id === currentMember.id
              const streakData = streaks.find(s => s._id === m._id)
              const longest = streakData?.longest || 0
              return (
                <tr key={m._id} style={{
                  borderTop: '1px solid #f1f5f9',
                  background: isMe ? '#fffbeb' : 'transparent',
                }}
                  onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = '#f8faff' }}
                  onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '14px 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
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
                  <td style={{ padding: '14px 1rem' }}>
                    {isAdmin && !isMe ? (
                      <select
                        value={m.role}
                        onChange={e => handleRoleChange(m._id, e.target.value)}
                        style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                          border: '1px solid #e2e8f0', background: '#f8fafc',
                          color: m.role === 'admin' ? '#1e3a8a' : '#475569',
                          fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <option value="member">Membre</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                        background: m.role === 'admin' ? '#eff6ff' : '#f1f5f9',
                        color: m.role === 'admin' ? '#1e3a8a' : '#475569',
                        fontSize: '12px', fontWeight: 600,
                      }}>
                        {m.role === 'admin' ? 'Admin' : 'Membre'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 1rem' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px',
                      background: '#eff6ff', color: '#1e3a8a',
                      borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                    }}>
                      {m.totalKm} km
                    </span>
                  </td>
                  <td style={{ padding: '14px 1rem' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px',
                      background: longest > 0 ? '#fff7ed' : '#f1f5f9',
                      color: longest > 0 ? '#e67e22' : '#94a3b8',
                      borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                    }}>
                      {longest} {longest > 1 ? 'jours' : 'jour'} {longest > 0 && '🔥'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 1rem' }}>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(m.createdAt).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '14px 1.5rem', textAlign: 'right' }}>
                      {!isMe && (
                        <button
                          onClick={() => handleDelete(m._id, m.name)}
                          style={{
                            padding: '6px 14px', background: '#fee2e2',
                            color: '#991b1b', border: 'none', borderRadius: '6px',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          }}
                          onMouseEnter={e => e.target.style.background = '#fecaca'}
                          onMouseLeave={e => e.target.style.background = '#fee2e2'}
                        >
                          Retirer
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal ajout membre */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '2rem', width: '100%', maxWidth: '460px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 600, color: '#1e2a4a' }}>
                Ajouter un membre
              </h2>
              <button onClick={() => { setShowModal(false); setError('') }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e2a4a', marginBottom: '6px' }}>Nom complet</label>
              <input type="text" placeholder="Marie Leclair" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e2a4a', marginBottom: '6px' }}>Email</label>
              <input type="email" placeholder="marie@elite.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e2a4a', marginBottom: '6px' }}>
                Mot de passe <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(défaut : EliteRunners2026)</span>
              </label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e2a4a', marginBottom: '6px' }}>Rôle</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="member">Membre</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowModal(false); setError('') }} style={{ flex: 1, padding: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={handleAdd} style={{ flex: 1, padding: '11px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Ajouter →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}