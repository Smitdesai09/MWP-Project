const express = require('express')
const router = express.Router()
const { ensureAuthencated } = require('../middlewares/AuthValidation')

const {
    createGoal,
    editGoal,
    getGoals,
    singleGoal
} = require('../controllers/GoalController')


router.use(ensureAuthencated)

router.post('/', createGoal)
router.patch('/:id', editGoal)
router.get('/', getGoals)
router.get('/:id', singleGoal)

module.exports = router;