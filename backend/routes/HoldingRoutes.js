const express = require("express");
const router = express.Router();
const {
    addHolding,
    getHoldings,
    updateHolding,
    deleteHolding,
    getRecommendations
} = require('../controllers/HoldingController');

const {
    ensureAuthencated,
    AuthorizedRole
} = require("../middlewares/AuthValidation");

router.use(ensureAuthencated, AuthorizedRole("client"));

router.get("/recommendations", getRecommendations);
router.post("/", addHolding);
router.get("/", getHoldings);
router.patch("/:id", updateHolding);
router.delete("/:id", deleteHolding);

module.exports = router;