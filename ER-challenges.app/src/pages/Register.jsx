import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { AuthFrame, PageTitle, Label, Field, EyeToggle, PrimaryButton, ErrorBox, Notice } from '../components/ui'
import { C } from '../components/theme'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('member', JSON.stringify(res.data.member))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame>
      <PageTitle
        eyebrow="Rejoignez le collectif"
        title="Le départ, c'est ici."
        subtitle="Créez votre compte et relevez des défis running, à votre rythme et ensemble."
      />

      {error && <ErrorBox>{error}</ErrorBox>}

      <form onSubmit={handleSubmit}>
        <Label htmlFor="reg-name">Nom complet</Label>
        <Field id="reg-name" icon="person" autoComplete="name" required maxLength={100} placeholder="Votre prénom et nom"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

        <Label htmlFor="reg-email">Adresse e-mail</Label>
        <Field id="reg-email" icon="mail" type="email" autoComplete="email" required placeholder="vous@exemple.fr"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

        <Label htmlFor="reg-password">Mot de passe</Label>
        <Field id="reg-password" icon="lock" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
          required minLength={8} maxLength={72} placeholder="Créer un mot de passe" aria-describedby="reg-password-hint"
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          right={<EyeToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />} />
        <p id="reg-password-hint" style={{ fontSize: '12px', color: C.muted, margin: '-0.6rem 0 1.5rem' }}>
          8 caractères minimum.
        </p>

        <PrimaryButton type="submit" disabled={loading} icon="arrow_forward">
          {loading ? 'Création...' : 'Créer mon compte'}
        </PrimaryButton>
      </form>

      <p style={{ textAlign: 'center', fontSize: '14px', color: C.muted, margin: '1.5rem 0 2rem' }}>
        Déjà dans le collectif ?{' '}
        <Link to="/login" style={{ color: C.orange, fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
      </p>

      <Notice>Pas besoin d'être le plus rapide.<br />Chaque kilomètre compte.</Notice>
    </AuthFrame>
  )
}
