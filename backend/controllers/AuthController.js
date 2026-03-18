const UserModel = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existUser = await UserModel.findOne({ email })
        if (existUser) {
            return res.status(409).json({ Success: false, message: 'User Already Exists..!' })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newuser = await UserModel.create({ name, email, password: hashPassword, role })
        if (newuser) {
            return res.status(201).json({
                Success: true,
                message: 'Register Successfully..!',
                // user: {
                //     name: newuser.name,
                //     email: newuser.email,
                //     role: newuser.role
                // }
            })
        }
    } catch (err) {
        return res.status(500).json({ Success: false, message: err.message })
    }
}
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existUser = await UserModel.findOne({ email })
        if (!existUser) {
            return res.status(403).json({ Success: false, message: 'Email or Password Wrong..!' })
        }

        const isMatch = await bcrypt.compare(password, existUser.password)
        if (!isMatch) {
            return res.status(403).json({ Success: false, message: 'Email or Password Wrong..!' })
        }

        const token = jwt.sign(
            { email: existUser.email, id: existUser._id, role: existUser.role },
            process.env.S_KEY,
            { expiresIn: '15m' }
        )

        res.cookie('token', token,
            {
                httpOnly: true,
                secure: false,
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
        return res.status(500).json({ Success: false, message: err.message })
    }
}

exports.logout = (req, res) => {
    try {
        res.clearCookie('token')
        return res.status(200).json({
            Success: true,
            message: 'Logout Successfully..!'
        })
    } catch (err) {
        return res.status(500).json({ Success: false, message: err.message })
    }
}