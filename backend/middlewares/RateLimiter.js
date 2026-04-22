const rateLimit = require('express-rate-limit')

const Loginlimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        Success: false,
        message: "Too Many Login Attempt please try again after 15 minutes"
    }
})

const Globallimiter = rateLimit({
    windowMs: 15*60*1000,
    max:100,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        Success:false,
        message:"Too Many request from this IP please try again later..!"
    }
})

module.exports = {
    Loginlimiter,
    Globallimiter
}