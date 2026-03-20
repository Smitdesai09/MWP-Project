const profile = require('../models/Profile')

const calculateRisk = (answers)=>{
    const riskScore = answers.reduce((sum,val)=> sum + val ,0)

    let riskLevel = 'low'

    if(riskScore<=5){
        riskLevel = 'low'
    }
    else if(riskScore<=8){
        riskLevel = 'modrate'
    }
    else{
        riskLevel = 'high'
    }
    return { riskScore,riskLevel }
}

exports.createOrSaveProfile = async (req,res)=>{
    try{

        const userId = req.user.id;
        const { age,dependents,incomeMonthly,answers } = req.body
        
        const existingProfile = await profile.findOne({userId})
        if(existingProfile){
            return res.status(400).json({success:false,message:'Profile Already Exists..!'})
        }

        if(!age || !dependents || !incomeMonthly){
            return res.status(400).json({success:false,message:'Please Give All The Details'})
        }

        if(!answers || answers.length !== 4){
            return res.status(400).json({success:false,message:'Exatly 4 answers required..!'})
        }

        const {riskScore,riskLevel} = calculateRisk(answers)

        const newprofile = await profile.create({
            userId:userId,
            age,
            dependents,
            incomeMonthly,
            riskAnswer:answers,
            riskScore,
            riskLevel
        })

        return res.status(201).json({success:true,message:'Profile created Successfully..!'})

    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

exports.getProfile = async (req,res)=>{
    try{
        const userId = req.user.id;
    
        const existingprofile = await profile.findOne({userId})
        if(!existingprofile){
            return res.status(404).json({success:false,message:'Profile not found..!'})
        }

        return res.status(200).json({success:true,data:existingprofile})
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}


exports.editProfile = async (req,res)=>{  
    try{    
        const userId = req.user.id;
        const { age,dependents,incomeMonthly,answers } = req.body;

        const existprofile = await profile.findOne({userId})
        if(!existprofile){
            return res.status(404).json({success:false,message:'Profile Not Found'})
        }

        if(age !== undefined){
            existprofile.age = age
        }
        if(dependents !== undefined){
            existprofile.dependents = dependents
        }
        if(incomeMonthly !== undefined){
            existprofile.incomeMonthly = incomeMonthly
        }

        if(answers!== undefined){
            if(answers.length!== 4){
                return res.status(400).json({success:false,message:'Exatly 4 answers required..!'})
            }

            const {riskScore,riskLevel} = calculateRisk(answers)

            existprofile.riskAnswer = answers
            existprofile.riskScore = riskScore
            existprofile.riskLevel = riskLevel
        }

        await existprofile.save()

        return res.status(200).json({success:true,message:'Profile Updated Successfully..!'})

    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}