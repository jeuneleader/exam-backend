require('dotenv').config(); // Charger les variables d'environnement depuis .env
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connecté à MongoDB !'))
    .catch(err => console.log('❌ Erreur de connexion à MongoDB:', err));


// Route de base
app.get('/', (req, res) => {
    res.send('Bienvenue sur le backend de la plateforme d\'examens !');
});

// 🔗 Importation des routes
const authRoutes = require('./auth.routes');
const protectedRoutes = require('./protected.routes');

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

// 🚀 Lancer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

