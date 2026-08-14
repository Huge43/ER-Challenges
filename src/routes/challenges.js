import express from 'express'
import jwt from 'jsonwebtoken'
import Challenge from '../models/Challenge.js'
import Member from '../models/Member.js'

// Calcule et fige le classement final d'un challenge terminé
const freezeResults = async (challenge) => {
  const Run = (await import('../models/Run.js')).default
  const runs = await Run.find({ challenge: challenge._id }).populate('member', 'name')

  let ranking = []

  if (challenge.type === 'streak') {
      const calcStreak = (dates) => {
        if (!dates.length) return { current: 0, longest: 0 }
        const days = [...new Set(dates.map(d => new Date(d).toISOString().split('T')[0]))].sort()
        let longest = 1, running = 1
        for (let i = 1; i < days.length; i++) {
          const diff = Math.round((new Date(days[i]) - new Date(days[i - 1])) / 86400000)
          running = diff === 1 ? running + 1 : 1
          longest = Math.max(longest, running)
        }
        const lastDay = new Date(days[days.length - 1])
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        lastDay.setHours(0, 0, 0, 0)
        const current = Math.round((today - lastDay) / 86400000) <= 1 ? running : 0
        return { current, longest }
      }

      if (challenge.scope === 'collectif') {
        // Streak du groupe : un jour compte si au moins un membre a été actif
        const groupStreak = calcStreak(runs.map(r => r.date))
        // Liste des contributeurs (qui a participé, avec son nombre de jours actifs)
        const byMember = {}
        runs.forEach(r => {
          const id = r.member?._id?.toString()
          if (!id) return
          if (!byMember[id]) byMember[id] = { name: r.member.name, days: new Set() }
          byMember[id].days.add(new Date(r.date).toISOString().split('T')[0])
        })
        const contributors = Object.entries(byMember).map(([id, d]) => ({
          memberId: id, name: d.name, daysActive: d.days.size,
        })).sort((a, b) => b.daysActive - a.daysActive)

        return res.json({
          challenge: { name: challenge.name, type: 'streak', scope: 'collectif', goalDays: challenge.goalDays },
          collectiveStreak: groupStreak,
          contributors,
        })
      }

      // Streak individuel : classement de chaque membre
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
    // Classement par km cumulés dans ce challenge
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

  // Trier et attribuer les rangs
  ranking.sort((a, b) => b.value - a.value)
  ranking.forEach((r, i) => { r.rank = i + 1 })

  challenge.results = ranking
  challenge.resultsFrozen = true
  await challenge.save()
  return challenge
}

const router = express.Router()

// Middleware admin
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Non autorisé.' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const member = await Member.findById(decoded.id)
    if (!member || member.role !== 'admin') return res.status(403).json({ message: 'Accès réservé aux admins.' })
    req.member = member
    next()
  } catch {
    res.status(401).json({ message: 'Token invalide.' })
  }
}

// GET tous les challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 })
    const now = new Date()

    // Figer les challenges terminés qui ne le sont pas encore
    for (const c of challenges) {
      if (new Date(c.endDate) < now && !c.resultsFrozen) {
        await freezeResults(c)
      }
    }

    // Recharger pour renvoyer les résultats à jour
    const updated = await Challenge.find().sort({ createdAt: -1 })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET challenge actif
router.get('/active', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ active: true })
      .populate('participants', '-password')
    res.json(challenge)
  } catch (err) {
    res.status(500).json({ message: err.message })
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
    res.status(500).json({ message: err.message })
  }
})

// POST créer un challenge (admin)
router.post('/', isAdmin, async (req, res) => {
  try {
    const challenge = new Challenge(req.body)
    await challenge.save()
    res.status(201).json(challenge)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT modifier un challenge (admin)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true })
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
    await Challenge.findByIdAndDelete(req.params.id)
    res.json({ message: 'Challenge supprimé.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET calcul du streak d'un challenge
router.get('/:id/streak', async (req, res) => {
  try {
    const Run = (await import('../models/Run.js')).default
    const challenge = await Challenge.findById(req.params.id)
    if (!challenge) return res.status(404).json({ message: 'Challenge introuvable.' })

    // Fonction qui calcule le plus long streak de jours consécutifs à partir d'une liste de dates
    const calcStreak = (dates) => {
      if (!dates.length) return { current: 0, longest: 0 }

      // Normaliser les dates en "YYYY-MM-DD" et dédupliquer
      const uniqueDays = [...new Set(dates.map(d => new Date(d).toISOString().split('T')[0]))].sort()

      let longest = 1
      let current = 1
      let running = 1

      for (let i = 1; i < uniqueDays.length; i++) {
        const prev = new Date(uniqueDays[i - 1])
        const curr = new Date(uniqueDays[i])
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          running++
        } else {
          running = 1
        }
        longest = Math.max(longest, running)
      }

      // Streak actuel : est-ce que le dernier jour couru est aujourd'hui ou hier ?
      const lastDay = new Date(uniqueDays[uniqueDays.length - 1])
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      lastDay.setHours(0, 0, 0, 0)
      const daysSinceLastRun = Math.round((today - lastDay) / (1000 * 60 * 60 * 24))

      // Le streak actuel n'est valide que si on a couru aujourd'hui ou hier
      current = daysSinceLastRun <= 1 ? running : 0

      return { current, longest }
    }

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
    res.status(500).json({ message: err.message })
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
    const Run = (await import('../models/Run.js')).default
    const challenge = await Challenge.findById(req.params.id)
    if (!challenge) return res.status(404).json({ message: 'Challenge introuvable.' })

    const runs = await Run.find({ challenge: challenge._id }).populate('member', 'name email')

    let ranking = []

    if (challenge.type === 'streak') {
      const calcStreak = (dates) => {
        if (!dates.length) return { current: 0, longest: 0 }
        const days = [...new Set(dates.map(d => new Date(d).toISOString().split('T')[0]))].sort()
        let longest = 1, running = 1
        for (let i = 1; i < days.length; i++) {
          const diff = Math.round((new Date(days[i]) - new Date(days[i - 1])) / 86400000)
          running = diff === 1 ? running + 1 : 1
          longest = Math.max(longest, running)
        }
        const lastDay = new Date(days[days.length - 1])
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        lastDay.setHours(0, 0, 0, 0)
        const current = Math.round((today - lastDay) / 86400000) <= 1 ? running : 0
        return { current, longest }
      }
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
    res.status(500).json({ message: err.message })
  }
})

export default router