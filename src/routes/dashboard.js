import express from 'express'
import mongoose from 'mongoose'
import Member from '../models/Member.js'
import Challenge from '../models/Challenge.js'
import Run from '../models/Run.js'
import { clubToday } from '../streak.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ active: true })
    const members = await Member.find().sort({ totalKm: -1 }).select('-password')
    const recentRuns = await Run.find()
      .populate('member', 'name')
      .sort({ date: -1 })
      .limit(5)

    const now = new Date()
    // Le dernier jour compte : un challenge qui finit aujourd'hui a encore 1 jour
    const daysLeft = challenge
      ? Math.max(0, Math.round((new Date(challenge.endDate.toISOString().slice(0, 10)) - new Date(clubToday())) / 86400000) + 1)
      : 0

    // Top 3 des km saisis dans le challenge actif
    const topContributors = challenge ? await Run.aggregate([
      { $match: { challenge: challenge._id } },
      { $group: { _id: '$member', km: { $sum: '$km' } } },
      { $sort: { km: -1 } },
      { $limit: 3 },
      { $lookup: { from: 'members', localField: '_id', foreignField: '_id', as: 'member' } },
      { $unwind: '$member' },
      { $project: { name: '$member.name', km: { $round: ['$km', 1] } } },
    ]) : []

    // Actif = au moins un run dans les 7 derniers jours (trusted : sanitizeFilter bloquerait $gte)
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const activeMembers = (await Run.distinct('member', { date: mongoose.trusted({ $gte: weekAgo }) })).length

    res.json({
      totalKm: challenge ? challenge.currentKm : 0,
      goalKm: challenge ? challenge.goalKm : 40075,
      challengeName: challenge ? challenge.name : '',
      startDate: challenge ? challenge.startDate : null,
      endDate: challenge ? challenge.endDate : null,
      daysLeft,
      activeMembers,
      totalMembers: members.length,
      members,
      topContributors,
      recentRuns,
      stages: challenge ? challenge.stages : [],
    })
  } catch (err) {
    console.error('Erreur dashboard :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router