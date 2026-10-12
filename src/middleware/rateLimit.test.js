// node --test src/middleware/rateLimit.test.js
import test from 'node:test'
import assert from 'node:assert'
import { rateLimit } from './rateLimit.js'

const call = (mw, ip) => {
  let status = 200
  mw({ ip }, { status: (s) => { status = s; return { json() {} } } }, () => {})
  return status
}

test('bloque après max requêtes, par clé, et se réinitialise après la fenêtre', async () => {
  const mw = rateLimit({ windowMs: 50, max: 2, key: (req) => req.ip })
  assert.equal(call(mw, 'a'), 200)
  assert.equal(call(mw, 'a'), 200)
  assert.equal(call(mw, 'a'), 429)
  assert.equal(call(mw, 'b'), 200)
  await new Promise(r => setTimeout(r, 60))
  assert.equal(call(mw, 'a'), 200)
})
