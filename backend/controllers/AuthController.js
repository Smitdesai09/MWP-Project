const UserModel = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sendMail = require('../utils/sendMail')

/* ===========================
   REGISTER
=========================== */
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                Success: false,
                message: 'Name, email and password are required'
            })
        }

        const existUser = await UserModel.findOne({ email })

        if (existUser) {
            return res.status(409).json({
                Success: false,
                message: 'User Already Exists..!'
            })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newuser = await UserModel.create({
            name,
            email,
            password: hashPassword,
            role
        })

        return res.status(201).json({
            Success: true,
            message: 'Register Successfully..!',
            user: {
                id: newuser._id,
                name: newuser.name,
                email: newuser.email,
                role: newuser.role
            }
        })

    } catch (err) {
        return res.status(500).json({
            Success: false,
            message: err.message
        })
    }
}

/* ===========================
   LOGIN
=========================== */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                Success: false,
                message: 'Email and password are required'
            })
        }

        const existUser = await UserModel.findOne({ email })

        if (!existUser) {
            return res.status(403).json({
                Success: false,
                message: 'Email or Password Wrong..!'
            })
        }

        const isMatch = await bcrypt.compare(password, existUser.password)

        if (!isMatch) {
            return res.status(403).json({
                Success: false,
                message: 'Email or Password Wrong..!'
            })
        }

        const token = jwt.sign(
            {
                email: existUser.email,
                _id: existUser._id,
                role: existUser.role
            },
            process.env.S_KEY,
            { expiresIn: '28d' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // true in production with https
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        })

        return res.status(200).json({
            Success: true,
            message: 'Login Success',
            token,
            user: {
                id: existUser._id,
                name: existUser.name,
                email: existUser.email,
                role: existUser.role
            }
        })

    } catch (err) {
        return res.status(500).json({
            Success: false,
            message: err.message
        })
    }
}

/* ===========================
   LOGOUT
=========================== */
exports.logout = (req, res) => {
    try {
        res.clearCookie('token')
        return res.status(200).json({
            Success: true,
            message: 'Logout Successfully..!'
        })
    } catch (err) {
        return res.status(500).json({
            Success: false,
            message: err.message
        })
    }
}

/* ===========================
   FORGOT PASSWORD (SECURE)
=========================== */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                Success: false,
                message: 'Email is required'
            })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(404).json({
                Success: false,
                message: 'User not found'
            })
        }

        // 1. Generate random raw token
        const resetToken = crypto.randomBytes(32).toString('hex')

        // 2. Hash token before storing in DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')

        // 3. Save hashed token + expiry in DB (15 mins)
        user.resetPasswordToken = hashedToken
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000

        await user.save()

        // 4. Create reset URL (send RAW token, not hashed)
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

        const html = `
            <h2>Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password.</p>
            <p>Click the button below to reset it. This link will expire in 15 minutes.</p>
            <a href="${resetUrl}" 
               style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
               Reset Password
            </a>
            <p>If you did not request this, please ignore this email.</p>
        `

        await sendMail(user.email, 'Reset Password', html)

        return res.status(200).json({
            Success: true,
            message: 'Password reset link sent to your email'
        })

    } catch (err) {
        return res.status(500).json({
            Success: false,
            message: err.message
        })
    }
}

/* ===========================
   RESET PASSWORD (SECURE)
=========================== */
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body

        if (!password) {
            return res.status(400).json({
                Success: false,
                message: 'New password is required'
            })
        }

        // 1. Hash incoming raw token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        // 2. Find user with valid token and not expired
        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({
                Success: false,
                message: 'Invalid or expired reset token'
            })
        }

        // 3. Update password
        const hashPassword = await bcrypt.hash(password, 10)
        user.password = hashPassword

        // 4. Clear reset token fields (one-time use)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()

        return res.status(200).json({
            Success: true,
            message: 'Password reset successful'
        })

    } catch (err) {
        return res.status(500).json({
            Success: false,
            message: err.message
        })
    }
}


/* ===========================
   GET ME
=========================== */
exports.getMe = async (req, res) => {
    try {
        // req.user = { id, email, role } from JWT
        // fetch from DB to get name since its not in JWT
        const user = await UserModel.findById(req.user.id).select('-password')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}