const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    roll: {
        type: String,
        enum: ['client', 'advisor', 'admin'],
        default: 'client'
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    }
}, { timestamps: true })

module.exports = mongoose.model('user', userSchema)