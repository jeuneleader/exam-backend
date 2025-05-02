// controllers/examController.js
const Exam = require('../models/Exam');

// 🧾 Récupère et affiche tous les examens (enseignant et étudiant)
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().sort({ createdAt: -1 });
        res.render('Examen', {
            exams,
            role: req.user.role // attendu dans le fichier Examen.ejs
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des examens');
    }
};

// 📝 Création d’un nouvel examen (enseignant uniquement)
exports.createExam = async (req, res) => {
    try {
        const { title, duration, note, status, questions } = req.body;

        // Nettoyage des questions
        const formattedQuestions = questions.map(q => ({
            type: q.type,
            question: q.question,
            options: q.options?.filter(opt => opt.trim() !== '') || [],
            correctAnswer: q.correctAnswer
        }));

        const newExam = new Exam({
            title,
            duration,
            note,
            status,
            questions: formattedQuestions
        });

        await newExam.save();
        res.redirect('/exam');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la création de l\'examen');
    }
};

// 📊 Voir les résultats d’un examen (enseignant)
exports.getResults = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).send('Examen non trouvé');
        res.render('Results', { exam });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des résultats');
    }
};
