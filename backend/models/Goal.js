const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema({
<<<<<<< HEAD
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
=======
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    targetCorpus:{
        type:Number,
        required:true,
        min:0
    },
    horizonyear:{
        type:Number,
        required:true,
        min:1
    },
    excpectedReturnPr:{
        type:Number,
        required:true,
        min:1
    },
    inflationPr:{
        type:Number,
        required:true,
        min:0
    },
    planType:{
        type:String,
        enum:['sip','lump_sum'],
        required:true
    },

    // Calculation Feild
    futureTargetCorpus:{
        type:Number,
        default:0
    },
    suggestedSipMonthly:{
        type:Number,
        default:0
    },
    suggestedLumpSum:{
        type:Number,
        default:0
    },

    // User Progression
    progressCorpus:{
        type:Number,
        default:0,
        min:0
    },
    progressPr:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:['on_track','off_track','at_risk'],
        default:'on_track'
    }
},{timestamps:true})

module.exports = mongoose.model('goal',goalSchema);
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
