import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { Icon, AuthFrame, PageTitle, Label, Field, EyeToggle, PrimaryButton, ErrorBox, Notice } from '../components/ui'
import { C } from '../components/theme'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgot, setForgot] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
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
    <AuthFrame>
      <PageTitle
        eyebrow="Heureux de vous revoir"
        title="On reprend le rythme ?"
        subtitle="Connectez-vous pour retrouver vos défis et faire avancer le collectif."
      />

      {/* Bandeau d'ambiance */}
      <div style={{
        background: `linear-gradient(120deg, ${C.navy} 0%, ${C.navy2} 60%, #3a4f7d 100%)`,
        borderRadius: '20px', padding: '2.25rem 1.5rem 1.5rem', marginBottom: '1.75rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <Icon name="directions_run" size={150} color="rgba(255,255,255,0.07)" style={{ position: 'absolute', right: '-12px', bottom: '-28px' }} />
        <p style={{ fontSize: '26px', fontWeight: 700, color: '#fff', lineHeight: 1.2, position: 'relative' }}>
          Se dépasser.<br />Ensemble.
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '6px', position: 'relative' }}>
          Chaque kilomètre fait la différence.
        </p>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      <form onSubmit={handleSubmit}>
        <Label htmlFor="login-email">Adresse e-mail</Label>
        <Field id="login-email" icon="mail" type="email" autoComplete="email" required placeholder="vous@exemple.fr"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

        <Label htmlFor="login-password">Mot de passe</Label>
        <Field id="login-password" icon="lock" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
          placeholder="Votre mot de passe" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          right={<EyeToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />} />

        <div style={{ textAlign: 'right', margin: '-0.4rem 0 1.25rem' }}>
          <button type="button" onClick={() => setForgot(!forgot)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: '13px', fontWeight: 600, color: C.orange, fontFamily: 'inherit',
          }}>
            Mot de passe oublié ?
          </button>
        </div>
        {forgot && (
          <Notice icon="key" style={{ marginBottom: '1.25rem' }}>
            Demandez à un admin du club de vous envoyer un lien de réinitialisation, valable 24 h.
          </Notice>
        )}

        <PrimaryButton type="submit" disabled={loading} icon="arrow_forward">
          {loading ? 'Connexion...' : 'Me connecter'}
        </PrimaryButton>
      </form>

      <p style={{ textAlign: 'center', fontSize: '14px', color: C.muted, marginTop: '1.5rem' }}>
        Pas encore de compte ?{' '}
        <Link to="/register" style={{ color: C.orange, fontWeight: 600, textDecoration: 'none' }}>S'inscrire</Link>
      </p>
      <p style={{ textAlign: 'center', fontSize: '12px', color: C.faint, marginTop: '2rem', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="verified_user" size={16} /> Vos données restent confidentielles.
      </p>
    </AuthFrame>
  )
}
