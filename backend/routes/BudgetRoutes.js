const express = require('express');
const router = express.Router();
const { updateBudget, addBudget, getBudgets } = require('../controllers/BudgetController');
const { ensureAuthencated, AuthorizedRole } = require('../middlewares/AuthValidation');

router.use( ensureAuthencated, AuthorizedRole('client'));

router.post('/', addBudget);
router.patch('/:id', updateBudget);
router.get('/', getBudgets); 

module.exports = router;