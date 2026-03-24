const goalModel = require('../models/Goal')
const calculation = require('../utils/calculation')

<<<<<<< HEAD
exports.createGoal = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const { name, targetCorpus, horizonyear, excpectedReturnPr, inflationPr, planType, progressCorpus } = req.body;

        if (name === undefined || targetCorpus === undefined || horizonyear === undefined || excpectedReturnPr === undefined || inflationPr === undefined || planType === undefined || progressCorpus === undefined) {
            return res.status(400).json({ success: false, message: 'All feild are required to create a goal' })
=======
exports.createGoal = async (req,res,next) =>{
    try{
        const userId = req.user._id;

        const { name,targetCorpus,horizonyear,excpectedReturnPr,inflationPr,planType,progressCorpus } = req.body;

        if( name === undefined || targetCorpus === undefined || horizonyear===undefined || excpectedReturnPr===undefined || inflationPr===undefined || planType===undefined || progressCorpus===undefined){
            return res.status(400).json({success:false,message:'All feild are required to create a goal'})
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
        }

        const calculate = calculation({
            targetCorpus,
            horizonyear,
            excpectedReturnPr,
            inflationPr,
            planType,
<<<<<<< HEAD
            progressCorpus: progressCorpus || 0
=======
            progressCorpus:progressCorpus ||0
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
        })

        const newgoal = await goalModel.create({
            userId,
            name,
            targetCorpus,
            horizonyear,
            excpectedReturnPr,
            inflationPr,
            planType,
<<<<<<< HEAD
            progressCorpus: progressCorpus || 0,
            ...calculate
        })

        return res.status(201).json({ success: true, message: 'Goal Created Succesfully..!', data: newgoal });
    } catch (err) {
        next(err)
    }
}
exports.getGoals = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const goals = await goalModel.find({ userId }).sort({ createdAt: -1 });
        if (!goals) {
            return res.status(404).json({ success: false, message: 'goal not found' })
        }
        return res.status(200).json({ success: true, count: goals.length, data: goals });
    } catch (err) {
        next(err)
    }
}
exports.editGoal = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const goal = await goalModel.findOne({ _id: id, userId })
        if (!goal) {
            return res.status(404).json({ success: false, message: 'goal not found' })
=======
            progressCorpus:progressCorpus ||0,
            ...calculate
        })

        return res.status(201).json({success:true,message:'Goal Created Succesfully..!',data:newgoal});
    }catch(err){
        next(err)
    }
}
exports.getGoals = async (req,res,next) =>{
    try{
        const userId = req.user._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1)*limit;

        const { type,search } = req.query;

        let filter={ userId };

        if(type){
            filter.planType = type;
        }

        if(search){
            filter.name = {$regex:search,$options:'i'}
        }

        const goals = await goalModel.find(filter).skip(skip).limit(limit).sort({createdAt:-1});
        if(!goals){
            return res.status(404).json({success:false,message:'goal not found'})
        }
        
        const total = await goalModel.countDocuments(filter);

        return res.status(200).json({
            success:true,
            page,
            totalPage : Math.ceil(total/limit),
            total,
            data:goals
        });
    }catch(err){
        next(err)
    }
}
exports.editGoal = async (req,res,next) =>{
    try{
        const userId = req.user._id;
        const { id } = req.params;

        const goal = await goalModel.findOne({_id:id,userId})
        if(!goal){
            return res.status(404).json({success:false,message:'goal not found'})
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
        }

        const updatedgoal = {
            name: req.body.name ?? goal.name,
<<<<<<< HEAD
            targetCorpus: req.body.targetCorpus ?? goal.targetCorpus,
            horizonyear: req.body.horizonyear ?? goal.horizonyear,
            excpectedReturnPr: req.body.excpectedReturnPr ?? goal.excpectedReturnPr,
            inflationPr: req.body.inflationPr ?? goal.inflationPr,
            planType: req.body.planType ?? goal.planType,
            progressCorpus: req.body.progressCorpus ?? goal.progressCorpus,
=======
            targetCorpus : req.body.targetCorpus ?? goal.targetCorpus,
            horizonyear : req.body.horizonyear ?? goal.horizonyear,
            excpectedReturnPr : req.body.excpectedReturnPr ?? goal.excpectedReturnPr,
            inflationPr : req.body.inflationPr ?? goal.inflationPr,
            planType : req.body.planType ?? goal.planType,
            progressCorpus:req.body.progressCorpus ?? goal.progressCorpus,
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
        }

        const recalculate = calculation(updatedgoal)

<<<<<<< HEAD
        const editedgoal = await goalModel.findByIdAndUpdate(id, { ...updatedgoal, ...recalculate }, { new: true, runValidators: true })

        return res.status(200).json({ success: true, message: 'goal updated succesfully..!', data: editedgoal })
    } catch (err) {
        next(err)
    }
}
exports.singleGoal = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const goal = await goalModel.findOne({ _id: id, userId })

        if (!goal) {
            return res.status(404).json({ success: false, message: 'goal not found' })
        }
        return res.status(200).json({ success: true, data: goal });
    } catch (err) {
=======
        const editedgoal = await goalModel.findByIdAndUpdate(id,{...updatedgoal,...recalculate},{new:true,runValidators:true})

        return res.status(200).json({success:true,message:'goal updated succesfully..!',data:editedgoal})
    }catch(err){
        next(err)
    }
}
exports.singleGoal = async (req,res,next) =>{
    try{
        const userId = req.user._id;
        const { id } = req.params;

        const goal = await goalModel.findOne({_id:id,userId})

        if(!goal){
            return res.status(404).json({success:false,message:'goal not found'})
        }
        return res.status(200).json({success:true,data:goal});
    }catch(err){
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
        next(err)
    }
}