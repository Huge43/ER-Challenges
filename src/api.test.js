// Parcours complet de l'API sur une base MongoDB en mémoire : npm test
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { MongoMemoryServer } from 'mongodb-memory-server'
import './db.js' // active sanitizeFilter comme en production
import app from './app.js'
import Member from './models/Member.js'
import { clubToday } from './streak.js'

let mongo, server, base

before(async () => {
  process.env.JWT_SECRET = 'secret-de-test'
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
  server = app.listen(0)
  base = `http://localhost:${server.address().port}/api`
})

after(async () => {
  server.close()
  await mongoose.disconnect()
  await mongo.stop()
})

const call = async (method, path, token, body) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  })
  return { status: res.status, data: await res.json() }
}

test('réinitialisation du mot de passe, runs et challenges', async () => {
  // Un membre s'inscrit, un admin existe déjà
  const reg = await call('POST', '/auth/register', null, { name: 'Alice', email: 'alice@test.com', password: 'motdepasse1' })
  assert.equal(reg.status, 201)
  const alice = reg.data.member.id
  let aliceToken = reg.data.token

  await Member.create({ name: 'Admin', email: 'admin@test.com', password: await bcrypt.hash('motdepasse1', 10), role: 'admin' })
  const admin = (await call('POST', '/auth/login', null, { email: 'admin@test.com', password: 'motdepasse1' })).data.token

  // Lien de réinitialisation : réservé aux admins, utilisable une seule fois
  assert.equal((await call('POST', `/members/${alice}/reset-link`, aliceToken)).status, 403)
  const { token: resetToken } = (await call('POST', `/members/${alice}/reset-link`, admin)).data
  assert.equal((await call('POST', '/auth/reset-password', null, { token: resetToken, newPassword: 'nouveaumdp1' })).status, 200)
  assert.equal((await call('POST', '/auth/reset-password', null, { token: resetToken, newPassword: 'autremdp12' })).status, 400)
  assert.equal((await call('GET', '/members', aliceToken)).status, 401, "l'ancienne session est déconnectée")
  assert.equal((await call('POST', '/auth/login', null, { email: 'alice@test.com', password: 'motdepasse1' })).status, 400)
  aliceToken = (await call('POST', '/auth/login', null, { email: 'alice@test.com', password: 'nouveaumdp1' })).data.token

  // Changer son mot de passe renvoie un nouveau jeton et invalide l'ancien
  const pw = await call('PUT', '/auth/password', aliceToken, { currentPassword: 'nouveaumdp1', newPassword: 'encoreun1' })
  assert.equal(pw.status, 200)
  assert.equal((await call('GET', '/members', aliceToken)).status, 401)
  aliceToken = pw.data.token
  assert.equal((await call('GET', '/members', aliceToken)).status, 200)

  // Challenge distance individuel qui finit aujourd'hui : encore ouvert
  const today = clubToday()
  const ch = (await call('POST', '/challenges', admin, {
    name: '100 km', type: 'distance', scope: 'individuel', goalKm: 100, startDate: today, endDate: today, active: true,
  })).data
  const run = (await call('POST', '/runs', aliceToken, { challenge: ch._id, km: 5, date: today })).data
  assert.ok(run._id, 'run accepté le dernier jour')

  let [c] = (await call('GET', '/challenges', aliceToken)).data
  assert.equal(c.resultsFrozen, false)
  assert.deepEqual(c.memberKm.map(m => m.km), [5])
  assert.equal(c.participants.length, 1)

  // Corriger puis supprimer un run met les totaux à jour
  assert.equal((await call('PUT', `/runs/${run._id}`, admin, { km: 8 })).status, 200)
  c = (await call('GET', '/challenges', aliceToken)).data[0]
  assert.equal(c.currentKm, 8)
  assert.equal((await Member.findById(alice)).totalKm, 8)

  assert.equal((await call('DELETE', `/runs/${run._id}`, aliceToken)).status, 200)
  c = (await call('GET', '/challenges', aliceToken)).data[0]
  assert.equal(c.currentKm, 0)
  assert.equal(c.participants.length, 0)

  // Supprimer un challenge retire ses runs et leurs km
  await call('POST', '/runs', aliceToken, { challenge: ch._id, km: 12, date: today })
  assert.equal((await call('DELETE', `/challenges/${ch._id}`, admin)).status, 200)
  assert.equal((await Member.findById(alice)).totalKm, 0)
  assert.equal((await call('GET', `/runs/member/${alice}`, aliceToken)).data.length, 0)
})

// Décale un jour YYYY-MM-DD de n jours
const shift = (day, n) => new Date(Date.parse(day) + n * 86400000).toISOString().slice(0, 10)

test('plusieurs challenges actifs, validation des dates, étapes', async () => {
  const today = clubToday()
  const admin = (await call('POST', '/auth/login', null, { email: 'admin@test.com', password: 'motdepasse1' })).data.token
  const reg = await call('POST', '/auth/register', null, { name: 'Bob', email: 'bob@test.com', password: 'motdepasse1' })
  const bob = reg.data.member.id
  const bobToken = reg.data.token
  const challenge = async (id) => (await call('GET', '/challenges', admin)).data.find(c => c._id === id)

  const tour = (await call('POST', '/challenges', admin, {
    name: 'Tour du monde', type: 'distance', scope: 'collectif', goalKm: 40075,
    startDate: shift(today, -30), endDate: shift(today, 300), active: true,
  })).data
  // Étapes : triées par km, refusées au-delà de l'objectif
  const nov = (await call('POST', '/challenges', admin, {
    name: 'Novembre', type: 'distance', scope: 'collectif', goalKm: 600,
    startDate: shift(today, -1), endDate: shift(today, 20), active: false,
    stages: [{ name: 'Mi-parcours', km: 300 }, { name: 'Départ', km: 50 }],
  })).data
  assert.deepEqual(nov.stages.map(s => s.name), ['Départ', 'Mi-parcours'])
  const bad = await call('PUT', `/challenges/${nov._id}`, admin, { stages: [{ name: 'Trop loin', km: 700 }] })
  assert.equal(bad.status, 400)
  assert.match(bad.data.message, /Trop loin/)

  // Run d'hier : seul le Tour est actif
  const yesterday = (await call('POST', '/runs', bobToken, { km: 10, date: shift(today, -1) })).data
  assert.deepEqual(yesterday.challenges, [tour._id])

  // Activer Novembre ne désactive pas le Tour, et rattache le run d'hier
  await call('PUT', `/challenges/${nov._id}/activate`, admin)
  assert.equal((await call('GET', '/challenges/active', bobToken)).data.length, 2)
  assert.equal((await challenge(nov._id)).currentKm, 10)

  // Un run d'aujourd'hui compte pour les deux, le total du membre une seule fois
  const run = (await call('POST', '/runs', bobToken, { km: 5, date: today })).data
  assert.equal(run.challenges.length, 2)
  assert.equal((await Member.findById(bob)).totalKm, 15)
  // Un run d'il y a 5 jours : seulement le Tour
  await call('POST', '/runs', bobToken, { km: 3, date: shift(today, -5) })
  assert.equal((await challenge(tour._id)).currentKm, 18)
  assert.equal((await challenge(nov._id)).currentKm, 15)

  // Dates refusées avec un message clair
  const outside = await call('POST', '/runs', bobToken, { km: 5, date: shift(today, -60) })
  assert.equal(outside.status, 400)
  assert.match(outside.data.message, /Aucun challenge actif ne couvre/)
  const future = await call('POST', '/runs', bobToken, { km: 5, date: shift(today, 1) })
  assert.equal(future.status, 400)
  assert.match(future.data.message, /futur/)

  // Corriger un run met à jour tous ses challenges
  await call('PUT', `/runs/${run._id}`, bobToken, { km: 7 })
  assert.equal((await challenge(tour._id)).currentKm, 20)
  assert.equal((await challenge(nov._id)).currentKm, 17)
  assert.equal((await Member.findById(bob)).totalKm, 20)

  // Dashboard : un top 3 par challenge actif
  const dash = (await call('GET', '/dashboard', bobToken)).data
  assert.equal(dash.topContributors[nov._id][0].km, 17)

  // Supprimer Novembre : les runs partagés restent comptés dans le Tour
  await call('DELETE', `/challenges/${nov._id}`, admin)
  assert.equal((await challenge(tour._id)).currentKm, 20)
  assert.equal((await Member.findById(bob)).totalKm, 20)

  // Novembre supprimé, une place se libère : un streak tourne en parallèle du Tour : une validation à 0 km ne compte que pour lui
  const streak = (await call('POST', '/challenges', admin, {
    name: 'Streak', type: 'streak', scope: 'individuel', goalDays: 7, startDate: today, endDate: shift(today, 6), active: true,
  })).data
  const validation = (await call('POST', '/runs', bobToken, { km: 0, date: today })).data
  assert.deepEqual(validation.challenges, [streak._id])
  assert.equal((await call('GET', `/challenges/${streak._id}/streak`, bobToken)).data.members[0].current, 1)
  assert.equal((await challenge(tour._id)).currentKm, 20)

  // Raccourcir la période du Tour détache le run d'il y a 5 jours
  await call('PUT', `/challenges/${tour._id}`, admin, { startDate: shift(today, -2) })
  assert.equal((await challenge(tour._id)).currentKm, 17)
})

test('maximum 2 challenges actifs', async () => {
  const today = clubToday()
  const admin = (await call('POST', '/auth/login', null, { email: 'admin@test.com', password: 'motdepasse1' })).data.token
  const actives = (await call('GET', '/challenges/active', admin)).data
  assert.equal(actives.length, 2, 'le Tour et le Streak du test précédent sont actifs')

  // Un 3e challenge actif est refusé, à la création comme à l'activation
  const base = { type: 'distance', scope: 'collectif', goalKm: 100, startDate: today, endDate: shift(today, 5) }
  const refused = await call('POST', '/challenges', admin, { ...base, name: 'Trop', active: true })
  assert.equal(refused.status, 400)
  assert.match(refused.data.message, /déjà actifs/)
  const third = (await call('POST', '/challenges', admin, { ...base, name: 'Troisième', active: false })).data
  assert.equal((await call('PUT', `/challenges/${third._id}/activate`, admin)).status, 400)
  // Réactiver un challenge déjà actif reste possible
  assert.equal((await call('PUT', `/challenges/${actives[0]._id}/activate`, admin)).status, 200)

})

test('suspension de compte', async () => {
  const admin = (await call('POST', '/auth/login', null, { email: 'admin@test.com', password: 'motdepasse1' })).data.token
  // Suspension : sessions coupées, connexion refusée, données conservées
  const bobToken = (await call('POST', '/auth/login', null, { email: 'bob@test.com', password: 'motdepasse1' })).data.token
  const bob = (await Member.findOne({ email: 'bob@test.com' }))._id.toString()
  assert.equal((await call('PUT', `/members/${bob}/suspend`, bobToken, { suspended: true })).status, 403)
  assert.equal((await call('PUT', `/members/${bob}/suspend`, admin, { suspended: true })).status, 200)
  assert.equal((await call('GET', '/members', bobToken)).status, 401)
  const login = await call('POST', '/auth/login', null, { email: 'bob@test.com', password: 'motdepasse1' })
  assert.equal(login.status, 403)
  assert.match(login.data.message, /suspendu/)
  assert.ok((await call('GET', `/runs/member/${bob}`, admin)).data.length > 0, 'ses runs sont conservés')

  await call('PUT', `/members/${bob}/suspend`, admin, { suspended: false })
  assert.equal((await call('POST', '/auth/login', null, { email: 'bob@test.com', password: 'motdepasse1' })).status, 200)
})

test('titres du podium', async () => {
  const admin = (await call('POST', '/auth/login', null, { email: 'admin@test.com', password: 'motdepasse1' })).data.token
  const actives = (await call('GET', '/challenges/active', admin)).data
  const third = (await call('GET', '/challenges', admin)).data.find(c => c.name === 'Troisième')
  // Titres : modifiables après la fin du challenge, le reste est figé
  const tour = actives.find(c => c.name === 'Tour du monde')
  await call('PUT', `/challenges/${tour._id}/end`, admin)
  const titled = await call('PUT', `/challenges/${tour._id}`, admin, { titles: ['Globe-trotteur', 'Explorateur', ''] })
  assert.equal(titled.status, 200)
  assert.deepEqual(titled.data.titles, ['Globe-trotteur', 'Explorateur', ''])
  assert.equal((await call('PUT', `/challenges/${tour._id}`, admin, { name: 'Autre nom' })).status, 400)
  const frozen = (await call('GET', '/challenges', admin)).data.find(c => c._id === tour._id)
  assert.equal(frozen.results[0].name, 'Bob')

  // Le Tour terminé libère une place
  assert.equal((await call('PUT', `/challenges/${third._id}/activate`, admin)).status, 200)

})

test('défi de série classé par record, la série cassée ne fait pas disparaître le membre', async () => {
  const today = clubToday()
  const admin = (await call('POST', '/auth/login', null, { email: 'admin@test.com', password: 'motdepasse1' })).data.token
  const alice = (await call('POST', '/auth/login', null, { email: 'alice@test.com', password: 'encoreun1' })).data.token
  const streak = (await call('GET', '/challenges/active', admin)).data.find(c => c.name === 'Streak')
  // Le défi commence 10 jours plus tôt : Alice y a tenu 3 jours, puis s'est arrêtée
  await call('PUT', `/challenges/${streak._id}`, admin, { startDate: shift(today, -10) })
  for (const d of [-9, -8, -7]) await call('POST', '/runs', alice, { km: 0, date: shift(today, d) })

  // Bob a couru hier et aujourd'hui : série en cours 2, record 2. Alice : série en cours 0, record 3
  const { ranking } = (await call('GET', `/challenges/${streak._id}/ranking`, admin)).data
  assert.deepEqual(ranking.map(m => [m.name, m.longest, m.current]), [['Alice', 3, 0], ['Bob', 2, 2]])
  const { members } = (await call('GET', `/challenges/${streak._id}/streak`, admin)).data
  assert.equal(members[0].name, 'Alice')
})

