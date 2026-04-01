const express = require('express')
const {
  sipCalculator,
  lumpSumCalculator,
  emiCalculator,
  cagrCalculator,
  inflationCalculator,
  retirementCalculator,
  cibilEstimator    
}  = require("../controllers/CalculatorController");

const router = express.Router();

router.post("/sip", sipCalculator);
router.post("/lumpsum", lumpSumCalculator);
router.post("/emi", emiCalculator);
router.post("/cagr", cagrCalculator);
router.post("/inflation", inflationCalculator);
router.post("/retirement", retirementCalculator);
router.post("/cibil", cibilEstimator);

module.exports = router;