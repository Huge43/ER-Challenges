import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/index.js'
import useIsMobile from '../hooks/useIsMobile'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const handleSubmit = async () => {
    setError('')
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('http://192.168.2.37:5000/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('member', JSON.stringify(res.data.member))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '13px 14px',
    border: '1px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', color: '#1e2a4a',
    background: '#f8fafc', outline: 'none',
  }

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#1e2a4a', marginBottom: '8px',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f0f2f5',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  width: '100%',
  maxWidth: isMobile ? '440px' : '900px',
  background: '#fff', borderRadius: '20px', overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}}>

        {/* Colonne gauche */}
       {!isMobile && (
  <div style={{
    width: '420px', flexShrink: 0,
    background: 'linear-gradient(160deg, #0f1f3d 0%, #1e3a5f 60%, #2d5016 100%)',
    padding: '3rem 2.5rem',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    position: 'relative', overflow: 'hidden',
  }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontFamily: 'Poppins, serif', fontSize: '15px', fontWeight: 600,
              color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3rem',
            }}>
              Elite Runners
            </p>
            <p style={{
              fontFamily: 'Poppins, serif', fontSize: '42px',
              fontStyle: 'italic', fontWeight: 500, color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem',
            }}>
              Rejoignez l'élite.
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Créez votre compte et commencez à contribuer au Tour du monde avec votre communauté.
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '3px', background: '#e67e22', borderRadius: '99px' }} />
              <p style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
              }}>
                Performance Peak
              </p>
            </div>
          </div>
          <div style={{
            position: 'absolute', right: '-60px', top: '40%',
            width: '200px', height: '200px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
          }} />
        </div>
        )}

        {/* Colonne droite */}
        <div style={{
          flex: 1, padding: '3rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <h1 style={{
            fontFamily: 'Poppins, serif', fontSize: '36px',
            fontWeight: 600, color: '#1e2a4a', marginBottom: '8px',
          }}>
            Créer un compte
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '2rem' }}>
            Rejoignez Elite Runners et contribuez au challenge.
          </p>

          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '12px 16px',
              fontSize: '13px', color: '#991b1b', marginBottom: '1.25rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Nom complet</label>
            <input
              type="text" placeholder="Marie Leclair"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#e67e22'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email" placeholder="nom@elite.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#e67e22'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#e67e22'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Confirmer le mot de passe</label>
            <input
              type="password" placeholder="••••••••"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#e67e22'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

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
            {loading ? 'Création...' : 'CRÉER MON COMPTE →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '1.5rem' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#e67e22', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}