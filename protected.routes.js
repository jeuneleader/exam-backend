const express = require('express');
const Response = require('./models/Response');
const Exam = require('./models/Exam');
const router = express.Router();
const { verifyToken, requireRole } = require('./middlewares/auth.middleware');

// Route accessible à tous les utilisateurs authentifiés
router.get('/profile', verifyToken, (req, res) => {
    res.json({
        message: `Bienvenue, ${req.user.role} ${req.user.email}!`,
        user: req.user
    });
});


// Route réservée aux étudiants
router.get('/etudiant', verifyToken, requireRole('etudiant'), (req, res) => {
    res.json({
        message: 'Bienvenue sur l’espace étudiant !'
    });
});



// Route réservée aux enseignants
router.get('/enseignant', verifyToken, requireRole('enseignant'), (req, res) => {
    res.json({
        message: 'Bienvenue sur l’espace enseignant !'
    });
});

// Route pour créer un examen (réservée aux enseignants)
router.post('/create', verifyToken, requireRole('enseignant'), async (req, res) => {
    const { title, description, questions } = req.body;

    const newExam = new Exam({
        title,
        description,
        questions,
        createdBy: req.user.id // Associe l'examen à l'enseignant qui l'a créé
    });

    try {
        await newExam.save();
        res.status(201).json({ message: 'Examen créé avec succès !' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de l\'examen.' });
    }
});

// Route pour lister tous les examens (accessible à tous les utilisateurs authentifiés)
router.get('/exams', verifyToken, async (req, res) => {
    try {
        const exams = await Exam.find(); // Tous les examens
        res.json(exams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Route pour soumettre une réponse à un examen (étudiant uniquement)
router.post('/submit/:examId', verifyToken, requireRole('etudiant'), async (req, res) => {
    const { examId } = req.params;
    const { answers } = req.body;

    try {
        const response = new Response({
            examId,
            studentId: req.user.id,
            answers
        });

        await response.save();
        res.status(201).json({ message: "Réponse enregistrée avec succès !" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la soumission de la réponse." });
    }
});
// Route réservée aux enseignants pour consulter les réponses soumises par les étudiants pour un examen
router.get('/exam/:examId/responses', verifyToken, requireRole('enseignant'), async (req, res) => {
    const { examId } = req.params;  // ID de l'examen passé dans l'URL

    try {
        // Chercher les réponses soumises pour cet examen spécifique
        const responses = await Response.find({ examId });

        if (responses.length === 0) {
            return res.status(404).json({ message: "Aucune réponse trouvée pour cet examen." });
        }

        // Renvoie les réponses trouvées
        res.json(responses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la récupération des réponses." });
    }
});

// Route pour attribuer une note et un commentaire sur une réponse (réservée aux enseignants)
router.put('/grade/:responseId', verifyToken, requireRole('enseignant'), async (req, res) => {
    const { responseId } = req.params;
    const { grade, comments } = req.body;  // Attendu dans le body: note et commentaire

    try {
        // Trouve la réponse à noter
        const response = await Response.findById(responseId);

        // Vérifie si la réponse existe
        if (!response) {
            return res.status(404).json({ message: 'Réponse non trouvée.' });
        }

        // Attribue la note et le commentaire
        response.grade = grade;
        response.comments = comments;

        // Sauvegarde les modifications
        await response.save();

        res.status(200).json({ message: 'Note et commentaire ajoutés avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de l\'attribution de la note.' });
    }
});


module.exports = router;