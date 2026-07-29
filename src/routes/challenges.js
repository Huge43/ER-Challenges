import express from 'express'
import jwt from 'jsonwebtoken'
import Challenge from '../models/Challenge.js'
import Member from '../models/Member.js'

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
    res.json(challenges)
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

export default router