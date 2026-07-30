import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function SoumettreRun() {
  const [form, setForm] = useState({ km: '', note: '', date: new Date().toISOString().split('T')[0] })
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const member = JSON.parse(localStorage.getItem('member') || '{}')
  const token = localStorage.getItem('token')
  const isStreak = challenge?.type === 'streak'

  useEffect(() => {
    axios.get('http://localhost:5000/api/challenges/active')
      .then(res => setChallenge(res.data))
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async () => {
    setError('')
    if (!isStreak && (!form.km || isNaN(form.km) || Number(form.km) <= 0)) {
      setError('Entrez une distance valide.')
      return
    }
    if (!challenge) {
      setError('Aucun challenge actif trouvé.')
      return
    }
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/api/runs', {
        member: member.id,
        challenge: challenge._id,
        km: isStreak ? Number(form.km || 0) : Number(form.km),
        note: form.note,
        date: form.date,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    border: '1px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', color: '#1e2a4a',
    background: '#f8fafc', outline: 'none',
    transition: 'border 0.2s',
  }

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#1e2a4a', marginBottom: '8px',
  }

  if (success) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>{isStreak ? '🔥' : '🎉'}</div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 600, color: '#1e2a4a', marginBottom: '8px' }}>
          {isStreak ? 'Journée validée !' : 'Course soumise !'}
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          {isStreak ? 'Ton streak continue. Redirection...' : 'Tes km ont été ajoutés au challenge. Redirection...'}
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
          {isStreak ? 'Valider ma journée' : 'Soumettre une course'}
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          {isStreak ? 'Enregistre ton activité du jour pour maintenir ton streak 🔥' : 'Ajoute tes kilomètres au challenge collectif.'}
        </p>
      </div>

      {/* Carte membre */}
      <div style={{
        background: '#0f1f3d', borderRadius: '14px',
        padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: '#e67e22', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff',
        }}>
          {member.name?.split(' ').map(n => n[0]).join('') || 'ER'}
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{member.name}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            {challenge ? `Challenge : ${challenge.name}` : 'Chargement du challenge...'}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8edf5', padding: '2rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>

        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '12px 16px',
            fontSize: '13px', color: '#991b1b', marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        {/* Distance */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Distance (km) {isStreak && <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optionnel pour un streak)</span>}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              placeholder="Ex: 10.5"
              min="0"
              step="0.1"
              value={form.km}
              onChange={e => setForm({ ...form, km: e.target.value })}
              style={{ ...inputStyle, paddingRight: '50px' }}
              onFocus={e => e.target.style.borderColor = '#e67e22'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <span style={{
              position: 'absolute', right: '14px', top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '13px', fontWeight: 600, color: '#94a3b8',
            }}>
              km
            </span>
          </div>
        </div>

        {/* Date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>{isStreak ? 'Date de l\'activité' : 'Date du run'}</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#e67e22'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={labelStyle}>Note <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optionnel)</span></label>
          <textarea
            placeholder={isStreak ? 'Ex: 10 pages lues, chapitre 3 terminé...' : 'Ex: Trail Mont-Royal, sortie longue du dimanche...'}
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = '#e67e22'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Aperçu */}
        {isStreak ? (
          <div style={{
            background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '20px' }}>🔥</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#9a3412' }}>
                Valider aujourd'hui prolonge ton streak d'un jour
              </p>
              <p style={{ fontSize: '12px', color: '#e67e22', marginTop: '2px' }}>
                Objectif : {challenge?.goalDays || '...'} jours consécutifs
              </p>
            </div>
          </div>
        ) : (
          form.km > 0 && challenge && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ fontSize: '20px' }}>🏃</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#14532d' }}>
                  +{form.km} km ajoutés à {challenge.name}
                </p>
                <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px' }}>
                  Contribution de {((form.km / (challenge.goalKm || 1)) * 100).toFixed(3)}% à l'objectif collectif
                </p>
              </div>
            </div>
          )
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#f0a050' : '#e67e22',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!loading) e.target.style.background = '#d4711e' }}
          onMouseLeave={e => { if (!loading) e.target.style.background = '#e67e22' }}
        >
          {loading ? 'Soumission...' : isStreak ? 'VALIDER MA JOURNÉE 🔥' : 'SOUMETTRE MA COURSE →'}
        </button>
      </div>
    </div>
  )
}