// src/models/Run.js
import mongoose from 'mongoose'

const runSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  // Un run compte pour tous les challenges actifs dont la période contient sa date
  challenges: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }], index: true },
  km: { type: Number, default: 0 },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('Run', runSchema)