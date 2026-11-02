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
