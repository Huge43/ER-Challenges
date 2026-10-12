// Limite le nombre de requêtes par clé sur une fenêtre de temps
// ponytail: compteur en mémoire, perdu au redémarrage et non partagé entre instances ; passer à Redis si l'API tourne sur plusieurs instances
export const rateLimit = ({ windowMs, max, key }) => {
  const hits = new Map()
  return (req, res, next) => {
    const now = Date.now()
    if (hits.size > 10000) for (const [k, h] of hits) if (h.reset <= now) hits.delete(k)
    const k = key(req)
    let h = hits.get(k)
    if (!h || h.reset <= now) hits.set(k, h = { count: 0, reset: now + windowMs })
    if (++h.count > max) return res.status(429).json({ message: 'Trop de tentatives. Réessayez plus tard.' })
    next()
  }
}
