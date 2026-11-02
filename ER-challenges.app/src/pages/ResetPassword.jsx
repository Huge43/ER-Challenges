import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'

const inputStyle = {
  width: '100%', padding: '13px 14px', border: '1px solid #e2e8f0', borderRadius: '10px',
  fontSize: '14px', color: '#1e2a4a', background: '#f8fafc', outline: 'none', marginBottom: '1rem',
}
const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#1e2a4a', marginBottom: '8px',
}

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return setError('Les deux mots de passe ne correspondent pas.')
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px',
        padding: '2.5rem 2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      }}>
        <h1 style={{ fontFamily: 'Poppins, serif', fontSize: '28px', fontWeight: 600, color: '#1e2a4a', marginBottom: '8px' }}>
          Nouveau mot de passe
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.75rem' }}>
          Choisissez un mot de passe d'au moins 8 caractères.
        </p>

        {error && (
          <div role="alert" style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#991b1b', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {done ? (
          <div role="status" style={{ background: '#dcfce7', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#14532d' }}>
            Mot de passe réinitialisé. Redirection vers la connexion…
          </div>
        ) : (
          <>
            <label htmlFor="new-password" style={labelStyle}>Nouveau mot de passe</label>
            <input id="new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
              value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />

            <label htmlFor="confirm-password" style={labelStyle}>Confirmation</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
              value={confirm} onChange={e => setConfirm(e.target.value)} style={inputStyle} />

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', marginTop: '0.5rem', background: loading ? '#f0a050' : '#e67e22',
              color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Enregistrement...' : 'Réinitialiser'}
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: '#e67e22', fontWeight: 600, textDecoration: 'none' }}>Retour à la connexion</Link>
        </p>
      </form>
    </div>
  )
}
