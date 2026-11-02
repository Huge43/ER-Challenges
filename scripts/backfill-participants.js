// À lancer une fois : remplit les participants des challenges à partir des runs existants
// node scripts/backfill-participants.js
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Challenge from '../src/models/Challenge.js'
import Run from '../src/models/Run.js'

dotenv.config()
await mongoose.connect(process.env.MONGO_URI)

for (const c of await Challenge.find()) {
  const members = await Run.distinct('member', { challenge: c._id })
  await Challenge.updateOne({ _id: c._id }, { $addToSet: { participants: { $each: members } } })
  console.log(`${c.name} : ${members.length} participants`)
}

await mongoose.disconnect()
