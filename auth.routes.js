const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
        }

        const user = new User({ email, password, role });
        await user.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès !' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription', error: err.message });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la connexion', error: err.message });
    }
});

module.exports = router;
// Route d'inscription (ajoute un rôle, comme "enseignant" ou "etudiant")
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Veuillez fournir l\'email, le mot de passe et le rôle.' });
    }

    // Crée un nouvel utilisateur
    const newUser = new User({
        email,
        password: await bcrypt.hash(password, 10), // Hashage du mot de passe
        role // Le rôle peut être "etudiant" ou "enseignant"
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'Utilisateur créé avec succès !' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur.' });
    }
});
