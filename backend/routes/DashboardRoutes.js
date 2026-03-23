const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/DashboardController');
const {
    ensureAuthencated, 
    AuthorizedRole 
} = require('../middlewares/AuthValidation');


router.get('/', ensureAuthencated, AuthorizedRole('client'), getDashboard);

module.exports = router;