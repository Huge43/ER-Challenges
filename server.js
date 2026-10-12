import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import connectDB from './src/db.js'
import membersRouter from './src/routes/members.js'
import challengesRouter from './src/routes/challenges.js'
import runsRouter from './src/routes/runs.js'
import dashboardRouter from './src/routes/dashboard.js'
import authRouter from './src/routes/auth.js'
import { auth } from './src/middleware/auth.js'

dotenv.config()

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET manquant dans les variables d\'environnement.')
  process.exit(1)
}

connectDB()

const app = express()

// Nombre de proxys devant l'API (dépend de l'hébergeur) : nécessaire pour que
// la limite de tentatives voie la vraie IP du client et non celle du proxy
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY))

app.use(helmet())
// CORS_ORIGIN : domaine(s) du front, séparés par des virgules
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim()) }))
app.use(express.json())

app.get('/', (req, res) => res.json({ message: 'Elite Runners API en ligne' }))

app.use('/api/auth', authRouter)

// Tout ce qui suit exige un token valide
app.use('/api', auth)
app.use('/api/members', membersRouter)
app.use('/api/challenges', challengesRouter)
app.use('/api/runs', runsRouter)
app.use('/api/dashboard', dashboardRouter)

// JSON mal formé, body trop gros, erreurs non gérées
app.use((err, req, res, next) => {
  if (!err.status) console.error(err)
  res.status(err.status || 500).json({ message: err.status ? 'Requête invalide.' : 'Erreur serveur.' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`))
