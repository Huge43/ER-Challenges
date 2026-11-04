import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import useIsMobile from '../hooks/useIsMobile'
import { formatDay, fmtKm } from '../utils/challenge'

const MEDALS = ['🥇', '🥈', '🥉']

// /profil : mon profil ; /profil/:id : le profil d'un autre membre (activités et trophées)
export default function Profil() {
  const [member, setMember] = useState(null)
  const [runs, setRuns] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const currentMember = JSON.parse(localStorage.getItem('member') || '{}')
  const { id } = useParams()
  const memberId = id || currentMember.id
  const isMe = memberId === currentMember.id
  const canEdit = isMe || currentMember.role === 'admin'
  const isMobile = useIsMobile()
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
  ]).then(([membersRes, runsRes, challengesRes]) => {
    setMember(membersRes.data.find(m => m._id === memberId))
    setRuns(runsRes.data)
    setChallenges(challengesRes.data)
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  if (!member) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#ef4444', fontSize: '14px' }}>Profil introuvable</p>
    </div>
  )

  const totalActivities = runs.length
  const totalKm = runs.reduce((sum, r) => sum + r.km, 0)
  const runsWithKm = runs.filter(r => r.km > 0)
  const avgKm = runsWithKm.length ? (totalKm / runsWithKm.length).toFixed(1) : 0
  const longestRun = runs.reduce((max, r) => Math.max(max, r.km), 0)

  // Trophées : podiums des challenges terminés, du plus récent au plus ancien, avec le titre donné par un admin
  const trophies = challenges
    .filter(c => c.resultsFrozen)
    .sort((a, b) => b.endDate.localeCompare(a.endDate))
    .flatMap(c => (c.results || [])
      .filter(r => r.memberId === memberId && r.rank <= 3)
      .map(r => ({ challenge: c, rank: r.rank, value: r.value, title: c.titles?.[r.rank - 1] })))
  const latestTitle = trophies.find(t => t.title)?.title

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 60000)
    if (diff < 60) return `il y a ${diff} min`
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`
    return `il y a ${Math.floor(diff / 1440)}j`
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header profil */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 100%)',
        borderRadius: '20px', padding: isMobile ? '1.75rem' : '2.5rem', marginBottom: '2rem',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center', gap: '1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: '#e67e22', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#fff',
          flexShrink: 0,
        }}>
          {member.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '34px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
            {member.name}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
            {member.email}
          </p>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: '99px',
            background: member.role === 'admin' ? 'rgba(230,126,34,0.2)' : 'rgba(255,255,255,0.12)',
            color: member.role === 'admin' ? '#f59e0b' : 'rgba(255,255,255,0.8)',
            fontSize: '12px', fontWeight: 600,
          }}>
            {member.role === 'admin' ? '★ Administrateur' : 'Membre'}
          </span>
          {latestTitle && (
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '99px', marginLeft: '8px',
              background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '12px', fontWeight: 600,
            }}>
              🏅 {latestTitle}
            </span>
          )}
          {member.suspended && (
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '99px', marginLeft: '8px',
              background: 'rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '12px', fontWeight: 600,
            }}>
              Compte suspendu
            </span>
          )}
        </div>
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
        }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Km totaux', value: fmtKm(member.totalKm), color: '#1e3a8a' },
          { label: 'Activités', value: totalActivities, color: '#e67e22' },
          { label: 'Moyenne / activité', value: `${fmtKm(avgKm)} km`, color: '#16a34a' },
          { label: 'Plus longue', value: `${fmtKm(longestRun)} km`, color: '#9333ea' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '14px',
            border: '1px solid #e8edf5', padding: '1.25rem 1.5rem',
            borderTop: `3px solid ${card.color}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
              {card.label}
            </p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1 }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Trophées */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8edf5', padding: '1.5rem', marginBottom: '2rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a', marginBottom: '1rem' }}>
          Trophées
        </p>
        {trophies.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#64748b' }}>Pas encore de podium. Le prochain challenge est le bon !</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {trophies.map(t => (
              <div key={t.challenge._id} style={{
                background: t.rank === 1 ? '#fffbeb' : '#f8f9fb', borderRadius: '12px', padding: '1rem',
                border: `1px solid ${t.rank === 1 ? '#fde68a' : '#eef1f6'}`,
              }}>
                <div style={{ fontSize: '26px', marginBottom: '6px' }}>{MEDALS[t.rank - 1]}</div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e2a4a' }}>{t.challenge.name}</p>
                {t.title && <p style={{ fontSize: '13px', fontWeight: 700, color: '#e67e22', marginTop: '2px' }}>« {t.title} »</p>}
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {t.rank === 1 ? '1er' : `${t.rank}e`} · {t.challenge.type === 'streak' ? `${t.value} jours` : `${fmtKm(t.value)} km`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique des activités */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8edf5', overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a' }}>
            Historique des activités
          </p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {totalActivities} activité{totalActivities > 1 ? 's' : ''} enregistrée{totalActivities > 1 ? 's' : ''}
          </p>
        </div>

        {runs.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏃</div>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Aucune activité enregistrée pour l'instant.</p>
          </div>
        ) : (
          <div>
            {runs.map((run, i) => {
              const isValidation = run.km === 0
              return (
                <div key={run._id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '1rem 1.5rem',
                  borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: isValidation ? '#fff7ed' : '#eff6ff',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                  }}>
                    {isValidation ? '🔥' : '🏃'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e2a4a' }}>
                      {run.note || (isValidation ? 'Journée validée' : 'Activité')}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {run.challenges?.map(c => c.name).join(', ') || 'Challenge'} · {formatDay(run.date, { day: 'numeric', month: 'long', year: 'numeric' })} · {timeAgo(run.date)}
                    </p>
                  </div>
                  <span style={{
                    padding: '6px 14px', borderRadius: '8px',
                    background: isValidation ? '#fff7ed' : '#dcfce7',
                    color: isValidation ? '#e67e22' : '#14532d',
                    fontSize: '14px', fontWeight: 700,
                  }}>
                    {isValidation ? '✓ Validée' : `${fmtKm(run.km)} km`}
                  </span>
                  {canEdit && !isValidation && (
                    <button onClick={() => handleEditRun(run)} aria-label="Modifier la distance" title="Modifier la distance" style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px',
                    }}>✏️</button>
                  )}
                  {canEdit && (
                    <button onClick={() => handleDeleteRun(run)} aria-label="Supprimer l'activité" title="Supprimer l'activité" style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px',
                    }}>🗑️</button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Changer le mot de passe : seulement sur son propre profil */}
      {isMe && <form onSubmit={handlePassword} style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8edf5', padding: '1.5rem', marginTop: '2rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 600, color: '#1e2a4a', marginBottom: '1.25rem' }}>
          Changer le mot de passe
        </p>

        {pwError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#991b1b', marginBottom: '1.25rem' }}>
            {pwError}
          </div>
        )}
        {pwSuccess && (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#14532d', marginBottom: '1.25rem' }}>
            {pwSuccess}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { key: 'current', label: 'Mot de passe actuel', autoComplete: 'current-password' },
            { key: 'next', label: 'Nouveau (8 caractères min.)', autoComplete: 'new-password' },
            { key: 'confirm', label: 'Confirmer le nouveau', autoComplete: 'new-password' },
          ].map(field => (
            <label key={field.key} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
              {field.label}
              <input
                type="password" required autoComplete={field.autoComplete}
                value={pwForm[field.key]}
                onChange={e => setPwForm({ ...pwForm, [field.key]: e.target.value })}
                style={{
                  display: 'block', width: '100%', marginTop: '8px', padding: '13px 14px',
                  border: '1px solid #e2e8f0', borderRadius: '10px',
                  fontSize: '14px', color: '#1e2a4a', background: '#f8fafc',
                }}
              />
            </label>
          ))}
        </div>

        <button type="submit" disabled={pwLoading} style={{
          padding: '12px 24px', background: pwLoading ? '#f0a050' : '#e67e22',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: pwLoading ? 'not-allowed' : 'pointer',
        }}>
          {pwLoading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>}
    </div>
  )
}