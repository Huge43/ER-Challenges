import mongoose from 'mongoose'

const challengeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['distance', 'streak'], default: 'distance' },
  icon: { type: String, default: '🏃' },

  // Pour les challenges de type "distance"
  goalKm: { type: Number, default: 0 },
  currentKm: { type: Number, default: 0 },

  // Pour les challenges de type "streak"
  goalDays: { type: Number, default: 0 },
  scope: { type: String, enum: ['individuel', 'collectif'], default: 'individuel' },

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