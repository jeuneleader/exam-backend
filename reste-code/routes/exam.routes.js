const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const Exam = require('../models/Exam');
const User = require('../models/User');

// 🔐 Middleware d'authentification (à adapter selon votre système)
const isTeacher = (req, res, next) => {
    if (req.user?.role === 'enseignant') return next();
    return res.status(403).json({ error: 'Accès enseignant requis' });
};

const isStudent = (req, res, next) => {
    if (req.user?.role === 'etudiant') return next();
    return res.status(403).json({ error: 'Accès étudiant requis' });
};

// 🎓 Créer un examen (enseignant)
router.post('/create', isTeacher, examController.createExam);

// 👨‍🎓 Récupérer tous les examens
router.get('/', examController.getAllExams);

// 👨‍🎓 Examens pour étudiants (sans les réponses)
router.get('/student', isStudent, async (req, res) => {
    try {
        const exams = await Exam.find({}, '-questions.answer');
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors du chargement des examens' });
    }
});

// 🎓 Examens créés par un enseignant
router.get('/teacher', isTeacher, async (req, res) => {
    try {
        const exams = await Exam.find();
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors du chargement des examens' });
    }
});

// 🎯 Soumettre les réponses et enregistrer la note
router.post('/submit/:examId', isStudent, async (req, res) => {
    try {
        const { examId } = req.params;
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ error: 'Examen introuvable' });

        let score = 0;
        const studentAnswers = [];

        exam.questions.forEach((q, index) => {
            const answer = req.body[`answer${index}`];
            studentAnswers.push(answer);
            if (answer && answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                score += exam.note / exam.questions.length;
            }
        });

        // Enregistrer le résultat
        exam.results.push({
            studentId: req.user._id,
            studentName: req.user.name,
            answers: studentAnswers,
            score: Math.round(score * 100) / 100
        });

        await exam.save();

        res.redirect(`/exam/${examId}/my-score`);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la soumission' });
    }
});

// 📊 Voir les résultats d'un examen (enseignant)
router.get('/:id/results', isTeacher, examController.getResults);

// 🧠 Voir la note de l'étudiant connecté
router.get('/:examId/my-score', isStudent, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) return res.status(404).json({ error: 'Examen introuvable' });

        const result = exam.results.find(r => r.studentId?.toString() === req.user._id.toString());
        if (!result) return res.status(404).json({ message: 'Aucune note trouvée pour vous.' });

        res.json({ score: result.score });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération de la note' });
    }
});

// 🔄 Mise à jour du statut de présence
router.post('/users/ping', isStudent, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() });
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send('Erreur lors de la mise à jour du statut en ligne');
    }
});

// 👀 Statut en ligne des étudiants (enseignant)
router.get('/users/online-status', isTeacher, async (req, res) => {
    try {
        const users = await User.find({ role: 'etudiant' }).select('name lastSeen');
        const now = new Date();
        const statusList = users.map(user => {
            const diffMs = now - new Date(user.lastSeen);
            const isOnline = diffMs < 10000; // 10 secondes
            return {
                name: user.name,
                status: isOnline ? 'En ligne' : 'Hors ligne',
                lastSeen: user.lastSeen
            };
        });
        res.json(statusList);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors du chargement des statuts' });
    }
});

module.exports = router;
