const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, select: false }, // on ne renvoie pas le mot de passe par défaut
    role: {
        type: String,
        enum: ['enseignant', 'etudiant'],
        required: true
    },
    lastSeen: { type: Date, default: Date.now }
}, {
    timestamps: true // ajoute createdAt et updatedAt
});

// Optionnel : mise à jour automatique de `lastSeen` à chaque requête
userSchema.methods.ping = function () {
    this.lastSeen = Date.now();
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
