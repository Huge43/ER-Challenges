import express from 'express'
import Run from '../models/Run.js'
import Member from '../models/Member.js'
import Challenge from '../models/Challenge.js'

const router = express.Router()

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
    res.status(500).json({ message: err.message })
  }
})

// POST ajouter un run + mettre à jour les km
router.post('/', async (req, res) => {
  try {
    const run = new Run(req.body)
    await run.save()

    // Mettre à jour le total km du membre
    await Member.findByIdAndUpdate(req.body.member, {
      $inc: { totalKm: req.body.km }
    })

    // Mettre à jour le total km du challenge
    await Challenge.findByIdAndUpdate(req.body.challenge, {
      $inc: { currentKm: req.body.km }
    })

    res.status(201).json(run)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

export default router