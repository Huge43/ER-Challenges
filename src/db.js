// src/db.js
import mongoose from 'mongoose'

// Empêche l'injection d'opérateurs ($gt, $ne…) dans les filtres de requête
mongoose.set('sanitizeFilter', true)

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connecté')
  } catch (err) {
    console.error('Erreur de connexion MongoDB :', err.message)
    process.exit(1)
  }
}

export default connectDB