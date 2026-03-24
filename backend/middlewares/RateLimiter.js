const rateLimit = require('express-rate-limit')

const Loginlimiter = rateLimit({
<<<<<<< HEAD
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
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        Success: false,
        message: "Too Many request from this IP please try again later..!"
=======
    windowMs : 15*60*1000,
    max:5,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        Success:false,
        message:"Too Many Login Attempt please try again after 15 minutes"
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
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
    }
})

module.exports = {
    Loginlimiter,
    Globallimiter
}