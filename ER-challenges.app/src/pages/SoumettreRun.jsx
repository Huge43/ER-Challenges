import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { containsDay, formatDay, today, fmtKm } from '../utils/challenge'
import { Icon, Card, Avatar, PageTitle, Label, Notice, ErrorBox, PrimaryButton, Loading } from '../components/ui'
import { C } from '../components/theme'

const quote = (list) => list.map(c => `« ${c.name} »`).join(' et ')

export default function SoumettreRun() {
  const [form, setForm] = useState({ km: '', note: '', date: today() })
  const [actives, setActives] = useState([])
  const [monthKm, setMonthKm] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loadingChallenge, setLoadingChallenge] = useState(true)
  const navigate = useNavigate()
  const member = JSON.parse(localStorage.getItem('member') || '{}')

  useEffect(() => {
    Promise.all([api.get('/challenges/active'), api.get(`/runs/member/${member.id}`)])
      .then(([activeRes, runsRes]) => {
        setActives(activeRes.data)
        const month = today().slice(0, 7)
        setMonthKm(runsRes.data.filter(r => r.date.slice(0, 7) === month).reduce((s, r) => s + r.km, 0))
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingChallenge(false))
  }, [member.id])

  // Le run comptera pour tous les challenges actifs dont la période contient la date choisie
  const matching = actives.filter(c => containsDay(c, form.date))
  const hasStreak = matching.some(c => c.type === 'streak')
  const distances = matching.filter(c => c.type !== 'streak')
  const isStreak = hasStreak && distances.length === 0
  const km = Number(String(form.km).replace(',', '.') || 0)

  // Bornes du sélecteur : la période couverte par les challenges actifs, sans dépasser aujourd'hui
  const minDate = actives.map(c => c.startDate.slice(0, 10)).sort()[0]
  const maxEnd = actives.map(c => c.endDate.slice(0, 10)).sort().at(-1)
  const maxDate = maxEnd && maxEnd < today() ? maxEnd : today()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (matching.length === 0) {
      setError(`Aucun challenge actif ne couvre le ${formatDay(form.date, { day: 'numeric', month: 'long' })}.`)
      return
    }
    // Sans streak à valider, une distance est obligatoire
    if (!hasStreak && !(km > 0)) {
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

  if (success) return (
    <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <span style={{ width: 88, height: 88, borderRadius: '50%', background: C.orangeSoft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={isStreak ? 'local_fire_department' : 'celebration'} size={44} color={C.orange} />
      </span>
      <h2 style={{ fontSize: '26px', fontWeight: 700, color: C.text, margin: '1.25rem 0 6px' }}>
        {isStreak ? 'Journée validée !' : 'Sortie enregistrée !'}
      </h2>
      <p style={{ fontSize: '14px', color: C.muted }}>
        {isStreak ? 'Votre série continue.' : 'Vos kilomètres font avancer le collectif.'}
      </p>
    </div>
  )

  if (loadingChallenge) return <Loading />

  if (actives.length === 0) return (
    <>
      <PageTitle eyebrow="Votre activité" title="Une sortie de plus." />
      <Card style={{ textAlign: 'center', padding: '2.5rem 1.25rem' }}>
        <Icon name="pause_circle" size={40} color={C.orange} />
        <p style={{ fontSize: '16px', fontWeight: 600, color: C.text, margin: '10px 0 6px' }}>Aucun défi en cours</p>
        <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.5 }}>
          Revenez quand un défi sera lancé pour enregistrer vos sorties.
        </p>
      </Card>
    </>
  )

  return (
    <form onSubmit={handleSubmit}>
      <PageTitle
        eyebrow="Votre activité"
        title={isStreak ? 'Une journée de plus.' : 'Une sortie de plus.'}
        subtitle={isStreak ? 'Validez votre journée pour garder votre série.' : 'Bravo ! Ajoutez vos kilomètres au collectif.'}
      />

      {/* Carte membre */}
      <div style={{
        background: C.navy, borderRadius: '20px', padding: '1rem 1.1rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <Avatar name={member.name} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>{member.name}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{fmtKm(monthKm)} km ce mois-ci</p>
        </div>
        <span style={{ background: 'rgba(255,255,255,0.14)', color: '#fff', borderRadius: '99px', padding: '4px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em' }}>
          {member.role === 'admin' ? 'ADMIN' : 'MEMBRE'}
        </span>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* Distance : masquée si seuls des streaks sont concernés */}
      {!isStreak && (
        <>
          <Label htmlFor="run-km" hint={hasStreak ? 'Facultatif pour valider votre série' : undefined}>Distance parcourue</Label>
          <label htmlFor="run-km" style={{
            display: 'block', background: C.card, border: `1.5px solid ${C.orange}`, borderRadius: '18px',
            padding: '1rem 1.25rem', marginBottom: '1.5rem', cursor: 'text',
          }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <input id="run-km" inputMode="decimal" placeholder="0" value={form.km}
                onChange={e => setForm({ ...form, km: e.target.value.replace(/[^\d.,]/g, '') })}
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: '48px', fontWeight: 700, color: C.text, fontFamily: 'inherit' }} />
              <span style={{ fontSize: '20px', color: C.muted }}>km</span>
            </span>
            <span style={{ display: 'block', fontSize: '12px', color: C.muted, marginTop: '4px' }}>Chaque kilomètre compte.</span>
          </label>
        </>
      )}

      <Label htmlFor="run-date">{isStreak ? 'Date de l\'activité' : 'Date de la sortie'}</Label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', background: C.card, border: `1px solid ${C.line}`,
        borderRadius: '14px', padding: '0 14px', marginBottom: '1.5rem',
      }}>
        <input id="run-date" type="date" value={form.date} min={minDate} max={maxDate}
          onChange={e => setForm({ ...form, date: e.target.value })}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '16px 0', fontSize: '15px', color: C.text, fontFamily: 'inherit' }} />
      </div>

      <Label htmlFor="run-note" hint="Facultatif">Un mot sur votre sortie</Label>
      <textarea id="run-note" rows={3} maxLength={500}
        placeholder={isStreak ? 'Ex : 10 pages lues, chapitre 3 terminé…' : 'Une boucle au bord du fleuve, de bonnes sensations…'}
        value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
        style={{
          width: '100%', background: C.card, border: `1px solid ${C.line}`, borderRadius: '14px', padding: '14px',
          fontSize: '15px', color: C.text, fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.5, marginBottom: '1.25rem',
        }} />

      {/* Où comptera la sortie */}
      {matching.length === 0 ? (
        <Notice icon="event_busy" style={{ marginBottom: '1.25rem', background: '#fee2e2' }}>
          Aucun défi actif ne couvre cette date. Périodes ouvertes : {actives.map(c =>
            `${c.name} (${formatDay(c.startDate, { day: 'numeric', month: 'short' })} → ${formatDay(c.endDate, { day: 'numeric', month: 'short' })})`).join(', ')}.
        </Notice>
      ) : (
        <Notice icon={isStreak ? 'local_fire_department' : 'flag'} style={{ marginBottom: '1.25rem' }}>
          {distances.length > 0 && <>Vos {km > 0 ? `${fmtKm(km)} km` : 'kilomètres'} rejoindront le défi {quote(distances)}.</>}
          {distances.length > 0 && hasStreak && <br />}
          {hasStreak && <>Cette sortie valide votre journée pour {quote(matching.filter(c => c.type === 'streak'))}.</>}
        </Notice>
      )}

      <PrimaryButton type="submit" disabled={loading || matching.length === 0}>
        <Icon name="add" size={22} />
        {loading ? 'Enregistrement...' : isStreak ? 'Valider ma journée' : 'Enregistrer ma sortie'}
      </PrimaryButton>
    </form>
  )
}
