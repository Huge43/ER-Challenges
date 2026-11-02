// À lancer UNE SEULE FOIS, juste avant de déployer cette version, puis ne plus y toucher :
//   node scripts/migration.js
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Challenge from '../src/models/Challenge.js'
import Run from '../src/models/Run.js'

dotenv.config()
await mongoose.connect(process.env.MONGO_URI)

// 1. Les anciens challenges distance étaient tous collectifs, mais ont reçu la portée « individuel » par défaut
const { modifiedCount } = await Challenge.updateMany({ type: 'distance' }, { scope: 'collectif' })
console.log(`${modifiedCount} challenge(s) distance passé(s) en collectif`)

// 2. Remplir les participants à partir des runs existants
for (const c of await Challenge.find()) {
  const members = await Run.distinct('member', { challenge: c._id })
  await Challenge.updateOne({ _id: c._id }, { $addToSet: { participants: { $each: members } } })
  console.log(`${c.name} : ${members.length} participants`)
}

await mongoose.disconnect()
