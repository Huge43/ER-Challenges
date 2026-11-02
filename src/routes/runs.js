import express from 'express'
import mongoose from 'mongoose'
import Run from '../models/Run.js'
import Member from '../models/Member.js'
import Challenge from '../models/Challenge.js'
import { isChallengeOver } from '../streak.js'

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
    if (!challenge || !challenge.active || isChallengeOver(challenge)) return res.status(400).json({ message: "Ce challenge n'est pas actif." })
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

    // Mettre à jour le total km du challenge et y inscrire le membre
    await Challenge.findByIdAndUpdate(challenge._id, { $inc: { currentKm: km }, $addToSet: { participants: req.member._id } })

    res.status(201).json(run)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// Charge un run modifiable : le sien (ou n'importe lequel pour un admin), dans un challenge pas terminé
const loadEditableRun = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Run introuvable.' })
  const run = await Run.findById(req.params.id)
  if (!run) return res.status(404).json({ message: 'Run introuvable.' })
  if (!run.member.equals(req.member._id) && req.member.role !== 'admin') {
    return res.status(403).json({ message: 'Ce run ne vous appartient pas.' })
  }
  const challenge = await Challenge.findById(run.challenge)
  if (challenge && isChallengeOver(challenge)) {
    return res.status(400).json({ message: 'Ce challenge est terminé, ses runs sont figés.' })
  }
  return { run, challenge }
}

// PUT corriger un run (km, note)
router.put('/:id', async (req, res) => {
  try {
    const loaded = await loadEditableRun(req, res)
    if (!loaded) return
    const { run, challenge } = loaded

    const km = Number(req.body?.km ?? run.km)
    if (!Number.isFinite(km) || km < 0 || km > MAX_KM) return res.status(400).json({ message: 'Distance invalide.' })
    if (challenge?.type !== 'streak' && km <= 0) return res.status(400).json({ message: 'Distance invalide.' })

    const delta = km - run.km
    run.km = km
    if (typeof req.body?.note === 'string') run.note = req.body.note.slice(0, 500)
    await run.save()

    await Member.findByIdAndUpdate(run.member, { $inc: { totalKm: delta } })
    await Challenge.findByIdAndUpdate(run.challenge, { $inc: { currentKm: delta } })
    res.json(run)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// DELETE supprimer un run
router.delete('/:id', async (req, res) => {
  try {
    const loaded = await loadEditableRun(req, res)
    if (!loaded) return
    const { run } = loaded

    await run.deleteOne()
    await Member.findByIdAndUpdate(run.member, { $inc: { totalKm: -run.km } })
    const stillIn = await Run.exists({ challenge: run.challenge, member: run.member })
    await Challenge.findByIdAndUpdate(run.challenge, {
      $inc: { currentKm: -run.km },
      ...(stillIn ? {} : { $pull: { participants: run.member } }),
    })
    res.json({ message: 'Run supprimé.' })
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