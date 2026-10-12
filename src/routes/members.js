import express from 'express'
import bcrypt from 'bcryptjs'
import Member, { memberInputError } from '../models/Member.js'
import { isAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET tous les membres triés par km
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ totalKm: -1 }).select('-password')
    res.json(members)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// POST créer un membre (admin)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body ?? {}
    const invalid = memberInputError({ name, email, password })
    if (invalid) return res.status(400).json({ message: invalid })
    const exists = await Member.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Cet email est déjà utilisé.' })
    const hashed = await bcrypt.hash(password, 10)
    const member = await Member.create({ name, email, password: hashed, role: role || 'member' })
    res.status(201).json({ ...member._doc, password: undefined })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT modifier le rôle (admin)
router.put('/:id/role', isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.member.id) return res.status(400).json({ message: 'Vous ne pouvez pas modifier votre propre rôle.' })
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { role: req.body?.role },
      { new: true, runValidators: true }
    ).select('-password')
    if (!member) return res.status(404).json({ message: 'Membre introuvable.' })
    res.json(member)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE retirer un membre (admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.member.id) return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' })
    await Member.findByIdAndDelete(req.params.id)
    res.json({ message: 'Membre supprimé.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// GET classement des streaks de tous les membres
router.get('/streaks', async (req, res) => {
  try {
    const Run = (await import('../models/Run.js')).default
    const members = await Member.find().select('-password')
    const runs = await Run.find()

    const calcStreak = (dates) => {
      if (!dates.length) return { current: 0, longest: 0 }
      const uniqueDays = [...new Set(dates.map(d => new Date(d).toISOString().split('T')[0]))].sort()

      let longest = 1
      let running = 1

      for (let i = 1; i < uniqueDays.length; i++) {
        const prev = new Date(uniqueDays[i - 1])
        const curr = new Date(uniqueDays[i])
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) running++
        else running = 1
        longest = Math.max(longest, running)
      }

      const lastDay = new Date(uniqueDays[uniqueDays.length - 1])
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      lastDay.setHours(0, 0, 0, 0)
      const daysSinceLastRun = Math.round((today - lastDay) / (1000 * 60 * 60 * 24))
      const current = daysSinceLastRun <= 1 ? running : 0

      return { current, longest }
    }

    const results = members.map(m => {
      const memberRuns = runs.filter(r => r.member?.toString() === m._id.toString())
      const streak = calcStreak(memberRuns.map(r => r.date))
      return {
        _id: m._id,
        name: m.name,
        email: m.email,
        totalKm: m.totalKm,
        ...streak,
      }
    }).sort((a, b) => b.current - a.current || b.longest - a.longest)

    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router