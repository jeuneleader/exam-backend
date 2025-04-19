const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, enum: ['enseignant', 'etudiant'], required: true }
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
