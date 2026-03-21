const express = require('express')
const router = express.Router()

const { 
    createGoal,
    editGoal,
    getGoals,
    singleGoal 
} = require('../controllers/GoalController')

router.post('/',createGoal)
router.patch('/:id',editGoal)
router.get('/',getGoals)
router.get('/:id',singleGoal)
