import express from 'express'
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

    const activeMembers = members.filter(m => m.totalKm > 0).length

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
    res.status(500).json({ message: err.message })
  }
})

export default router