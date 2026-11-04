import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { formatDay, fmtKm, today } from '../utils/challenge'
import { Icon, Card, Avatar, PageTitle, SectionTitle, Label, Field, PrimaryButton, ErrorBox, Notice, Loading } from '../components/ui'
import { C } from '../components/theme'

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const pill = (bg, color) => ({ display: 'inline-block', padding: '4px 10px', borderRadius: '99px', background: bg, color, fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em' })
const capitalize = (s) => s[0].toUpperCase() + s.slice(1)
const ordinal = (n) => n === 1 ? '1er' : `${n}e`
const trophyIcon = (c) => c.type === 'streak' ? 'local_fire_department' : c.scope === 'collectif' ? 'workspace_premium' : 'emoji_events'

// /profil : mon profil ; /profil/:id : le profil public d'un autre membre (chiffres, trophées, activités)
export default function Profil() {
  const [member, setMember] = useState(null)
  const [members, setMembers] = useState([])
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [runs, setRuns] = useState([])
  const [challenges, setChallenges] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')
  const { id } = useParams()
  const memberId = id || currentMember.id
  const isMe = memberId === currentMember.id
  const canEdit = isMe || currentMember.role === 'admin'
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const handlePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.next.length < 8) { setPwError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return }
    setPwLoading(true)
    try {
      const res = await api.put('/auth/password', { currentPassword: pwForm.current, newPassword: pwForm.next })
      // Les autres sessions sont déconnectées, celle-ci garde la main avec le nouveau jeton
      localStorage.setItem('token', res.data.token)
      setPwSuccess('Mot de passe mis à jour.')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwError(err.response?.data?.message || 'Erreur.')
    } finally {
      setPwLoading(false)
    }
  }

  const load = () => Promise.all([
    api.get('/members'),
    api.get(`/runs/member/${memberId}`),
    api.get('/challenges'),
    api.get('/members/streaks'),
  ]).then(([membersRes, runsRes, challengesRes, streaksRes]) => {
    setMembers(membersRes.data)
    setMember(membersRes.data.find(m => m._id === memberId))
    setRuns(runsRes.data)
    setChallenges(challengesRes.data)
    setStreak(streaksRes.data.find(s => s._id === memberId) || { current: 0, longest: 0 })
  }).catch(err => console.error(err))
    .finally(() => setLoading(false))

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [memberId])

  const handleEditRun = async (run) => {
    const input = window.prompt('Nouvelle distance (km) :', run.km)
    if (input === null) return
    try {
      await api.put(`/runs/${run._id}`, { km: Number(input.replace(',', '.')) })
      load()
    } catch (err) {
      window.alert(err.response?.data?.message || 'Erreur.')
    }
  }

  const handleDeleteRun = async (run) => {
    if (!window.confirm('Supprimer cette activité ?')) return
    try {
      await api.delete(`/runs/${run._id}`)
      load()
    } catch (err) {
      window.alert(err.response?.data?.message || 'Erreur.')
    }
  }

  if (loading) return <Loading />
  if (!member) return <p style={{ color: '#991b1b', textAlign: 'center', marginTop: '3rem' }}>Profil introuvable.</p>

  // Chiffres du mois en cours, comparés au mois précédent
  const month = today().slice(0, 7)
  const monthName = MONTHS[Number(month.slice(5, 7)) - 1]
  const prev = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 2, 1)).toISOString().slice(0, 7)
  const inMonth = (m) => runs.filter(r => r.date.slice(0, 7) === m)
  const monthRuns = inMonth(month)
  const monthKm = monthRuns.reduce((s, r) => s + r.km, 0)
  const prevKm = inMonth(prev).reduce((s, r) => s + r.km, 0)
  const trend = prevKm > 0 ? Math.round(((monthKm - prevKm) / prevKm) * 100) : null
  const withKm = runs.filter(r => r.km > 0)
  const avgKm = withKm.length ? withKm.reduce((s, r) => s + r.km, 0) / withKm.length : 0
  const monthWithKm = monthRuns.filter(r => r.km > 0)
  const monthAvg = monthWithKm.length ? monthKm / monthWithKm.length : 0
  const rank = [...members].sort((a, b) => b.totalKm - a.totalKm).findIndex(m => m._id === memberId) + 1
  const since = new Date(member.createdAt)

  // Trophées : podiums des challenges terminés, du plus récent au plus ancien, avec le titre donné par un admin
  const trophies = challenges
    .filter(c => c.resultsFrozen)
    .sort((a, b) => b.endDate.localeCompare(a.endDate))
    .flatMap(c => (c.results || [])
      .filter(r => r.memberId === memberId && r.rank <= 3)
      .map(r => ({ challenge: c, rank: r.rank, value: r.value, title: c.titles?.[r.rank - 1] })))
  const latestTitle = trophies.find(t => t.title)?.title

  const stats = [
    { label: 'Distance totale', icon: 'route', value: `${fmtKm(monthKm)} km`, sub: trend === null ? `Total : ${fmtKm(member.totalKm)} km` : `${trend >= 0 ? '+' : ''}${trend} % vs ${MONTHS[Number(prev.slice(5, 7)) - 1]}` },
    { label: 'Sorties', icon: 'footprint', value: monthRuns.length, sub: 'Ce mois-ci' },
    { label: 'Série actuelle', icon: 'local_fire_department', value: `${streak.current} jour${streak.current > 1 ? 's' : ''}`, sub: `Record : ${streak.longest} jour${streak.longest > 1 ? 's' : ''}` },
    { label: 'Distance moyenne', icon: 'monitoring', value: `${fmtKm(avgKm)} km`, sub: 'Par sortie' },
  ]
  const shownRuns = showAll ? runs : runs.slice(0, isMe ? 5 : 4)

  return (
    <div>
      {isMe ? (
        <PageTitle title="Votre profil" subtitle="Votre rythme, vos progrès." />
      ) : (
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '14px', background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, marginBottom: '1.1rem', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500, color: C.text,
        }}>
          <span style={{ width: 44, height: 44, borderRadius: '14px', background: C.card, boxShadow: '0 2px 10px rgba(22,34,63,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow_back" color={C.text} />
          </span>
          Retour
        </button>
      )}

      {/* Carte d'identité */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navy2} 100%)`, borderRadius: '22px', padding: '1.25rem', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar name={member.name} size={72} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '21px', fontWeight: 700 }}>{member.name}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              <span style={pill('rgba(255,255,255,0.14)', '#fff')}>{member.role === 'admin' ? 'ADMINISTRATEUR' : 'MEMBRE ELITE'}</span>
              {isMe && latestTitle && <span style={pill('rgba(232,130,42,0.25)', '#ffc58f')}>🏅 {latestTitle}</span>}
              {member.suspended && <span style={pill('rgba(239,68,68,0.25)', '#fca5a5')}>COMPTE SUSPENDU</span>}
            </div>
          </div>
        </div>
        {/* Profil public : le dernier titre obtenu tient lieu de devise */}
        {!isMe && latestTitle && (
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginTop: '1rem' }}>🏅 « {latestTitle} »</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.1rem', fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
          <span>Depuis {isMe ? MONTHS[since.getMonth()] : formatDay(member.createdAt, { month: 'short' })} {since.getFullYear()}</span>
          {rank > 0 && member.totalKm > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffc58f', fontWeight: 600 }}>
              <Icon name="trophy" size={16} color={C.orange} /> {ordinal(rank)} au classement
            </span>
          )}
        </div>
      </div>

      <SectionTitle
        title={`${capitalize(monthName)} en chiffres`}
        action={!isMe && <span style={{ fontSize: '12px', color: C.muted }}>{month.slice(0, 4)}</span>}
      />
      {isMe ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {stats.map(s => (
            <Card key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: C.muted }}>{s.label}</span>
                <Icon name={s.icon} size={20} color={C.orange} />
              </div>
              <p style={{ fontSize: '26px', fontWeight: 700, color: C.text, margin: '6px 0 2px' }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: C.muted }}>{s.sub}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '1.1rem 0.5rem' }}>
          {[
            { value: fmtKm(monthKm), label: 'km parcourus' },
            { value: monthRuns.length, label: 'sorties' },
            { value: fmtKm(monthAvg), label: 'km / sortie' },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', borderLeft: i ? `1px solid ${C.line}` : 'none' }}>
              <p style={{ fontSize: '24px', fontWeight: 700, color: C.text }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{s.label}</p>
            </div>
          ))}
        </Card>
      )}

      {(trophies.length > 0 || !isMe) && (
        <>
          <SectionTitle
            title={isMe ? 'Vos trophées' : 'Ses trophées'}
            action={<span style={{ fontSize: '12px', color: C.muted }}>{trophies.length} obtenu{trophies.length > 1 ? 's' : ''}</span>}
          />
          <p style={{ fontSize: '13px', color: C.muted, margin: '-0.35rem 0 0.85rem' }}>Des défis relevés, des efforts récompensés.</p>
          {trophies.length === 0 && <p style={{ fontSize: '14px', color: C.muted }}>Pas encore de podium.</p>}
          {trophies.map(t => (
            <Card key={t.challenge._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
              <span style={{ width: 52, height: 52, borderRadius: '14px', background: C.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={trophyIcon(t.challenge)} size={26} color={C.orange} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: C.text }}>{t.title || t.challenge.name}</p>
                <p style={{ fontSize: '12px', color: C.muted }}>
                  {t.title ? `${t.challenge.name} · ` : ''}{ordinal(t.rank)} · {t.challenge.type === 'streak' ? `${t.value} jours` : `${fmtKm(t.value)} km`}
                </p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: C.orange, marginTop: '2px' }}>
                  Obtenu le {formatDay(t.challenge.endDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </Card>
          ))}
        </>
      )}

      <SectionTitle
        title={isMe ? 'Vos dernières sorties' : 'Ses activités'}
        action={isMe && runs.length > 5 && (
          <button onClick={() => setShowAll(!showAll)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: C.orange, fontFamily: 'inherit' }}>
            {showAll ? 'Voir moins' : `Voir les ${runs.length}`}
          </button>
        )}
      />
      {runs.length === 0 ? (
        <p style={{ fontSize: '14px', color: C.muted }}>Aucune sortie enregistrée pour l'instant.</p>
      ) : shownRuns.map(run => {
        const isValidation = run.km === 0
        return (
          <Card key={run._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ width: 44, height: 44, borderRadius: '12px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={isValidation ? 'local_fire_department' : 'footprint'} color={isValidation ? C.orange : C.navy} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {run.note || (isValidation ? 'Journée validée' : 'Sortie')}
              </p>
              <p style={{ fontSize: '11px', color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {formatDay(run.date, { day: 'numeric', month: 'short', year: isMe ? undefined : 'numeric' })} · {run.challenges?.map(c => c.name).join(', ')}
              </p>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>
              {isValidation ? '✓' : `${fmtKm(run.km)} km`}
            </span>
            {canEdit && !isValidation && (
              <button onClick={() => handleEditRun(run)} aria-label="Modifier la distance" title="Modifier la distance" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                <Icon name="edit" size={19} color={C.muted} />
              </button>
            )}
            {canEdit && (
              <button onClick={() => handleDeleteRun(run)} aria-label="Supprimer l'activité" title="Supprimer l'activité" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                <Icon name="delete" size={19} color={C.muted} />
              </button>
            )}
          </Card>
        )
      })}
      {/* Profil public : bouton plein en bas de liste, comme sur la maquette */}
      {!isMe && runs.length > 4 && (
        <button onClick={() => setShowAll(!showAll)} style={{
          width: '100%', padding: '14px', marginTop: '4px', borderRadius: '14px', background: C.card,
          border: `1px solid ${C.line}`, color: C.orange, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {showAll ? 'Voir moins' : `Voir les ${runs.length} sorties`}
        </button>
      )}

      {/* Changer le mot de passe : seulement sur son propre profil */}
      {isMe && (
        <form onSubmit={handlePassword}>
          <SectionTitle title="Changer le mot de passe" />
          {pwError && <ErrorBox>{pwError}</ErrorBox>}
          {pwSuccess && <Notice icon="check_circle" style={{ marginBottom: '1rem' }}>{pwSuccess}</Notice>}
          {[
            { key: 'current', label: 'Mot de passe actuel', autoComplete: 'current-password' },
            { key: 'next', label: 'Nouveau mot de passe', autoComplete: 'new-password' },
            { key: 'confirm', label: 'Confirmer le nouveau', autoComplete: 'new-password' },
          ].map(f => (
            <div key={f.key}>
              <Label htmlFor={`pw-${f.key}`}>{f.label}</Label>
              <Field id={`pw-${f.key}`} icon="lock" type="password" required autoComplete={f.autoComplete}
                value={pwForm[f.key]} onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })} />
            </div>
          ))}
          <PrimaryButton type="submit" disabled={pwLoading}>{pwLoading ? 'Mise à jour...' : 'Mettre à jour'}</PrimaryButton>
        </form>
      )}
    </div>
  )
}
