const express = require("express");
const router = express.Router();
const {
    addHolding,
    getHoldings,
    updateHolding,
    deleteHolding,
    getHoldingsSummary
} = require('../controllers/HoldingController');

const {
    ensureAuthencated,
    AuthorizedRole
} = require("../middlewares/AuthValidation");

router.use(ensureAuthencated, AuthorizedRole("client"));


router.post("/", addHolding);
router.get("/", getHoldings);
router.patch("/:id", updateHolding);
router.delete("/:id", deleteHolding);
router.get("/summary", getHoldingsSummary);

module.exports = router;