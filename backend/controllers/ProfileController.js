const profile = require('../models/Profile')

<<<<<<< HEAD
const calculateRisk = (answers) => {
    const riskScore = answers.reduce((sum, val) => sum + val, 0)

    let riskLevel = 'low'

    if (riskScore <= 5) {
        riskLevel = 'low'
    }
    else if (riskScore <= 8) {
        riskLevel = 'moderate'
    }
    else {
        riskLevel = 'high'
    }
    return { riskScore, riskLevel }
}

const validateAnswer = (answers) => {
    return (
        answers !== undefined &&
        Array.isArray(answers) &&
        answers.length === 4 &&
        answers.every(ans => typeof ans === 'number' && ans >= 1 && ans <= 4)
    );
}

exports.createOrSaveProfile = async (req, res, next) => {
    try {

        const userId = req.user._id;
        const { age, dependents, incomeMonthly, answers } = req.body

        const existingProfile = await profile.findOne({ userId })
        if (existingProfile) {
            return res.status(400).json({ success: false, message: 'Profile Already Exists..!' })
        }

        // Validation for data inorder to store valid data in DB
        if (age === undefined || dependents === undefined || incomeMonthly === undefined) {
            return res.status(400).json({ success: false, message: 'Please Give All The Details' })
        }
        if (typeof age !== 'number' || typeof dependents !== 'number' || typeof incomeMonthly !== 'number') {
            return res.status(400).json({ success: false, message: 'age,dependants,incomeMonthly must be number only..!' })
        }
        if (!validateAnswer(answers)) {
            return res.status(400).json({ success: false, message: 'Please Give Valid Answers..!' })
        }

        const { riskScore, riskLevel } = calculateRisk(answers)
=======
const calculateRisk = (answers)=>{
    const riskScore = answers.reduce((sum,val)=> sum + val ,0)

    let riskLevel = 'low'

    if(riskScore<=5){
        riskLevel = 'low'
    }
    else if(riskScore<=8){
        riskLevel = 'moderate'
    }
    else{
        riskLevel = 'high'
    }
    return { riskScore,riskLevel }
}

const validateAnswer = (answers) =>{
    return(
        answers!== undefined &&
        Array.isArray(answers) && 
        answers.length === 4 &&
        answers.every(ans => typeof ans === 'number' && ans >=1 && ans<=4)
    );
}

exports.createOrSaveProfile = async (req,res,next)=>{
    try{

        const userId = req.user._id;
        const { age,dependents,incomeMonthly,answers } = req.body
        
        const existingProfile = await profile.findOne({userId})
        if(existingProfile){
            return res.status(400).json({success:false,message:'Profile Already Exists..!'})
        }

        // Validation for data inorder to store valid data in DB
        if(age === undefined || dependents === undefined || incomeMonthly === undefined){
            return res.status(400).json({success:false,message:'Please Give All The Details'})
        }
        if(typeof age!=='number' || typeof dependents!=='number' || typeof incomeMonthly!=='number'){
            return res.status(400).json({success:false,message:'age,dependants,incomeMonthly must be number only..!'})
        }
        if(!validateAnswer(answers)){
            return res.status(400).json({success:false,message:'Please Give Valid Answers..!'})
        }

        const {riskScore,riskLevel} = calculateRisk(answers)
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6

        const newprofile = await profile.create({
            userId,
            age,
            dependents,
            incomeMonthly,
<<<<<<< HEAD
            riskAnswer: answers,
=======
            riskAnswer:answers,
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
            riskScore,
            riskLevel
        })

<<<<<<< HEAD
        return res.status(201).json({ success: true, message: 'Profile created Successfully..!' })

    } catch (err) {
=======
        return res.status(201).json({success:true,message:'Profile created Successfully..!'})

    }catch(err){
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
        // return res.status(500).json({
        //     success:false,
        //     message:err.message
        // })
        next(err);
    }
}

<<<<<<< HEAD
exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const existingprofile = await profile.findOne({ userId })
        if (!existingprofile) {
            return res.status(404).json({ success: false, message: 'Profile not found..!' })
        }

        return res.status(200).json({ success: true, data: existingprofile })
    } catch (err) {
=======
exports.getProfile = async (req,res,next)=>{
    try{
        const userId = req.user._id;
    
        const existingprofile = await profile.findOne({userId})
        if(!existingprofile){
            return res.status(404).json({success:false,message:'Profile not found..!'})
        }

        return res.status(200).json({success:true,data:existingprofile})
    }catch(err){
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
        // return res.status(500).json({
        //     success:false,
        //     message:err.message
        // })
        next(err);
    }
}

<<<<<<< HEAD
exports.editProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { age, dependents, incomeMonthly, answers } = req.body;

        const existprofile = await profile.findOne({ userId })
        if (!existprofile) {
            return res.status(404).json({ success: false, message: 'Profile Not Found' })
        }

        // Validation for data inorder to store valid data in DB
        if (age !== undefined) {
            if (typeof age !== 'number') {
                return res.status(400).json({ success: false, message: 'age must be in number only..!' })
            }
            existprofile.age = age
        }
        if (dependents !== undefined) {
            if (typeof dependents !== 'number') {
                return res.status(400).json({ success: false, message: 'dependents must be in number only..!' })
            }
            existprofile.dependents = dependents
        }
        if (incomeMonthly !== undefined) {
            if (typeof incomeMonthly !== 'number') {
                return res.status(400).json({ success: false, message: 'incomeMonthly must be in number only..!' })
            }
            existprofile.incomeMonthly = incomeMonthly
        }
        if (answers !== undefined) {
            if (!validateAnswer(answers)) {
                return res.status(400).json({ success: false, message: 'Please Give Valid Answers..!' })
            }
            const { riskScore, riskLevel } = calculateRisk(answers)
=======
exports.editProfile = async (req,res,next)=>{  
    try{    
        const userId = req.user._id;
        const { age,dependents,incomeMonthly,answers } = req.body;

        const existprofile = await profile.findOne({userId})
        if(!existprofile){
            return res.status(404).json({success:false,message:'Profile Not Found'})
        }

        // Validation for data inorder to store valid data in DB
        if(age !== undefined){
            if(typeof age!=='number'){
                return res.status(400).json({success:false,message:'age must be in number only..!'})
            }
            existprofile.age = age
        }
        if(dependents !== undefined){
            if(typeof dependents!=='number'){
                return res.status(400).json({success:false,message:'dependents must be in number only..!'})
            }
            existprofile.dependents = dependents
        }
        if(incomeMonthly !== undefined){
            if(typeof incomeMonthly!=='number'){
                return res.status(400).json({success:false,message:'incomeMonthly must be in number only..!'})
            }
            existprofile.incomeMonthly = incomeMonthly
        }
        if(answers!== undefined){
            if(!validateAnswer(answers)){
                return res.status(400).json({success:false,message:'Please Give Valid Answers..!'})
            }
            const {riskScore,riskLevel} = calculateRisk(answers)
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6

            existprofile.riskAnswer = answers
            existprofile.riskScore = riskScore
            existprofile.riskLevel = riskLevel
        }

        await existprofile.save()

<<<<<<< HEAD
        return res.status(200).json({ success: true, message: 'Profile Updated Successfully..!' })

    } catch (err) {
=======
        return res.status(200).json({success:true,message:'Profile Updated Successfully..!'})

    }catch(err){
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
        // return res.status(500).json({
        //     success:false,
        //     message:err.message
        // })
        next(err);
    }
}