import jwt from 'jsonwebtoken'
import Member from '../models/Member.js'

// Vérifie le token et charge le membre connecté dans req.member
export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Non autorisé.' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    const member = await Member.findById(decoded.id).select('-password')
    if (!member) return res.status(401).json({ message: 'Non autorisé.' })
    req.member = member
    next()
  } catch {
    res.status(401).json({ message: 'Token invalide.' })
  }
}

// À placer après auth
export const isAdmin = (req, res, next) => {
  if (req.member?.role !== 'admin') return res.status(403).json({ message: 'Accès réservé aux admins.' })
  next()
}
