// Lien entre runs et challenges : un run compte pour tous les challenges actifs dont la période contient sa date
import mongoose from 'mongoose'
import Run from './models/Run.js'
import Challenge from './models/Challenge.js'
import { isChallengeOver, periodContains, dayOf } from './streak.js'

const DAY = 86400000

// Opérateurs dans un filtre : à marquer trusted, sinon sanitizeFilter les neutralise
export const anyOf = (ids) => mongoose.trusted({ $in: ids })

// Un run à 0 km (validation de streak) ne compte que pour les streaks
const accepts = (c, km) => c.type === 'streak' || km > 0

// Challenges actifs, pas terminés, dont la période contient ce jour (YYYY-MM-DD)
export const openChallengesOn = async (day) =>
  (await Challenge.find({ active: true })).filter(c => !isChallengeOver(c) && periodContains(c, day))

export const challengesForRun = (open, km) => open.filter(c => accepts(c, km))

// Recalcule km cumulés et participants à partir des runs : aucun compteur ne peut dériver
export const recomputeChallenges = async (ids) => {
  for (const id of ids) {
    const [stats] = await Run.aggregate([
      { $match: { challenges: new mongoose.Types.ObjectId(String(id)) } },
      { $group: { _id: null, km: { $sum: '$km' }, members: { $addToSet: '$member' } } },
    ])
    await Challenge.findByIdAndUpdate(id, { currentKm: stats?.km || 0, participants: stats?.members || [] })
  }
}

// Rattache à un challenge actif les runs de sa période, détache ceux qui n'en font plus partie
export const syncChallengeRuns = async (c) => {
  if (!c.active || isChallengeOver(c)) return
  const start = new Date(dayOf(c.startDate))
  const end = new Date(new Date(dayOf(c.endDate)).getTime() + DAY)
  const inPeriod = {
    date: mongoose.trusted({ $gte: start, $lt: end }),
    ...(c.type === 'streak' ? {} : { km: mongoose.trusted({ $gt: 0 }) }),
  }
  await Run.updateMany(inPeriod, { $addToSet: { challenges: c._id } })
  await Run.updateMany({ challenges: c._id, $nor: [inPeriod] }, { $pull: { challenges: c._id } })
  await recomputeChallenges([c._id])
}
