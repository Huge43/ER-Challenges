import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Member from '../models/Member.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    const exists = await Member.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Cet email est déjà utilisé.' })

    const hashed = await bcrypt.hash(password, 10)
    const member = await Member.create({ name, email, password: hashed })

    const token = jwt.sign({ id: member._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      token,
      member: { id: member._id, name: member.name, email: member.email, role: member.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const member = await Member.findOne({ email })
    if (!member) return res.status(400).json({ message: 'Email ou mot de passe incorrect.' })

    const valid = await bcrypt.compare(password, member.password)
    if (!valid) return res.status(400).json({ message: 'Email ou mot de passe incorrect.' })

    const token = jwt.sign({ id: member._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      token,
      member: { id: member._id, name: member.name, email: member.email, role: member.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router