import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { getDashboard } from '../api/index.js'
import { getProgress, stageInfo, daysLeft, fmtKm, formatDay } from '../utils/challenge'
import { Icon, Card, Avatar, Bar, Medal, SectionTitle, Loading } from '../components/ui'
import { C } from '../components/theme'

const link = { fontSize: '13px', fontWeight: 600, color: C.orange, textDecoration: 'none' }

// Période courte : « 1–31 octobre » ou « 26 oct. – 5 nov. »
const period = (c) => {
  const [s, e] = [new Date(c.startDate), new Date(c.endDate)]
  return s.getUTCMonth() === e.getUTCMonth()
    ? `${s.getUTCDate()}–${formatDay(c.endDate, { day: 'numeric', month: 'long' })}`
    : `${formatDay(c.startDate, { day: 'numeric', month: 'short' })} – ${formatDay(c.endDate, { day: 'numeric', month: 'short' })}`
}

// Jalons trop proches les uns des autres sur la barre : on n'en garde qu'un (moins de 4 % d'écart)
const spaced = (stages, goal) => stages.filter((s, i, all) => i === 0 || (s.km - all[i - 1].km) / goal >= 0.04)

const leftText = (c) => {
  const n = daysLeft(c)
  return n > 1 ? `${n} jours pour aller plus loin` : 'Dernier jour pour aller plus loin'
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [actives, setActives] = useState([])
  const [streaks, setStreaks] = useState({})
  const [loading, setLoading] = useState(true)
  const me = JSON.parse(localStorage.getItem('member') || '{}')

  useEffect(() => {
    Promise.all([getDashboard(), api.get('/challenges/active')])
      .then(([dashRes, activeRes]) => {
        setData(dashRes.data)
        setActives(activeRes.data)
        activeRes.data.filter(c => c.type === 'streak').forEach(c => {
          api.get(`/challenges/${c._id}/streak`)
            .then(res => setStreaks(prev => ({ ...prev, [c._id]: res.data })))
            .catch(err => console.error(err))
        })
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  if (!data) return <p style={{ color: '#991b1b', textAlign: 'center', marginTop: '3rem' }}>Erreur de chargement.</p>

  // Le premier challenge actif est mis en avant, les autres sont listés dessous
  const [hero, ...others] = actives
  const heroProgress = hero && getProgress(hero, streaks, me.id)
  const heroStages = hero && hero.type !== 'streak' && hero.goalKm ? stageInfo(hero.stages, heroProgress.value) : null
  const streakTop = hero?.type === 'streak' && hero.scope === 'individuel' ? streaks[hero._id]?.members?.slice(0, 3) : null
  const top = streakTop
    ? streakTop.map(m => ({ id: m.memberId, name: m.name, value: `${m.current} j` }))
    : (data.topContributors?.[hero?._id] || []).map(m => ({ id: m._id, name: m.name, value: `${fmtKm(m.km)} km` }))
  const firstName = me.name?.split(' ')[0] || ''

  return (
    <div>
      <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.muted }}>
        Bonjour {firstName} 👋
      </p>
      <h1 style={{ fontSize: '30px', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '6px 0 8px' }}>On court ensemble.</h1>
      <p style={{ fontSize: '14px', color: C.muted }}>Chaque kilomètre fait avancer le collectif.</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.1rem 0 1.25rem' }}>
        <p style={{ fontSize: '14px', color: C.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
          {data.activeMembers} membre{data.activeMembers > 1 ? 's' : ''} actif{data.activeMembers > 1 ? 's' : ''} cette semaine
        </p>
        <div style={{ display: 'flex' }}>
          {top.slice(0, 3).map((m, i) => (
            <span key={m.id} style={{ marginLeft: i ? '-10px' : 0, borderRadius: '50%', border: `2px solid ${C.bg}` }}>
              <Avatar name={m.name} size={32} />
            </span>
          ))}
        </div>
      </div>

      {/* Challenge mis en avant */}
      {hero ? (
        <Link to="/challenges" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            background: `linear-gradient(125deg, ${C.navy} 0%, ${C.navy2} 70%, #34497a 100%)`,
            borderRadius: '22px', padding: '1.25rem 1.25rem 1.1rem', color: '#fff', position: 'relative', overflow: 'hidden',
          }}>
            <Icon name={hero.type === 'streak' ? 'local_fire_department' : 'directions_run'} size={170} color="rgba(255,255,255,0.06)"
              style={{ position: 'absolute', right: '-20px', top: '-10px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <span style={{ background: 'rgba(255,255,255,0.14)', borderRadius: '99px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em' }}>
                {hero.type === 'streak' ? 'SÉRIE EN COURS' : hero.scope === 'collectif' ? 'DÉFI COLLECTIF' : 'DÉFI EN COURS'}
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{period(hero)}</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', margin: '1rem 0 0.9rem', position: 'relative' }}>{hero.name}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', position: 'relative' }}>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>{heroProgress.label}</span>
              <span style={{ fontSize: '26px', fontWeight: 700 }}>{hero.type === 'streak' ? heroProgress.big : `${fmtKm(heroProgress.pct)} %`}</span>
            </div>

            {/* Barre, avec les étapes en jalons */}
            <div style={{ position: 'relative' }}>
              <Bar pct={heroProgress.pct} track="rgba(255,255,255,0.18)" height={6} />
              {spaced(heroStages?.list || [], hero.goalKm).map(s => (
                <span key={`${s.name}-${s.km}`} title={`${s.name} — ${fmtKm(s.km)} km`} style={{
                  position: 'absolute', top: '-3px', left: `${Math.min(100, (s.km / hero.goalKm) * 100)}%`, transform: 'translateX(-50%)',
                  width: 12, height: 12, borderRadius: '50%', border: '2px solid #fff',
                  background: s.reached ? C.orange : C.navy,
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', position: 'relative' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                {heroStages?.next
                  ? `Prochaine étape : ${heroStages.next.name}, encore ${fmtKm(heroStages.remaining)} km`
                  : leftText(hero)}
              </span>
              <Icon name="north_east" size={20} color="#fff" />
            </div>
          </div>
        </Link>
      ) : (
        <Card style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <Icon name="flag" size={36} color={C.orange} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: C.text, margin: '8px 0 4px' }}>Aucun défi en cours</p>
          <p style={{ fontSize: '13px', color: C.muted }}>Un admin doit activer un challenge pour qu'il apparaisse ici.</p>
        </Card>
      )}

      {/* Top 3 du challenge mis en avant */}
      {hero && (
        <>
          <SectionTitle title="Ils donnent le rythme" action={<Link to="/classement" style={link}>Voir tout</Link>} />
          {top.length === 0 ? (
            <p style={{ fontSize: '14px', color: C.muted }}>Aucune sortie pour l'instant. Lancez le mouvement !</p>
          ) : top.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
              <Medal rank={i + 1} />
              <Avatar name={m.name} size={42} />
              <Link to={`/profil/${m.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                <span style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: C.text }}>{m.name}</span>
                {m.id === me.id && <span style={{ display: 'block', fontSize: '12px', color: C.muted }}>Vous</span>}
              </Link>
              <span style={{ fontSize: '15px', fontWeight: 700, color: C.text }}>{m.value}</span>
            </div>
          ))}
        </>
      )}

      {/* Autres challenges en cours, avec ma progression */}
      {others.length > 0 && (
        <>
          <SectionTitle title="Vos défis" action={<Link to="/challenges" style={link}>{actives.length} en cours</Link>} />
          {others.map(c => {
            const p = getProgress(c, streaks, me.id)
            return (
              <Link key={c._id} to="/challenges" style={{ textDecoration: 'none', display: 'block', marginBottom: '12px' }}>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <span style={{ width: 46, height: 46, borderRadius: '14px', background: C.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={c.type === 'streak' ? 'local_fire_department' : 'flag'} color={C.orange} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: C.text }}>{c.name}</span>
                      <span style={{ display: 'block', fontSize: '12px', color: C.muted }}>{p.label}</span>
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{c.type === 'streak' ? p.big : `${fmtKm(p.pct)} %`}</span>
                  </div>
                  <Bar pct={p.pct} />
                </Card>
              </Link>
            )
          })}
        </>
      )}
    </div>
  )
}
