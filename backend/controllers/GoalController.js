const goalModel = require('../models/Goal')
const calculation = require('../utils/calculation')

exports.createGoal = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const { name, targetCorpus, horizonyear, excpectedReturnPr, inflationPr, planType, progressCorpus } = req.body;

        if (name === undefined || targetCorpus === undefined || horizonyear === undefined || excpectedReturnPr === undefined || inflationPr === undefined || planType === undefined || progressCorpus === undefined) {
            return res.status(400).json({ success: false, message: 'All feild are required to create a goal' })
        }

        const calculate = calculation({
            targetCorpus,
            horizonyear,
            excpectedReturnPr,
            inflationPr,
            planType,
            progressCorpus: progressCorpus || 0
        })

        const newgoal = await goalModel.create({
            userId,
            name,
            targetCorpus,
            horizonyear,
            excpectedReturnPr,
            inflationPr,
            planType,
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
        const { search, type } = req.query; // <-- type comes from frontend

        const query = { userId };

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        if (type && ['sip', 'lump_sum'].includes(type)) {
            query.planType = type;
        }

        const goals = await goalModel.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: goals.length,
            total: goals.length, // or implement proper pagination total
            totalPage: 1,        // placeholder if no pagination
            data: goals
        });
    } catch (err) {
        next(err);
    }
};

exports.editGoal = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const goal = await goalModel.findOne({ _id: id, userId })
        if (!goal) {
            return res.status(404).json({ success: false, message: 'goal not found' })
        }

        const updatedgoal = {
            name: req.body.name ?? goal.name,
            targetCorpus: req.body.targetCorpus ?? goal.targetCorpus,
            horizonyear: req.body.horizonyear ?? goal.horizonyear,
            excpectedReturnPr: req.body.excpectedReturnPr ?? goal.excpectedReturnPr,
            inflationPr: req.body.inflationPr ?? goal.inflationPr,
            planType: req.body.planType ?? goal.planType,
            progressCorpus: req.body.progressCorpus ?? goal.progressCorpus,
        }

        const recalculate = calculation(updatedgoal)

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
        next(err)
    }
}