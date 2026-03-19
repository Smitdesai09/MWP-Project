const express = require('express')
const router = express.Router()

const {
    createOrSaveProfile,
    getProfile,
    editProfile
} = require('../controllers/ProfileController')

const { ensureAuthencated } = require('../middlewares/AuthValidation')

router.post('/',ensureAuthencated,createOrSaveProfile)
router.get('/',ensureAuthencated,getProfile)
router.patch('/',ensureAuthencated,editProfile)

module.exports = router