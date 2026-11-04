// Convertit Run.challenge (un seul challenge) en Run.challenges (tableau), sans perte de données.
// Idempotent : seuls les runs pas encore convertis sont touchés, on peut le relancer sans risque.
//   node scripts/migration-challenges-multiples.js
// Pour viser une autre base que celle de MONGO_URI : MONGO_DB=elite-runners-prod node scripts/...
import 'dotenv/config'
import mongoose from 'mongoose'
import { recomputeChallenges } from '../src/challengeRuns.js'

await mongoose.connect(process.env.MONGO_URI, process.env.MONGO_DB ? { dbName: process.env.MONGO_DB } : {})
const runs = mongoose.connection.db.collection('runs')
console.log(`Base : ${mongoose.connection.db.databaseName}`)

const total = await runs.countDocuments()
const todo = await runs.countDocuments({ challenge: { $exists: true } })
console.log(`${total} runs, dont ${todo} à convertir`)

// Une seule opération atomique par document : la valeur passe dans le tableau, puis l'ancien champ disparaît
const { modifiedCount } = await runs.updateMany(
  { challenge: { $exists: true } },
  [{ $set: { challenges: { $setUnion: [{ $ifNull: ['$challenges', []] }, ['$challenge']] } } }, { $unset: 'challenge' }],
)
console.log(`${modifiedCount} runs convertis`)

// Vérifications : aucun run perdu, aucun run sans challenge
const after = await runs.countDocuments()
const orphans = await runs.countDocuments({ $or: [{ challenges: { $exists: false } }, { challenges: { $size: 0 } }] })
console.log(`${after} runs après migration (avant : ${total}), ${orphans} sans challenge`)
if (after !== total || orphans) process.exitCode = 1

// Recalcul des km et participants de chaque challenge à partir des runs
const ids = await mongoose.connection.db.collection('challenges').distinct('_id')
await recomputeChallenges(ids)
console.log(`${ids.length} challenges recalculés`)

await mongoose.disconnect()
