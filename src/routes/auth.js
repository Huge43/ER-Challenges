import crypto from 'node:crypto'
import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Member, { memberInputError, passwordError } from '../models/Member.js'
import { rateLimit } from '../middleware/rateLimit.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

const passwordLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: (req) => req.member.id })

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  key: (req) => `${req.ip}|${String(req.body?.email).toLowerCase()}`,
})
const registerLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, key: (req) => req.ip })
const resetLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: (req) => req.ip })

// POST /api/auth/register
router.post('/register', registerLimit, async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {}

    const invalid = memberInputError({ name, email, password })
    if (invalid) return res.status(400).json({ message: invalid })

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
    console.error('Erreur register :', err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// POST /api/auth/login
router.post('/login', loginLimit, async (req, res) => {
  try {
    const { email, password } = req.body ?? {}
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' })
    }

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
    console.error('Erreur login :', err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// POST /api/auth/reset-password — définir un nouveau mot de passe avec le lien reçu d'un admin
router.post('/reset-password', resetLimit, async (req, res) => {
  try {
    const { token, newPassword } = req.body ?? {}
    if (typeof token !== 'string') return res.status(400).json({ message: 'Lien invalide ou expiré.' })

    const invalid = passwordError(newPassword)
    if (invalid) return res.status(400).json({ message: invalid })

    // Mise à jour atomique : le lien ne sert qu'une fois. trusted : sanitizeFilter bloquerait $gt
    const password = await bcrypt.hash(newPassword, 10)
    const member = await Member.findOneAndUpdate({
      resetTokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      resetTokenExpires: mongoose.trusted({ $gt: new Date() }),
    }, { password, $unset: { resetTokenHash: 1, resetTokenExpires: 1 } })
    if (!member) return res.status(400).json({ message: 'Lien invalide ou expiré.' })

    res.json({ message: 'Mot de passe réinitialisé.' })
  } catch (err) {
    console.error('Erreur réinitialisation :', err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// PUT /api/auth/password — changer son propre mot de passe
router.put('/password', auth, passwordLimit, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {}
    if (typeof currentPassword !== 'string') return res.status(400).json({ message: 'Mot de passe actuel incorrect.' })

    const invalid = passwordError(newPassword)
    if (invalid) return res.status(400).json({ message: invalid })

    const member = await Member.findById(req.member._id)
    const valid = await bcrypt.compare(currentPassword, member.password)
    if (!valid) return res.status(400).json({ message: 'Mot de passe actuel incorrect.' })

    member.password = await bcrypt.hash(newPassword, 10)
    await member.save()

    res.json({ message: 'Mot de passe mis à jour.' })
  } catch (err) {
    console.error('Erreur changement de mot de passe :', err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router
