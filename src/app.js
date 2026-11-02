import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import membersRouter from './routes/members.js'
import challengesRouter from './routes/challenges.js'
import runsRouter from './routes/runs.js'
import dashboardRouter from './routes/dashboard.js'
import authRouter from './routes/auth.js'
import { auth } from './middleware/auth.js'

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

export default app
