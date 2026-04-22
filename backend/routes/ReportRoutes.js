const express = require("express");
const router = express.Router();
const { ensureAuthencated, AuthorizedRole } = require('../middlewares/AuthValidation');
const { 
    generateCSVTransactions, 
    generateCSVHoldings 
} = require("../controllers/ReportController");

router.use(ensureAuthencated, AuthorizedRole('client'));

// router.get("/pdf", generatePDFStatement);
router.get("/csv/transactions", generateCSVTransactions);
router.get("/csv/holdings", generateCSVHoldings);

module.exports = router;