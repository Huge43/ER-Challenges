// src/models/Challenge.js
import mongoose from 'mongoose'

const challengeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  goalKm: { type: Number, required: true },
  currentKm: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  stages: [{
    name: { type: String },
    km: { type: Number },
  }],
  active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Challenge', challengeSchema)