const jwt = require('jsonwebtoken')

const ensureAuthencated = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ Success: false, message: 'Unothorized User Please First Login.' })
        }
        const decode = jwt.verify(token, process.env.S_KEY)
        req.user = decode;
        // req.user => email,_id,roll
        next();
    } catch (err) {
        return res.status(401).json({ Success: false, message: err.message })
    }
}

const AuthorizedRoll = (...aloowedrole) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ Success: false, message: 'Role Information Missing..!' })
        }
        if (!aloowedrole.includes(req.user.role)) {
            return res.status(401).json({ Success: false, message: 'Access Denied..!' })
        }
        next();
    }
}

module.exports = {
    ensureAuthencated,
    AuthorizedRoll
}