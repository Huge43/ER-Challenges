import express from 'express'
import jwt from 'jsonwebtoken'
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

// GET tous les membres triés par km
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ totalKm: -1 }).select('-password')
    res.json(members)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST créer un membre (admin)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const exists = await Member.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Cet email est déjà utilisé.' })
    const bcrypt = await import('bcryptjs')
    const hashed = await bcrypt.default.hash(password || 'EliteRunners2026', 10)
    const member = await Member.create({ name, email, password: hashed, role: role || 'member' })
    res.status(201).json({ ...member._doc, password: undefined })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT modifier le rôle (admin)
router.put('/:id/role', isAdmin, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password')
    res.json(member)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE retirer un membre (admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id)
    res.json({ message: 'Membre supprimé.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router