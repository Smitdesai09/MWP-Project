const express = require('express')
const router = express.Router()
const { ensureAuthencated } = require('../middlewares/AuthValidation')
const { getMe } = require('../controllers/AuthController')

const { register, login, logout, forgotPassword, resetPassword } = require('../controllers/AuthController')

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.get('/me', ensureAuthencated, getMe)  // getMe → return user info based on token

module.exports = router;