import crypto from 'node:crypto'
import express from 'express'
import bcrypt from 'bcryptjs'
import Member, { memberInputError } from '../models/Member.js'
import Run from '../models/Run.js'
import Challenge from '../models/Challenge.js'
import { isAdmin } from '../middleware/auth.js'
import { calcStreak } from '../streak.js'
import { recomputeChallenges } from '../challengeRuns.js'

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

// POST générer un lien de réinitialisation du mot de passe (admin), valable 24 h
router.post('/:id/reset-link', isAdmin, async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('base64url')
    const member = await Member.findByIdAndUpdate(req.params.id, {
      resetTokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      resetTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    if (!member) return res.status(404).json({ message: 'Membre introuvable.' })
    res.json({ token })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT suspendre ou réactiver un compte (admin) : ses données restent, il ne peut plus se connecter
router.put('/:id/suspend', isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.member.id) return res.status(400).json({ message: 'Vous ne pouvez pas suspendre votre propre compte.' })
    if (typeof req.body?.suspended !== 'boolean') return res.status(400).json({ message: 'Requête invalide.' })
    const member = await Member.findByIdAndUpdate(req.params.id, { suspended: req.body.suspended }, { new: true }).select('-password')
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
    const member = await Member.findByIdAndDelete(req.params.id)
    if (member) {
      // Retirer ses runs, puis recalculer les challenges où il avait couru
      const challengeIds = await Run.distinct('challenges', { member: member._id })
      await Run.deleteMany({ member: member._id })
      await recomputeChallenges(challengeIds)
    }
    res.json({ message: 'Membre supprimé.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// GET classement des streaks de tous les membres
router.get('/streaks', async (req, res) => {
  try {
    const members = await Member.find().select('-password')
    const runs = await Run.find()

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
    }).sort((a, b) => b.longest - a.longest || b.current - a.current)

    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router