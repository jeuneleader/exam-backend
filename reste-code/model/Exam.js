// models/Exam.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    type: { type: String, enum: ['qcm', 'direct'], required: true },
    question: { type: String, required: true }, // renommé "text" en "question" pour cohérence avec EJS
    options: [String], // renommé "choices" en "options" pour cohérence avec front-end
    correctAnswer: { type: String, required: true }
});

const resultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: String,
    answers: [String],
    score: Number
}, { _id: false });

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: Number, required: true }, // en minutes
    note: { type: Number, required: true },
    status: { type: String, enum: ['à venir', 'disponible', 'terminé'], default: 'à venir' },
    questions: [questionSchema],
    results: [resultSchema]
}, {
    timestamps: true // createdAt et updatedAt
});

module.exports = mongoose.model('Exam', examSchema);
