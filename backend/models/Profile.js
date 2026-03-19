const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
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
        max:80
    },
    dependents:{
        type:Number,
        required:true,
        min:0,
        max:10
    },
    incomeMonthly:{
        type:Number,
        required:true,
        min:0
    },
    // Risk Related
    riskAnswer:{
        type:[Number],
        required:true
    },
    riskScore:{
        type:Number,
    },
    riskLevel:{
        type:String,
        enum:['low','modrate','high'],
    }
},{timestamps:true})

module.exports = mongoose.model('profile',profileSchema)