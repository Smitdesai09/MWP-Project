const jwt = require('jsonwebtoken')

const ensureAuthencated = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ Success: false, message: 'Unothorized User Please First Login.' })
        }
        const decode = jwt.verify(token, process.env.S_KEY)
        req.user = decode;
        // req.user => email,_id,role
        next();
    } catch (err) {
        return res.status(401).json({ Success: false, message: err.message })
    }
}

const AuthorizedRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ Success: false, message: 'Role Information Missing..!' })
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(401).json({ Success: false, message: 'Access Denied..!' })
        }
        next();
    }
}

module.exports = {
    ensureAuthencated,
    AuthorizedRole
}