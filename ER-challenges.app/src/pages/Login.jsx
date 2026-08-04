import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/index.js'
import useIsMobile from '../hooks/useIsMobile'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('http://192.168.2.37:5000/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('member', JSON.stringify(res.data.member))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  width: '100%',
  maxWidth: isMobile ? '440px' : '900px',
  background: '#fff',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}}>

        {/* Colonne gauche — image */}
        {!isMobile && (
  <div style={{
    width: '420px',
    flexShrink: 0,
    background: 'linear-gradient(160deg, #0f1f3d 0%, #1e3a5f 60%, #2d5016 100%)',
    padding: '3rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  }}>
          {/* Overlay texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 60%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontFamily: 'Poppins, serif',
              fontSize: '15px',
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '3rem',
            }}>
              Elite Runners
            </p>
            <p style={{
              fontFamily: 'Poppins, serif',
              fontSize: '42px',
              fontStyle: 'italic',
              fontWeight: 500,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
            }}>
              Dominez la piste.
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Accédez à vos données de performance et repoussez vos limites avec votre communauté.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '3px', background: '#e67e22', borderRadius: '99px' }} />
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Performance Peak
              </p>
            </div>
          </div>

          {/* Cercles décoratifs */}
          <div style={{
            position: 'absolute', right: '-60px', top: '40%',
            width: '200px', height: '200px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', right: '-30px', top: '35%',
            width: '120px', height: '120px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
          }} />
        </div>
        )}

        {/* Colonne droite — formulaire */}
        <div style={{
          flex: 1,
          padding: '3.5rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <h1 style={{
            fontFamily: 'Poppins, serif',
            fontSize: '38px',
            fontWeight: 600,
            color: '#1e2a4a',
            marginBottom: '8px',
          }}>
            Bon retour, Athlète
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '2.5rem' }}>
            Entrez vos identifiants pour continuer votre préparation.
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

          {/* Email */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#1e2a4a', marginBottom: '8px',
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '15px', color: '#94a3b8',
              }}>✉</span>
              <input
                type="email"
                placeholder="nom@elite.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  border: '1px solid #e2e8f0', borderRadius: '10px',
                  fontSize: '14px', color: '#1e2a4a',
                  background: '#f8fafc', outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#e67e22'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1e2a4a',
              }}>
                Mot de passe
              </label>
              <a href="#" style={{ fontSize: '13px', color: '#e67e22', textDecoration: 'none' }}>
                Mot de passe oublié ?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '15px', color: '#94a3b8',
              }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', padding: '13px 42px 13px 42px',
                  border: '1px solid #e2e8f0', borderRadius: '10px',
                  fontSize: '14px', color: '#1e2a4a',
                  background: '#f8fafc', outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#e67e22'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '16px', color: '#94a3b8',
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Rester connecté */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#e67e22', cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
              Rester connecté
            </label>
          </div>

          {/* Bouton */}
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
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#d4711e' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#e67e22' }}
          >
            {loading ? 'Connexion...' : 'SE CONNECTER →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '1.5rem' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#e67e22', fontWeight: 600, textDecoration: 'none' }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}