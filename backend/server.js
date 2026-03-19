const express = require('express')
const cors = require('cors')
const cookiparser = require('cookie-parser')
const connection = require('./config/connection')
const dotenv = require('dotenv')
const { Globallimiter } = require('./middlewares/RateLimiter')
const auth = require('./routes/AuthRouter')
const profile = require('./routes/ProfileRouter')

dotenv.config()
connection()

// Instnace of Express
const app = express()
app.set('trust proxy',1)

// Middleware
app.use(express.json())
app.use(cors())
app.use(cookiparser())
app.use(Globallimiter)

// Auth Router
app.use('/auth',auth)
app.use('/profile',profile)


const PORT = process.env.PORT || 5000
app.listen(PORT,'0.0.0.0',()=>console.log(`Server Runnig On ${PORT}`))
