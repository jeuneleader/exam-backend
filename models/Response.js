const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [
        {
            question: String,
            answer: String
        }
    ],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});
const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: {
        type: [String],
        required: true
    },
    grade: {  // Note attribuée par l'enseignant
        type: Number,
        default: null // La note peut être vide tant que l'enseignant ne l'a pas définie
    },
    comments: {  // Commentaire de l'enseignant
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Response', ResponseSchema);


module.exports = mongoose.model('Response', responseSchema);
