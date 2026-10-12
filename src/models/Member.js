// src/models/Member.js
import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  totalKm: { type: Number, default: 0 },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
}, { timestamps: true })

// Renvoie un message d'erreur si le mot de passe est invalide, sinon null
export const passwordError = (password) => {
  // bcrypt ignore tout ce qui dépasse 72 octets
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) return 'Le mot de passe doit contenir entre 8 et 72 caractères.'
  return null
}

// Renvoie un message d'erreur si les champs d'un nouveau compte sont invalides, sinon null
export const memberInputError = ({ name, email, password }) => {
  if (typeof name !== 'string' || !name.trim() || name.length > 100) return 'Nom invalide.'
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email invalide.'
  return passwordError(password)
}

export default mongoose.model('Member', memberSchema)
