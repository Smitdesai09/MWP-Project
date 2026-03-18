const express = require('express')
const router = express.Router()

const { register,login,logout,forgotPassword,resetPassword } = require('../controllers/AuthController')

const { Loginlimiter } = require('../middlewares/RateLimiter')

router.post('/register',register)
router.post('/login',Loginlimiter,login)
router.post('/logout',logout)

router.post('/forgot-password',forgotPassword)
router.post('/reset-password/:token',resetPassword)

module.exports = router;