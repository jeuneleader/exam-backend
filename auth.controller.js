const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Tu vas créer ce fichier ensuite

// Fonction d'inscription
exports.register = async (req, res) => {
    try {
        const { nom, email, motDePasse, role } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: 'Cet utilisateur existe déjà.' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(motDePasse, 10);

        // Créer un nouvel utilisateur
        const newUser = new User({
            nom,
            email,
            motDePasse: hashedPassword,
            role // 'etudiant' ou 'enseignant'
        });

        await newUser.save();

        res.status(201).json({ message: 'Utilisateur inscrit avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l’inscription :', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Fonction de connexion
exports.login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ message: 'Connexion réussie.', token });
    } catch (error) {
        console.error('Erreur de connexion :', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
