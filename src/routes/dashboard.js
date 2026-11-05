import express from 'express'
import mongoose from 'mongoose'
import Member from '../models/Member.js'
import Challenge from '../models/Challenge.js'
import Run from '../models/Run.js'
import { isChallengeOver, dayOf, clubToday } from '../streak.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const active = (await Challenge.find({ active: true })).filter(c => !isChallengeOver(c))
    const totalMembers = await Member.countDocuments()
    const now = new Date()

    // Top 3 des km saisis dans chaque challenge actif, par id de challenge
    const topContributors = {}
    for (const c of active) {
      topContributors[c._id] = await Run.aggregate([
        { $match: { challenges: c._id } },
        { $group: { _id: '$member', km: { $sum: '$km' } } },
        { $sort: { km: -1 } },
        { $limit: 3 },
        { $lookup: { from: 'members', localField: '_id', foreignField: '_id', as: 'member' } },
        { $unwind: '$member' },
        { $project: { name: '$member.name', km: { $round: ['$km', 1] } } },
      ])
    }

    // Actif = au moins un run dans les 7 derniers jours (trusted : sanitizeFilter bloquerait $gte)
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const activeMembers = (await Run.distinct('member', { date: mongoose.trusted({ $gte: weekAgo }) })).length

    res.json({ activeMembers, totalMembers, topContributors })
  } catch (err) {
    console.error('Erreur dashboard :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router