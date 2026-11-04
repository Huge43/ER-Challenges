import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { containsDay, formatDay, today, fmtKm } from '../utils/challenge'

export default function SoumettreRun() {
  const [form, setForm] = useState({ km: '', note: '', date: today() })
  const [actives, setActives] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const member = JSON.parse(localStorage.getItem('member') || '{}')
  const [loadingChallenge, setLoadingChallenge] = useState(true)

  useEffect(() => {
    api.get('/challenges/active')
      .then(res => setActives(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingChallenge(false))
  }, [])

  // Le run comptera pour tous les challenges actifs dont la période contient la date choisie
  const matching = actives.filter(c => containsDay(c, form.date))
  const hasStreak = matching.some(c => c.type === 'streak')
  const distances = matching.filter(c => c.type !== 'streak')
  const isStreak = hasStreak && distances.length === 0
  const km = Number(form.km || 0)

  // Bornes du sélecteur : la période couverte par les challenges actifs, sans dépasser aujourd'hui
  const minDate = actives.map(c => c.startDate.slice(0, 10)).sort()[0]
  const maxEnd = actives.map(c => c.endDate.slice(0, 10)).sort().at(-1)
  const maxDate = maxEnd && maxEnd < today() ? maxEnd : today()

  const handleSubmit = async () => {
    setError('')
    if (matching.length === 0) {
      setError(`Aucun challenge actif ne couvre le ${formatDay(form.date, { day: 'numeric', month: 'long' })}.`)
      return
    }
    // Sans streak à valider, une distance est obligatoire
    if (!hasStreak && (!form.km || isNaN(form.km) || km <= 0)) {
      setError('Entrez une distance valide.')
      return
    }
    setLoading(true)
    try {
      await api.post('/runs', { km, note: form.note, date: form.date })
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
          {isStreak ? 'Ton streak continue. Redirection...' : 'Tes km ont été ajoutés aux challenges. Redirection...'}
        </p>
      </div>
    </div>
  )

  if (loadingChallenge) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  // Aucun challenge actif (aucun activé, ou tous en pause/terminés)
  if (actives.length === 0) return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '36px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
          Soumettre une activité
        </h1>
      </div>
      <div style={{
        background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0',
        padding: '3.5rem 2rem', textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '1rem' }}>⏸️</div>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e2a4a', marginBottom: '6px' }}>
          Aucun challenge en cours
        </p>
        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
          Il n'y a pas de challenge actif pour le moment. Reviens quand un défi sera lancé pour enregistrer tes activités !
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
          {isStreak ? 'Enregistre ton activité du jour pour maintenir ton streak 🔥' : 'Tes kilomètres comptent pour tous les challenges en cours à cette date.'}
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
          justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {member.name?.split(' ').map(n => n[0]).join('') || 'ER'}
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{member.name}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            {matching.length
              ? `Compte pour : ${matching.map(c => c.name).join(', ')}`
              : 'Aucun challenge actif à cette date'}
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
          <div role="alert" style={{
            background: '#fee2e2', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '12px 16px',
            fontSize: '13px', color: '#991b1b', marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        {/* Distance — masquée si seuls des streaks sont concernés */}
        {!isStreak && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="run-km" style={labelStyle}>
              Distance (km)
              {hasStreak && <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> (optionnel pour valider ton streak)</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="run-km"
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
        )}

        {/* Date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="run-date" style={labelStyle}>{isStreak ? 'Date de l\'activité' : 'Date du run'}</label>
          <input
            id="run-date"
            type="date"
            value={form.date}
            min={minDate}
            max={maxDate}
            onChange={e => setForm({ ...form, date: e.target.value })}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#e67e22'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          {matching.length === 0 && (
            <p style={{ fontSize: '12px', color: '#991b1b', marginTop: '6px' }}>
              Aucun challenge actif ne couvre cette date. Périodes ouvertes : {actives.map(c =>
                `${c.name} (${formatDay(c.startDate, { day: 'numeric', month: 'short' })} → ${formatDay(c.endDate, { day: 'numeric', month: 'short' })})`).join(', ')}.
            </p>
          )}
        </div>

        {/* Note */}
        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="run-note" style={labelStyle}>Note <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optionnel)</span></label>
          <textarea
            id="run-note"
            placeholder={isStreak ? 'Ex: 10 pages lues, chapitre 3 terminé...' : 'Ex: Trail Mont-Royal, sortie longue du dimanche...'}
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = '#e67e22'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Aperçu : streaks validés */}
        {hasStreak && (
          <div style={{
            background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '20px' }}>🔥</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#9a3412' }}>
                Cette activité valide ta journée de streak
              </p>
              {matching.filter(c => c.type === 'streak').map(c => (
                <p key={c._id} style={{ fontSize: '12px', color: '#e67e22', marginTop: '2px' }}>
                  {c.name} : objectif {c.goalDays} jours consécutifs
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Aperçu : km ajoutés à chaque challenge distance */}
        {km > 0 && distances.length > 0 && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '20px' }}>🏃</span>
            <div>
              {distances.map(c => (
                <div key={c._id} style={{ marginBottom: '4px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#14532d' }}>
                    +{km} km ajoutés à {c.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px' }}>
                    {c.scope === 'individuel'
                      ? `${fmtKm((km / (c.goalKm || 1)) * 100)}% de ton objectif de ${fmtKm(c.goalKm)} km`
                      : `Contribution de ${((km / (c.goalKm || 1)) * 100).toLocaleString('fr-CA', { maximumSignificantDigits: 2 })}% à l'objectif collectif`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || matching.length === 0}
          style={{
            width: '100%', padding: '14px',
            background: loading || matching.length === 0 ? '#f0a050' : '#e67e22',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: loading || matching.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!loading && matching.length) e.target.style.background = '#d4711e' }}
          onMouseLeave={e => { if (!loading && matching.length) e.target.style.background = '#e67e22' }}
        >
          {loading ? 'Soumission...' : isStreak ? 'VALIDER MA JOURNÉE 🔥' : 'SOUMETTRE MA COURSE →'}
        </button>
      </div>
    </div>
  )
}
