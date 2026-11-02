import express from 'express'
import mongoose from 'mongoose'
import Member from '../models/Member.js'
import Challenge from '../models/Challenge.js'
import Run from '../models/Run.js'

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
    const daysLeft = challenge
      ? Math.max(0, Math.ceil((new Date(challenge.endDate) - now) / (1000 * 60 * 60 * 24)))
      : 0

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
      recentRuns,
      stages: challenge ? challenge.stages : [],
    })
  } catch (err) {
    console.error('Erreur dashboard :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router