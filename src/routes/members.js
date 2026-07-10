import express from 'express'
import Member from '../models/Member.js'

const router = express.Router()

// GET tous les membres triés par km
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ totalKm: -1 }).select('-password')
    res.json(members)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST créer un membre
router.post('/', async (req, res) => {
  try {
    const member = new Member(req.body)
    await member.save()
    res.status(201).json(member)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

export default router