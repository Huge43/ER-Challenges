import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Member from './models/Member.js'
import Challenge from './models/Challenge.js'
import Run from './models/Run.js'

dotenv.config()

await mongoose.connect(process.env.MONGO_URI)
console.log('MongoDB connecté')

// Nettoyer les collections
await Member.deleteMany()
await Challenge.deleteMany()
await Run.deleteMany()

// Créer les membres
const members = await Member.insertMany([
  { name: 'Marie L.', email: 'marie@elite.com', password: '1234', totalKm: 124 },
  { name: 'Alex R.', email: 'alex@elite.com', password: '1234', totalKm: 105 },
  { name: 'Jordan M.', email: 'jordan@elite.com', password: '1234', totalKm: 89 },
  { name: 'Sam B.', email: 'sam@elite.com', password: '1234', totalKm: 74 },
  { name: 'Luca F.', email: 'luca@elite.com', password: '1234', totalKm: 62 },
  { name: 'Priya K.', email: 'priya@elite.com', password: '1234', totalKm: 55 },
  { name: 'Nadia V.', email: 'nadia@elite.com', password: '1234', totalKm: 48 },
  { name: 'Chris T.', email: 'chris@elite.com', password: '1234', totalKm: 41 },
  { name: 'Tom G.', email: 'tom@elite.com', password: '1234', totalKm: 30 },
  { name: 'Ella S.', email: 'ella@elite.com', password: '1234', totalKm: 22 },
])

// Créer le challenge Tour du monde
const challenge = await Challenge.create({
  name: 'Tour du monde',
  description: 'Cumuler 40 075 km ensemble en 90 jours',
  goalKm: 40075,
  currentKm: 650,
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-08-30'),
  participants: members.map(m => m._id),
  active: true,
  stages: [
    { name: 'Amériques', km: 15000 },
    { name: 'Atlantique', km: 6500 },
    { name: 'Europe', km: 4000 },
    { name: 'Asie', km: 9000 },
    { name: 'Pacifique', km: 4000 },
    { name: 'Arrivée', km: 1575 },
  ]
})

// Créer quelques runs récents
await Run.insertMany([
  { member: members[0]._id, challenge: challenge._id, km: 12, note: 'Course matinale' },
  { member: members[1]._id, challenge: challenge._id, km: 8, note: 'Trail Mont-Royal' },
  { member: members[2]._id, challenge: challenge._id, km: 21, note: 'Sortie longue' },
  { member: members[3]._id, challenge: challenge._id, km: 5, note: 'Run récupération' },
  { member: members[4]._id, challenge: challenge._id, km: 7, note: 'Interval training' },
])

console.log('Données insérées avec succès !')
process.exit()