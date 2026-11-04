// Statut et progression d'un challenge, partagés entre le Dashboard et la page Challenges

// Les dates sans heure sont stockées à minuit UTC : leur partie date est le jour choisi
const day = (d) => String(d).slice(0, 10)
export const today = () => new Date().toLocaleDateString('en-CA')

// La période du challenge (premier et dernier jour inclus) contient-elle ce jour (YYYY-MM-DD) ?
// Miroir de periodContains côté API (src/streak.js)
export const containsDay = (c, d) => day(c.startDate) <= d && d <= day(c.endDate)

// Jours restants, aujourd'hui compris : un challenge qui finit aujourd'hui a encore 1 jour
export const daysLeft = (c) => Math.max(0, Math.round((Date.parse(day(c.endDate)) - Date.parse(today())) / 86400000) + 1)

// Étapes triées par km, marquées atteintes selon la valeur affichée, et la prochaine à viser
export const stageInfo = (stages = [], value = 0) => {
  const list = [...stages].sort((a, b) => a.km - b.km).map(s => ({ ...s, reached: value >= s.km }))
  const next = list.find(s => !s.reached)
  return { list, next, remaining: next ? Math.round((next.km - value) * 10) / 10 : 0 }
}

// Km arrondis au dixième, à la française : 143,1 — 40 075
export const fmtKm = (n) => (Math.round((Number(n) || 0) * 10) / 10).toLocaleString('fr-CA')

// Affiche une date sans heure telle qu'elle a été saisie, quel que soit le fuseau du navigateur
export const formatDay = (d, options) => new Date(d).toLocaleDateString('fr-CA', { ...options, timeZone: 'UTC' })

export const getStatus = (c) => {
  if (c.resultsFrozen || day(c.endDate) < today()) return { label: 'Terminé', color: '#f1f5f9', text: '#64748b' }
  if (day(c.startDate) > today()) return { label: 'À venir', color: '#e0e7ff', text: '#3730a3' }
  if (c.active) return { label: 'Actif', color: '#dcfce7', text: '#14532d' }
  return { label: 'En pause', color: '#fef3c7', text: '#92400e' }
}

// Pourcentage entier, avec une décimale sous 1 % pour qu'un début de progression ne s'affiche pas 0
const percent = (value, goal) => {
  if (!goal) return 0
  const p = Math.min(100, (value / goal) * 100)
  return p < 1 ? Math.round(p * 10) / 10 : Math.round(p)
}

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
    return { pct, value: shown.km, label: `${fmtKm(shown.km)} / ${fmtKm(c.goalKm)} km (${who}) · ${finishers} à l'objectif`, big: `${pct}%` }
  }

  const km = c.currentKm || 0
  const pct = percent(km, c.goalKm)
  return { pct, value: km, label: `${fmtKm(km)} / ${fmtKm(c.goalKm)} km`, big: `${pct}%` }
}
