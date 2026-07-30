// src/models/Run.js
import mongoose from 'mongoose'

const runSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  km: { type: Number, default: 0 },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('Run', runSchema)