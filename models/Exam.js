const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: String,
    description: String,
    questions: [{
        questionText: String,
        options: [String],
        correctAnswer: String
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Exam', examSchema);
