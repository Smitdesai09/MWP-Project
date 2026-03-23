const express = require('express');
const router = express.Router();
const { ensureAuthencated, AuthorizedRole } = require('../middlewares/AuthValidation');
const { getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary
} = require('../controllers/TransactionController');


router.use(ensureAuthencated, AuthorizedRole('client'));

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/summary', getTransactionSummary);

module.exports = router;