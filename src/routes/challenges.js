import express from 'express'
import Challenge from '../models/Challenge.js'
import Run from '../models/Run.js'
import { isAdmin } from '../middleware/auth.js'
import Member from '../models/Member.js'
import { calcStreak, isChallengeOver } from '../streak.js'

// Calcule et fige le classement final d'un challenge terminé
const freezeResults = async (challenge) => {
  const runs = await Run.find({ challenge: challenge._id }).populate('member', 'name')

  let ranking = []

  if (challenge.type === 'streak') {
    const byMember = {}
    runs.forEach(r => {
      const id = r.member?._id?.toString()
      if (!id) return
      if (!byMember[id]) byMember[id] = { name: r.member.name, dates: [] }
      byMember[id].dates.push(r.date)
    })
    ranking = Object.entries(byMember).map(([id, d]) => ({
      memberId: id,
      name: d.name,
      value: calcStreak(d.dates).longest,
    }))
  } else {
    const byMember = {}
    runs.forEach(r => {
      const id = r.member?._id?.toString()
      if (!id) return
      if (!byMember[id]) byMember[id] = { name: r.member.name, value: 0 }
      byMember[id].value += r.km
    })
    ranking = Object.entries(byMember).map(([id, d]) => ({
      memberId: id,
      name: d.name,
      value: Math.round(d.value),
    }))
  }

  ranking.sort((a, b) => b.value - a.value)
  ranking.forEach((r, i) => { r.rank = i + 1 })

  challenge.results = ranking
  challenge.resultsFrozen = true
  await challenge.save()
  return challenge
}

// Ajoute les km de chaque membre aux challenges distance individuels (le meilleur en premier)
const withMemberKm = async (challenges) => {
  const list = challenges.map(c => c.toObject())
  const ids = list.filter(c => c.type === 'distance' && c.scope === 'individuel').map(c => c._id)
  if (!ids.length) return list
  const rows = await Run.aggregate([
    { $match: { challenge: { $in: ids } } },
    { $group: { _id: { challenge: '$challenge', member: '$member' }, km: { $sum: '$km' } } },
    { $sort: { km: -1 } },
    { $lookup: { from: 'members', localField: '_id.member', foreignField: '_id', as: 'member' } },
  ])
  for (const c of list) {
    if (!ids.includes(c._id)) continue
    c.memberKm = rows
      .filter(r => r._id.challenge.equals(c._id) && r.member[0])
      .map(r => ({ memberId: r._id.member.toString(), name: r.member[0].name, km: Math.round(r.km * 10) / 10 }))
  }
  return list
}

const router = express.Router()

// Champs qu'un admin peut définir (results, resultsFrozen et currentKm sont calculés par le serveur)
const FIELDS = ['name', 'description', 'type', 'icon', 'goalKm', 'goalDays', 'scope', 'startDate', 'endDate', 'stages', 'active']
const pick = (body) => Object.fromEntries(FIELDS.filter(f => body?.[f] !== undefined).map(f => [f, body[f]]))

// GET tous les challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 })

    // Figer les challenges terminés qui ne le sont pas encore
    for (const c of challenges) {
      if (!c.resultsFrozen && isChallengeOver(c)) await freezeResults(c)
    }

    // Recharger pour renvoyer les résultats à jour
    const updated = await Challenge.find().sort({ createdAt: -1 })
    res.json(await withMemberKm(updated))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// GET challenge actif
router.get('/active', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ active: true })
      .populate('participants', '-password')
    res.json(challenge && (await withMemberKm([challenge]))[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// GET un challenge par id
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants', '-password')
    if (!challenge) return res.status(404).json({ message: 'Challenge introuvable.' })
    res.json(challenge)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// POST créer un challenge (admin)
router.post('/', isAdmin, async (req, res) => {
  try {
    const challenge = new Challenge(pick(req.body))
    await challenge.save()
    res.status(201).json(challenge)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT modifier un challenge (admin)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    // Le type ne change pas après création (les runs déjà saisis n'auraient plus de sens),
    // et l'activation passe par /activate pour garder un seul challenge actif
    const { type, active, ...updates } = pick(req.body)
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!challenge) return res.status(404).json({ message: 'Challenge introuvable.' })
    res.json(challenge)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT activer un challenge (désactive les autres) (admin)
router.put('/:id/activate', isAdmin, async (req, res) => {
  try {
    await Challenge.updateMany({}, { active: false })
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, { active: true }, { new: true })
    res.json(challenge)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE supprimer un challenge (admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id)
    if (challenge) {
      // Retirer ses runs, et leurs km du total de chaque membre
      const perMember = await Run.aggregate([
        { $match: { challenge: challenge._id } },
        { $group: { _id: '$member', km: { $sum: '$km' } } },
      ])
      await Promise.all(perMember.map(m => Member.findByIdAndUpdate(m._id, { $inc: { totalKm: -m.km } })))
      await Run.deleteMany({ challenge: challenge._id })
    }
    res.json({ message: 'Challenge supprimé.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// GET calcul du streak d'un challenge
router.get('/:id/streak', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
    if (!challenge) return res.status(404).json({ message: 'Challenge introuvable.' })

    if (challenge.scope === 'collectif') {
      // Streak collectif : un jour "compte" si AU MOINS un membre a couru ce jour-là
      const runs = await Run.find({ challenge: challenge._id })
      const streak = calcStreak(runs.map(r => r.date))
      return res.json({ scope: 'collectif', ...streak, goalDays: challenge.goalDays })
    } else {
      // Streak individuel : on calcule pour chaque membre et on renvoie le classement
      const runs = await Run.find({ challenge: challenge._id }).populate('member', 'name')
      const byMember = {}
      runs.forEach(run => {
        const id = run.member?._id?.toString()
        if (!id) return
        if (!byMember[id]) byMember[id] = { name: run.member.name, dates: [] }
        byMember[id].dates.push(run.date)
      })

      const results = Object.entries(byMember).map(([id, data]) => ({
        memberId: id,
        name: data.name,
        ...calcStreak(data.dates),
      })).sort((a, b) => b.current - a.current)

      return res.json({ scope: 'individuel', members: results, goalDays: challenge.goalDays })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// PUT terminer un challenge maintenant (admin)
router.put('/:id/end', isAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { endDate: new Date(), active: false },
      { new: true }
    )
    if (!challenge) return res.status(404).json({ message: 'Challenge introuvable.' })
    await freezeResults(challenge)
    res.json(challenge)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT mettre en pause un challenge (admin)
router.put('/:id/pause', isAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    )
    res.json(challenge)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// GET classement d'un challenge (basé sur ses runs uniquement)
router.get('/:id/ranking', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
    if (!challenge) return res.status(404).json({ message: 'Challenge introuvable.' })

    const runs = await Run.find({ challenge: challenge._id }).populate('member', 'name email')

    let ranking = []

    if (challenge.type === 'streak') {
      const byMember = {}
      runs.forEach(r => {
        const id = r.member?._id?.toString()
        if (!id) return
        if (!byMember[id]) byMember[id] = { name: r.member.name, email: r.member.email, dates: [] }
        byMember[id].dates.push(r.date)
      })
      ranking = Object.entries(byMember).map(([id, d]) => ({
        memberId: id, name: d.name, email: d.email, ...calcStreak(d.dates),
      })).sort((a, b) => b.current - a.current || b.longest - a.longest)
    } else {
      const byMember = {}
      runs.forEach(r => {
        const id = r.member?._id?.toString()
        if (!id) return
        if (!byMember[id]) byMember[id] = { name: r.member.name, email: r.member.email, value: 0 }
        byMember[id].value += r.km
      })
      ranking = Object.entries(byMember).map(([id, d]) => ({
        memberId: id, name: d.name, email: d.email, value: Math.round(d.value),
      })).sort((a, b) => b.value - a.value)
    }

    res.json({ challenge: { name: challenge.name, type: challenge.type, scope: challenge.scope }, ranking })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router