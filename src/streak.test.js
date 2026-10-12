// npm test
import test from 'node:test'
import assert from 'node:assert'
import { calcStreak } from './streak.js'

test('calcStreak', () => {
  assert.deepEqual(calcStreak([], '2026-10-12'), { current: 0, longest: 0 })
  // 3 jours de suite jusqu'à aujourd'hui, doublon ignoré
  assert.deepEqual(calcStreak(['2026-10-10', '2026-10-11', '2026-10-11', '2026-10-12'], '2026-10-12'), { current: 3, longest: 3 })
  // dernier run hier : le streak tient encore
  assert.deepEqual(calcStreak(['2026-10-10', '2026-10-11'], '2026-10-12'), { current: 2, longest: 2 })
  // dernier run avant-hier : streak actuel perdu, le plus long reste
  assert.deepEqual(calcStreak(['2026-10-09', '2026-10-10'], '2026-10-12'), { current: 0, longest: 2 })
  // trou au milieu
  assert.deepEqual(calcStreak(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-11', '2026-10-12'], '2026-10-12'), { current: 2, longest: 3 })
  // passage de mois, ordre quelconque
  assert.deepEqual(calcStreak(['2026-10-01', '2026-09-30'], '2026-10-01'), { current: 2, longest: 2 })
})
