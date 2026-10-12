const DAY = 86400000

// Date du jour (YYYY-MM-DD) dans le fuseau du club, indépendamment du fuseau du serveur
const clubToday = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: process.env.CLUB_TZ || 'America/Toronto',
  year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())

// Calcule le streak actuel et le plus long streak de jours consécutifs à partir d'une liste de dates
export const calcStreak = (dates, today = clubToday()) => {
  if (!dates.length) return { current: 0, longest: 0 }

  // Normaliser les dates en "YYYY-MM-DD" et dédupliquer
  const days = [...new Set(dates.map(d => new Date(d).toISOString().split('T')[0]))].sort()

  let longest = 1, running = 1
  for (let i = 1; i < days.length; i++) {
    const diff = Math.round((new Date(days[i]) - new Date(days[i - 1])) / DAY)
    running = diff === 1 ? running + 1 : 1
    longest = Math.max(longest, running)
  }

  // Le streak actuel n'est valide que si on a couru aujourd'hui ou hier
  const sinceLast = Math.round((new Date(today) - new Date(days[days.length - 1])) / DAY)
  return { current: sinceLast <= 1 ? running : 0, longest }
}
