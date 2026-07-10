import express from 'express'
import Challenge from '../models/Challenge.js'

const router = express.Router()

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

// POST créer un challenge
router.post('/', async (req, res) => {
  try {
    const challenge = new Challenge(req.body)
    await challenge.save()
    res.status(201).json(challenge)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

export default router