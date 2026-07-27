import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './src/db.js'
import membersRouter from './src/routes/members.js'
import challengesRouter from './src/routes/challenges.js'
import runsRouter from './src/routes/runs.js'
import dashboardRouter from './src/routes/dashboard.js'
import authRouter from './src/routes/auth.js'

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())


app.use('/api/auth', authRouter)
app.use('/api/members', membersRouter)
app.use('/api/challenges', challengesRouter)
app.use('/api/runs', runsRouter)
app.use('/api/dashboard', dashboardRouter)

app.get('/', (req, res) => res.json({ message: 'Elite Runners API en ligne' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`))