const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    targetCorpus: {
        type: Number,
        required: true,
        min: 0
    },
    horizonyear: {
        type: Number,
        required: true,
        min: 1
    },
    excpectedReturnPr: {
        type: Number,
        required: true,
        min: 1
    },
    inflationPr: {
        type: Number,
        required: true,
        min: 0
    },
    planType: {
        type: String,
        enum: ['sip', 'lump_sum'],
        required: true
    },

    // Calculation Feild
    futureTargetCorpus: {
        type: Number,
        default: 0
    },
    suggestedSipMonthly: {
        type: Number,
        default: 0
    },
    suggestedLumpSum: {
        type: Number,
        default: 0
    },

    // User Progression
    progressCorpus: {
        type: Number,
        default: 0,
        min: 0
    },
    progressPr: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['on_track', 'off_track', 'at_risk'],
        default: 'on_track'
    }
}, { timestamps: true })

module.exports = mongoose.model('goal', goalSchema);
