// Statut et progression d'un challenge, partagés entre le Dashboard et la page Challenges

// Les dates sans heure sont stockées à minuit UTC : leur partie date est le jour choisi
const day = (d) => String(d).slice(0, 10)
const today = () => new Date().toLocaleDateString('en-CA')

// Affiche une date sans heure telle qu'elle a été saisie, quel que soit le fuseau du navigateur
export const formatDay = (d, options) => new Date(d).toLocaleDateString('fr-CA', { ...options, timeZone: 'UTC' })

export const getStatus = (c) => {
  if (c.resultsFrozen || day(c.endDate) < today()) return { label: 'Terminé', color: '#f1f5f9', text: '#64748b' }
  if (day(c.startDate) > today()) return { label: 'À venir', color: '#e0e7ff', text: '#3730a3' }
  if (c.active) return { label: 'Actif', color: '#dcfce7', text: '#14532d' }
  return { label: 'En pause', color: '#fef3c7', text: '#92400e' }
}

const percent = (value, goal) => goal ? Math.min(100, ((value / goal) * 100).toFixed(1)) : 0

// En individuel : la progression du membre connecté, sinon celle du meilleur
export const getProgress = (c, streaks, memberId) => {
  if (!c) return { pct: 0, label: '', big: '' }

  if (c.type === 'streak') {
    const s = streaks[c._id]
    if (!s) return { pct: 0, label: 'Calcul du streak...', big: '...' }
    if (c.scope === 'collectif') {
      return { pct: percent(s.current, c.goalDays), label: `${s.current} / ${c.goalDays} jours consécutifs (groupe)`, big: `${s.current}j 🔥` }
    }
    const mine = s.members?.find(m => m.memberId === memberId)
    const shown = mine || s.members?.[0] || { current: 0 }
    const who = mine ? 'mon streak' : `meilleur : ${shown.name || '—'}`
    return { pct: percent(shown.current, c.goalDays), label: `${shown.current} / ${c.goalDays} jours (${who})`, big: `${shown.current}j 🔥` }
  }

  if (c.scope === 'individuel') {
    const mine = c.memberKm?.find(m => m.memberId === memberId)
    const shown = mine || c.memberKm?.[0] || { km: 0 }
    const who = mine ? 'mes km' : `meilleur : ${shown.name || '—'}`
    const finishers = c.memberKm?.filter(m => m.km >= c.goalKm).length || 0
    const pct = percent(shown.km, c.goalKm)
    return { pct, label: `${shown.km} / ${c.goalKm} km (${who}) · ${finishers} à l'objectif`, big: `${pct}%` }
  }

  const pct = percent(c.currentKm, c.goalKm)
  return { pct, label: `${c.currentKm?.toLocaleString()} / ${c.goalKm?.toLocaleString()} km`, big: `${pct}%` }
}
