import express from 'express'
import mongoose from 'mongoose'
import Run from '../models/Run.js'
import Member from '../models/Member.js'
import Challenge from '../models/Challenge.js'
import { clubToday, isChallengeOver } from '../streak.js'
import { anyOf, openChallengesOn, challengesForRun, recomputeChallenges } from '../challengeRuns.js'

const router = express.Router()

// Distance maximale acceptée pour un seul run ; à ajuster si le club fait de l'ultra
const MAX_KM = 300

// « 5 novembre » : une date sans heure telle qu'elle a été saisie
const formatDay = (day) => new Date(day).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', timeZone: 'UTC' })

// GET tous les runs récents
router.get('/', async (req, res) => {
  try {
    const runs = await Run.find()
      .populate('member', 'name avatar')
      .populate('challenges', 'name')
      .sort({ date: -1 })
      .limit(10)
    res.json(runs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// POST ajouter un run : il compte pour tous les challenges actifs dont la période contient sa date
router.post('/', async (req, res) => {
  try {
    const { note, date } = req.body ?? {}
    const km = Number(req.body?.km ?? 0)
    if (!Number.isFinite(km) || km < 0 || km > MAX_KM) return res.status(400).json({ message: 'Distance invalide.' })

    // Jour du run (YYYY-MM-DD) ; par défaut aujourd'hui dans le fuseau du club
    const day = date === undefined ? clubToday() : String(date).slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || isNaN(new Date(day))) return res.status(400).json({ message: 'Date invalide.' })
    if (day > clubToday()) return res.status(400).json({ message: 'La date ne peut pas être dans le futur.' })

    const open = await openChallengesOn(day)
    if (!open.length) {
      const active = (await Challenge.find({ active: true })).filter(c => !isChallengeOver(c))
      if (!active.length) return res.status(400).json({ message: 'Aucun challenge actif pour le moment.' })
      const periods = active.map(c => `${c.name} : du ${formatDay(c.startDate)} au ${formatDay(c.endDate)}`).join(' ; ')
      return res.status(400).json({ message: `Aucun challenge actif ne couvre le ${formatDay(day)}. Périodes ouvertes — ${periods}.` })
    }
    const targets = challengesForRun(open, km)
    if (!targets.length) return res.status(400).json({ message: 'Indique une distance : les challenges de cette date comptent des kilomètres.' })

    // Le membre vient du token, jamais du body
    const run = await Run.create({
      member: req.member._id,
      challenges: targets.map(c => c._id),
      km,
      note: typeof note === 'string' ? note.slice(0, 500) : '',
      date: new Date(day),
    })

    // Une seule fois par run, quel que soit le nombre de challenges
    await Member.findByIdAndUpdate(req.member._id, { $inc: { totalKm: km } })
    await recomputeChallenges(run.challenges)

    res.status(201).json(run)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// Charge un run modifiable : le sien (ou n'importe lequel pour un admin), dont aucun challenge n'est terminé
const loadEditableRun = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Run introuvable.' })
  const run = await Run.findById(req.params.id)
  if (!run) return res.status(404).json({ message: 'Run introuvable.' })
  if (!run.member.equals(req.member._id) && req.member.role !== 'admin') {
    return res.status(403).json({ message: 'Ce run ne vous appartient pas.' })
  }
  const challenges = await Challenge.find({ _id: anyOf(run.challenges) })
  if (challenges.some(c => isChallengeOver(c))) {
    return res.status(400).json({ message: 'Un challenge de ce run est terminé : le run est figé.' })
  }
  return { run, challenges }
}

// PUT corriger un run (km, note)
router.put('/:id', async (req, res) => {
  try {
    const loaded = await loadEditableRun(req, res)
    if (!loaded) return
    const { run, challenges } = loaded

    const km = Number(req.body?.km ?? run.km)
    if (!Number.isFinite(km) || km < 0 || km > MAX_KM) return res.status(400).json({ message: 'Distance invalide.' })
    if (km <= 0 && challenges.some(c => c.type !== 'streak')) return res.status(400).json({ message: 'Distance invalide.' })

    const delta = km - run.km
    run.km = km
    if (typeof req.body?.note === 'string') run.note = req.body.note.slice(0, 500)
    await run.save()

    await Member.findByIdAndUpdate(run.member, { $inc: { totalKm: delta } })
    await recomputeChallenges(run.challenges)
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
    await recomputeChallenges(run.challenges)
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
      .populate('challenges', 'name')
      .sort({ date: -1 })
    res.json(runs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router
