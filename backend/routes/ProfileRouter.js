const express = require('express')
const router = express.Router()

const {
    createOrSaveProfile,
    getProfile,
    editProfile
} = require('../controllers/ProfileController')

const { ensureAuthencated,AuthorizedRole } = require('../middlewares/AuthValidation')

router.post('/',ensureAuthencated,AuthorizedRole('client'),createOrSaveProfile)
router.get('/',ensureAuthencated,AuthorizedRole('client'),getProfile)
router.patch('/',ensureAuthencated,AuthorizedRole('client'),editProfile)

module.exports = router