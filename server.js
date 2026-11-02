import 'dotenv/config'

import connectDB from './src/db.js'
import app from './src/app.js'

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET manquant dans les variables d\'environnement.')
  process.exit(1)
}

connectDB()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`))
