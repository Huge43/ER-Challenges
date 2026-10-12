import express from 'express'
import mongoose from 'mongoose'
import Run from '../models/Run.js'
import Member from '../models/Member.js'
import Challenge from '../models/Challenge.js'

const router = express.Router()

// Distance maximale acceptée pour un seul run ; à ajuster si le club fait de l'ultra
const MAX_KM = 300

// GET tous les runs récents
router.get('/', async (req, res) => {
  try {
    const runs = await Run.find()
      .populate('member', 'name avatar')
      .populate('challenge', 'name')
      .sort({ date: -1 })
      .limit(10)
    res.json(runs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// POST ajouter un run + mettre à jour les km
router.post('/', async (req, res) => {
  try {
    const { challenge: challengeId, note, date } = req.body ?? {}
    const km = Number(req.body?.km ?? 0)
    const when = date ? new Date(date) : new Date()

    if (!Number.isFinite(km) || km < 0 || km > MAX_KM) return res.status(400).json({ message: 'Distance invalide.' })
    // 24 h de marge pour les fuseaux horaires
    if (isNaN(when) || when > Date.now() + 86400000) return res.status(400).json({ message: 'Date invalide.' })
    if (typeof challengeId !== 'string' || !mongoose.isValidObjectId(challengeId)) {
      return res.status(400).json({ message: 'Challenge invalide.' })
    }

    const challenge = await Challenge.findById(challengeId)
    if (!challenge || !challenge.active) return res.status(400).json({ message: "Ce challenge n'est pas actif." })
    if (challenge.type !== 'streak' && km <= 0) return res.status(400).json({ message: 'Distance invalide.' })

    // Le membre vient du token, jamais du body
    const run = await Run.create({
      member: req.member._id,
      challenge: challenge._id,
      km,
      note: typeof note === 'string' ? note.slice(0, 500) : '',
      date: when,
    })

    // Mettre à jour le total km du membre
    await Member.findByIdAndUpdate(req.member._id, { $inc: { totalKm: km } })

    // Mettre à jour le total km du challenge
    await Challenge.findByIdAndUpdate(challenge._id, { $inc: { currentKm: km } })

    res.status(201).json(run)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// GET runs d'un membre spécifique
router.get('/member/:id', async (req, res) => {
  try {
    const runs = await Run.find({ member: req.params.id })
      .populate('challenge', 'name')
      .sort({ date: -1 })
    res.json(runs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router