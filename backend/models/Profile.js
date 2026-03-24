const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
<<<<<<< HEAD
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Profile Related
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 80,
        trim: true
    },
    dependents: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
        trim: true
    },
    incomeMonthly: {
        type: Number,
        required: true,
        min: 0,
        trim: true
    },
    // Risk Related
    riskAnswer: {
        type: [Number],
        required: true,
        trim: true
    },
    riskScore: {
        type: Number,
    },
    riskLevel: {
        type: String,
        enum: ['low', 'moderate', 'high'],
    }
}, { timestamps: true })

module.exports = mongoose.model('profile', profileSchema)
=======
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    },
    // Profile Related
    age:{
        type:Number,
        required:true,
        min:18,
        max:80,
        trim:true
    },
    dependents:{
        type:Number,
        required:true,
        min:0,
        max:10,
        trim:true
    },
    incomeMonthly:{
        type:Number,
        required:true,
        min:0,
        trim:true
    },
    // Risk Related
    riskAnswer:{
        type:[Number],
        required:true,
        trim:true
    },
    riskScore:{
        type:Number,
    },
    riskLevel:{
        type:String,
        enum:['low','moderate','high'],
    }
},{timestamps:true})

module.exports = mongoose.model('profile',profileSchema)
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
