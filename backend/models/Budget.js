const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    monthlyLimit: {
        type: Number,
        required: true,
        min: 0
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Budget', budgetSchema);