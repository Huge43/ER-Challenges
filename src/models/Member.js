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

export default mongoose.model('Member', memberSchema)