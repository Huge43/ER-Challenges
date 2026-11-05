import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { fmtKm } from '../utils/challenge'
import { Icon, Avatar, Bar, PageTitle, Loading } from '../components/ui'
import { C, shadow } from '../components/theme'

const TABS = [
  { key: 'km', label: 'Kilomètres', icon: 'route' },
  { key: 'streak', label: 'Séries', icon: 'local_fire_department' },
]

export default function Classement() {
  const [members, setMembers] = useState([])
  const [streaks, setStreaks] = useState([])
  const [actives, setActives] = useState([])
  const [scope, setScope] = useState('global') // 'global' ou l'id d'un challenge actif
  const [ranking, setRanking] = useState(null)
  const [tab, setTab] = useState('km')
  const [loading, setLoading] = useState(true)
  const me = JSON.parse(localStorage.getItem('member') || '{}')

  useEffect(() => {
    Promise.all([api.get('/members'), api.get('/members/streaks'), api.get('/challenges/active')])
      .then(([membersRes, streaksRes, activeRes]) => {
        setMembers(membersRes.data)
        setStreaks(streaksRes.data)
        setActives(activeRes.data)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // Classement d'un challenge actif, chargé à la sélection
  useEffect(() => {
    if (scope === 'global') return
    api.get(`/challenges/${scope}/ranking`).then(res => setRanking(res.data)).catch(err => console.error(err))
  }, [scope])

  if (loading) return <Loading />

  // Liste affichée : { id, name, value } triée, et l'unité
  let list, unit
  if (scope === 'global') {
    unit = tab === 'km' ? 'km' : 'jours'
    // Séries : le plus long streak de chacun (le streak en cours retombe à 0 dès qu'un jour manque)
    list = tab === 'km'
      ? members.map(m => ({ id: m._id, name: m.name, value: m.totalKm }))
      : streaks.map(m => ({ id: m._id, name: m.name, value: m.longest }))
  } else {
    const isStreak = ranking?.challenge?.type === 'streak'
    unit = isStreak ? 'jours' : 'km'
    list = (ranking?.ranking || []).map(m => ({ id: m.memberId, name: m.name, value: isStreak ? m.longest : m.value }))
  }
  list = list.filter(m => m.value > 0).sort((a, b) => b.value - a.value)

  const fmt = (v) => unit === 'km' ? fmtKm(v) : v
  const unitLong = unit === 'km' ? 'kilomètres' : 'jours'
  const max = list[0]?.value || 1
  const myPlace = list.findIndex(m => m.id === me.id) + 1
  const label = (m) => m.id === me.id ? `${m.name.split(' ')[0]} · vous` : m.name.split(' ')[0]

  // Podium dans l'ordre visuel : 2e, 1er, 3e
  const podium = [list[1] && { ...list[1], rank: 2 }, list[0] && { ...list[0], rank: 1 }, list[2] && { ...list[2], rank: 3 }]

  return (
    <div>
      <PageTitle eyebrow="Classement" title="Le collectif se dépasse." subtitle="Un peu de défi. Beaucoup de motivation." />

      {/* Kilomètres / Séries (classement général) */}
      {scope === 'global' && (
        <div role="tablist" style={{ display: 'flex', background: '#eceef2', borderRadius: '16px', padding: '5px', marginBottom: '1.1rem' }}>
          {TABS.map(t => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: tab === t.key ? C.card : 'transparent', boxShadow: tab === t.key ? shadow : 'none',
              color: tab === t.key ? C.orange : C.muted, fontSize: '14px', fontWeight: 600,
            }}>
              <Icon name={t.icon} size={20} /> {t.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
          <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Classement à afficher</span>
          <select value={scope} onChange={e => { setRanking(null); setScope(e.target.value) }} style={{
            appearance: 'none', border: 'none', background: 'transparent', fontSize: '15px', fontWeight: 600,
            color: C.text, fontFamily: 'inherit', cursor: 'pointer', paddingRight: '22px',
          }}>
            <option value="global">Classement général</option>
            {actives.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <Icon name="expand_more" size={20} color={C.text} style={{ position: 'absolute', right: 0, pointerEvents: 'none' }} />
        </label>
        <span style={{ fontSize: '12px', color: C.muted }}>{list.length} runner{list.length > 1 ? 's' : ''}</span>
      </div>

      {scope !== 'global' && !ranking ? <Loading /> : list.length === 0 ? (
        <p style={{ fontSize: '14px', color: C.muted, textAlign: 'center', padding: '2rem 0' }}>Aucune activité pour l'instant.</p>
      ) : (
        <>
          {/* Podium */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'end', marginBottom: '1.75rem' }}>
            {podium.map((m, i) => m ? (
              <Link key={m.id} to={`/profil/${m.id}`} style={{ textDecoration: 'none', textAlign: 'center' }}>
                {m.rank === 1 && <Icon name="crown" size={26} color={C.orange} />}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-22px', position: 'relative' }}>
                  <Avatar name={m.name} size={m.rank === 1 ? 62 : 54} ring={m.rank === 1 ? C.orange : '#fff'} />
                </div>
                <div style={{
                  background: m.rank === 1 ? C.navy : C.card, boxShadow: shadow,
                  borderRadius: '16px 16px 0 0', padding: `${m.rank === 1 ? 2 : 1.8}rem 0.4rem ${m.rank === 1 ? 1.4 : 0.9}rem`,
                }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: m.rank === 1 ? '#fff' : C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label(m)}</p>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: m.rank === 1 ? '#fff' : C.text, margin: '2px 0' }}>{fmt(m.value)}</p>
                  <p style={{ fontSize: '11px', color: m.rank === 1 ? 'rgba(255,255,255,0.7)' : C.muted }}>{unitLong}</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: m.rank === 1 ? C.orange : C.faint, marginTop: '6px' }}>{m.rank}</p>
                </div>
              </Link>
            ) : <div key={i} />)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.85rem' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 700, color: C.text }}>Tous les runners</h2>
            {myPlace > 0 && <span style={{ fontSize: '13px', fontWeight: 600, color: C.orange }}>Votre place : {myPlace}{myPlace === 1 ? 'er' : 'e'}</span>}
          </div>

          {list.map((m, i) => {
            const isMe = m.id === me.id
            return (
              <Link key={m.id} to={`/profil/${m.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '10px',
                background: isMe ? C.orangeSoft : C.card, border: `1px solid ${isMe ? '#f6c79c' : C.line}`,
                borderRadius: '16px', padding: '12px 14px',
              }}>
                <span style={{ width: 18, fontSize: '14px', fontWeight: 600, color: isMe ? C.orange : C.muted }}>{i + 1}</span>
                <Avatar name={m.name} size={38} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.name}{isMe && ' · vous'}
                  </span>
                  <Bar pct={(m.value / max) * 100} height={6} />
                </span>
                <span style={{ textAlign: 'right', minWidth: 52 }}>
                  <span style={{ display: 'block', fontSize: '16px', fontWeight: 700, color: C.text }}>{fmt(m.value)}</span>
                  <span style={{ display: 'block', fontSize: '11px', color: C.muted }}>{unit === 'km' ? 'km' : 'j'}</span>
                </span>
              </Link>
            )
          })}
        </>
      )}
    </div>
  )
}
